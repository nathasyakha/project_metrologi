
import Elysia, { t, status as httpError } from 'elysia';
import { db } from '../db';
import {
  instruments,
  instrumentsMassa,
  instrumentsPubbm,
  pubbmStations,
  instrumentOwners,
  jenisAlatUttp,
  capacityUnit,
} from '../db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

const jenisAlatMassa = [
  'TIMBANGAN_ELEKTRONIK',
  'TIMBANGAN_MEJA',
  'TIMBANGAN_JEMBATAN',
  'DACIN',
  'TIMBANGAN_PEGAS',
  'TIMBANGAN_SENTISIMAL',
  'TIMBANGAN_BOBOT_INGSUT',
  'NERACA_EMAS',
  'NERACA_OBAT',
  'ANAK_TIMBANGAN',
] as const;

function isAlatMassa(jenisAlat: string) {
  return (jenisAlatMassa as readonly string[]).includes(jenisAlat);
}

function parseDecimal(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const result = Number(value);
  return Number.isFinite(result) ? result : null;
}

const satuanSchema = t.Union(
  capacityUnit.map((unit) => t.Literal(unit))
);

const kelasSchema = t.Union([
  t.Literal('I'),
  t.Literal('II'),
  t.Literal('III'),
  t.Literal('IIII'),
]);

const instrumentBodySchema = t.Object({
  ownerId: t.String(),
  jenisAlat: t.Union(jenisAlatUttp.map((j) => t.Literal(j))),
  brand: t.String(),
  type: t.Optional(t.String()),
  serialNumber: t.Optional(t.String()),

  // Khusus instrumen massa.
  capacityValue: t.Optional(t.Number()),
  capacityUnit: t.Optional(satuanSchema),
  dayabaca: t.Optional(t.Number()),
  dayabacaUnit: t.Optional(satuanSchema),
  class: t.Optional(kelasSchema),

  // Khusus Pompa Ukur BBM.
  nomorSPBU: t.Optional(t.String()),
  stationAddress: t.Optional(t.String()),
  lajuAlirMaksimum: t.Optional(t.Number()),
  lajuAlirMinimum: t.Optional(t.Number()),
  jenisCairan: t.Optional(t.String()),
  identifikasiNozzle: t.Optional(t.String()),
});

export const instrumentRoutes = new Elysia({
  prefix: '/instruments',
  tags: ['Alat Ukur'],
})
  .use(authMiddleware)

  // =========================================================
  // POST /instruments
  // Membuat identitas alat dan detail berdasarkan jenis alat.
  // =========================================================
  .post(
    '/',
    async ({ body, user }) => {
      if (!['admin', 'petugas_penera', 'pemilik_alat'].includes(user!.role)) {
        throw httpError(403, 'Akses ditolak');
      }

      const [owner] = await db
        .select()
        .from(instrumentOwners)
        .where(eq(instrumentOwners.id, body.ownerId))
        .limit(1);

      if (!owner) {
        throw httpError(404, 'Pemilik alat tidak ditemukan');
      }

      if (user!.role === 'pemilik_alat' && owner.userId !== user!.id) {
        throw httpError(
          403,
          'Anda hanya dapat mendaftarkan alat untuk profil Anda sendiri'
        );
      }

      const jenisAlat = body.jenisAlat;
      const massa = isAlatMassa(jenisAlat);
      const pubbm = jenisAlat === 'POMPA_UKUR_BBM';

      // Validasi detail massa.
      if (massa) {
        if (
          body.capacityValue === undefined ||
          body.capacityUnit === undefined ||
          body.dayabaca === undefined ||
          body.dayabacaUnit === undefined ||
          body.class === undefined
        ) {
          throw httpError(
            400,
            'Kapasitas, satuan kapasitas, daya baca, satuan daya baca, dan kelas wajib diisi untuk alat massa'
          );
        }

        if (
          body.capacityValue <= 0 ||
          body.dayabaca <= 0
        ) {
          throw httpError(
            400,
            'Kapasitas dan daya baca harus lebih besar dari nol'
          );
        }
      }

      // Validasi detail PUBBM.
      if (pubbm) {
        if (
          !body.nomorSPBU?.trim() ||
          !body.stationAddress?.trim()
        ) {
          throw httpError(
            400,
            'Nomor SPBU dan alamat SPBU wajib diisi untuk Pompa Ukur BBM'
          );
        }

        const maxFlow = parseDecimal(body.lajuAlirMaksimum);
        const minFlow = parseDecimal(body.lajuAlirMinimum);

        if (
          maxFlow !== null &&
          minFlow !== null &&
          (maxFlow <= 0 || minFlow <= 0 || minFlow > maxFlow)
        ) {
          throw httpError(
            400,
            'Laju alir harus positif dan laju minimum tidak boleh melebihi laju maksimum'
          );
        }
      }

      const id = crypto.randomUUID();

      const created = await db.transaction(async (tx) => {
        // 1. Simpan identitas umum.
        await tx.insert(instruments).values({
          id,
          ownerId: body.ownerId,
          jenisAlat,
          brand: body.brand,
          type: body.type ?? null,
          serialNumber: body.serialNumber ?? null,
          registeredby: user!.id,
        });

        // 2. Detail instrumen massa.
        if (massa) {
          await tx.insert(instrumentsMassa).values({
            id: crypto.randomUUID(),
            instrumentId: id,
            capacityValue: String(body.capacityValue),
            capacityUnit: body.capacityUnit!,
            dayabaca: String(body.dayabaca),
            dayabacaUnit: body.dayabacaUnit!,
            class: body.class!,
          });
        }

        // 3. Detail Pompa Ukur BBM dan profil SPBU.
        if (pubbm) {
          const [existingStation] = await tx
            .select()
            .from(pubbmStations)
            .where(eq(pubbmStations.ownerId, body.ownerId))
            .limit(1);

          let stationId: string;

          if (existingStation) {
            // Satu owner hanya mempunyai satu nomor SPBU.
            if (
              existingStation.nomorSPBU !== body.nomorSPBU!.trim()
            ) {
              throw httpError(
                409,
                'Owner sudah memiliki SPBU dengan nomor berbeda. Gunakan nomor SPBU yang terdaftar.'
              );
            }

            stationId = existingStation.id;

            // Alamat dapat diperbarui pada profil SPBU yang sama.
            await tx
              .update(pubbmStations)
              .set({
                address: body.stationAddress!.trim(),
              })
              .where(eq(pubbmStations.id, stationId));
          } else {
            stationId = crypto.randomUUID();

            await tx.insert(pubbmStations).values({
              id: stationId,
              ownerId: body.ownerId,
              nomorSPBU: body.nomorSPBU!.trim(),
              address: body.stationAddress!.trim(),
            });
          }

          await tx.insert(instrumentsPubbm).values({
            id: crypto.randomUUID(),
            instrumentId: id,
            stationId,
            lajuAlirMaksimum:
              body.lajuAlirMaksimum === undefined
                ? null
                : String(body.lajuAlirMaksimum),
            lajuAlirMinimum:
              body.lajuAlirMinimum === undefined
                ? null
                : String(body.lajuAlirMinimum),
            jenisCairan: body.jenisCairan ?? null,
            identifikasiNozzle: body.identifikasiNozzle ?? null,
          });
        }

        return id;
      });

      return {
        message: 'Alat ukur berhasil didaftarkan',
        data: { id: created },
      };
    },
    {
      body: instrumentBodySchema,
      detail: { summary: 'Registrasi alat ukur' },
    }
  )

  // =========================================================
  // GET /instruments
  // Mengembalikan identitas dan detail teknis alat.
  // =========================================================
  .get(
    '/',
    async ({ query, user }) => {
      const conditions: any[] = [];

      if (user!.role === 'pemilik_alat') {
        const [owner] = await db
          .select()
          .from(instrumentOwners)
          .where(eq(instrumentOwners.userId, user!.id))
          .limit(1);

        if (!owner) {
          return { data: [], total: 0 };
        }

        conditions.push(eq(instruments.ownerId, owner.id));
      } else if (query.ownerId) {
        conditions.push(eq(instruments.ownerId, query.ownerId));
      }

      const rows = await db
        .select({
          id: instruments.id,
          ownerId: instruments.ownerId,
          ownerName: instrumentOwners.companyName,
          jenisAlat: instruments.jenisAlat,
          brand: instruments.brand,
          type: instruments.type,
          serialNumber: instruments.serialNumber,
          registeredAt: instruments.registeredAt,

          capacityValue: instrumentsMassa.capacityValue,
          capacityUnit: instrumentsMassa.capacityUnit,
          dayabaca: instrumentsMassa.dayabaca,
          dayabacaUnit: instrumentsMassa.dayabacaUnit,
          class: instrumentsMassa.class,

          stationId: pubbmStations.id,
          nomorSPBU: pubbmStations.nomorSPBU,
          stationAddress: pubbmStations.address,

          lajuAlirMaksimum: instrumentsPubbm.lajuAlirMaksimum,
          lajuAlirMinimum: instrumentsPubbm.lajuAlirMinimum,
          jenisCairan: instrumentsPubbm.jenisCairan,
          identifikasiNozzle: instrumentsPubbm.identifikasiNozzle,
        })
        .from(instruments)
        .leftJoin(
          instrumentOwners,
          eq(instruments.ownerId, instrumentOwners.id)
        )
        .leftJoin(
          instrumentsMassa,
          eq(instrumentsMassa.instrumentId, instruments.id)
        )
        .leftJoin(
          instrumentsPubbm,
          eq(instrumentsPubbm.instrumentId, instruments.id)
        )
        .leftJoin(
          pubbmStations,
          eq(instrumentsPubbm.stationId, pubbmStations.id)
        )
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(
          asc(instrumentOwners.companyName),
          asc(instruments.jenisAlat)
        );

      return { data: rows, total: rows.length };
    },
    {
      query: t.Object({
        ownerId: t.Optional(t.String()),
      }),
      detail: { summary: 'Daftar alat ukur beserta detail teknis' },
    }
  )

  // =========================================================
  // GET /instruments/:id
  // =========================================================
  .get(
    '/:id',
    async ({ params, user }) => {
      const [row] = await db
        .select({
          id: instruments.id,
          ownerId: instruments.ownerId,
          jenisAlat: instruments.jenisAlat,
          brand: instruments.brand,
          type: instruments.type,
          serialNumber: instruments.serialNumber,
          registeredAt: instruments.registeredAt,

          capacityValue: instrumentsMassa.capacityValue,
          capacityUnit: instrumentsMassa.capacityUnit,
          dayabaca: instrumentsMassa.dayabaca,
          dayabacaUnit: instrumentsMassa.dayabacaUnit,
          class: instrumentsMassa.class,

          stationId: pubbmStations.id,
          nomorSPBU: pubbmStations.nomorSPBU,
          stationAddress: pubbmStations.address,

          lajuAlirMaksimum: instrumentsPubbm.lajuAlirMaksimum,
          lajuAlirMinimum: instrumentsPubbm.lajuAlirMinimum,
          jenisCairan: instrumentsPubbm.jenisCairan,
          identifikasiNozzle: instrumentsPubbm.identifikasiNozzle,
        })
        .from(instruments)
        .leftJoin(
          instrumentsMassa,
          eq(instrumentsMassa.instrumentId, instruments.id)
        )
        .leftJoin(
          instrumentsPubbm,
          eq(instrumentsPubbm.instrumentId, instruments.id)
        )
        .leftJoin(
          pubbmStations,
          eq(instrumentsPubbm.stationId, pubbmStations.id)
        )
        .where(eq(instruments.id, params.id))
        .limit(1);

      if (!row) {
        throw httpError(404, 'Alat ukur tidak ditemukan');
      }

      if (user!.role === 'pemilik_alat') {
        const [owner] = await db
          .select()
          .from(instrumentOwners)
          .where(eq(instrumentOwners.userId, user!.id))
          .limit(1);

        if (!owner || row.ownerId !== owner.id) {
          throw httpError(403, 'Alat ukur ini bukan milik Anda');
        }
      }

      return { data: row };
    },
    {
      params: t.Object({ id: t.String() }),
      detail: { summary: 'Detail alat ukur beserta detail teknis' },
    }
  )

  // =========================================================
  // PATCH /instruments/:id
  // Memperbarui identitas dan detail pada tabel yang sesuai.
  // =========================================================
  .patch(
    '/:id',
    async ({ params, body, user }) => {
      if (!['admin', 'petugas_penera'].includes(user!.role)) {
        throw httpError(
          403,
          'Hanya admin atau petugas penera yang dapat mengubah data alat'
        );
      }

      const [existing] = await db
        .select()
        .from(instruments)
        .where(eq(instruments.id, params.id))
        .limit(1);

      if (!existing) {
        throw httpError(404, 'Alat ukur tidak ditemukan');
      }

      // Perubahan jenis alat tidak dilakukan lewat PATCH biasa,
      // karena detail dan relasi teknisnya berbeda.
      if (
        body.jenisAlat !== undefined &&
        body.jenisAlat !== existing.jenisAlat
      ) {
        throw httpError(
          400,
          'Perubahan jenis alat harus melalui proses migrasi detail khusus'
        );
      }

      const massa = isAlatMassa(existing.jenisAlat);
      const pubbm = existing.jenisAlat === 'POMPA_UKUR_BBM';

      if (massa) {
        const [detail] = await db
          .select()
          .from(instrumentsMassa)
          .where(eq(instrumentsMassa.instrumentId, params.id))
          .limit(1);

        if (
          !detail &&
          (
            body.capacityValue === undefined ||
            body.capacityUnit === undefined ||
            body.dayabaca === undefined ||
            body.dayabacaUnit === undefined ||
            body.class === undefined
          )
        ) {
          throw httpError(
            400,
            'Detail massa belum tersedia. Kirim seluruh data teknis massa untuk membuat detailnya.'
          );
        }
      }

      await db.transaction(async (tx) => {
        await tx
          .update(instruments)
          .set({
            ...(body.brand !== undefined && { brand: body.brand }),
            ...(body.type !== undefined && { type: body.type }),
            ...(body.serialNumber !== undefined && {
              serialNumber: body.serialNumber,
            }),
          })
          .where(eq(instruments.id, params.id));

        if (massa) {
          const [detail] = await tx
            .select()
            .from(instrumentsMassa)
            .where(eq(instrumentsMassa.instrumentId, params.id))
            .limit(1);

          const values = {
            ...(body.capacityValue !== undefined && {
              capacityValue: String(body.capacityValue),
            }),
            ...(body.capacityUnit !== undefined && {
              capacityUnit: body.capacityUnit,
            }),
            ...(body.dayabaca !== undefined && {
              dayabaca: String(body.dayabaca),
            }),
            ...(body.dayabacaUnit !== undefined && {
              dayabacaUnit: body.dayabacaUnit,
            }),
            ...(body.class !== undefined && { class: body.class }),
          };

          if (detail) {
            if (Object.keys(values).length) {
              await tx
                .update(instrumentsMassa)
                .set(values)
                .where(eq(instrumentsMassa.instrumentId, params.id));
            }
          } else {
            await tx.insert(instrumentsMassa).values({
              id: crypto.randomUUID(),
              instrumentId: params.id,
              capacityValue: String(body.capacityValue!),
              capacityUnit: body.capacityUnit!,
              dayabaca: String(body.dayabaca!),
              dayabacaUnit: body.dayabacaUnit!,
              class: body.class!,
            });
          }
        }

        if (pubbm) {
          const [detail] = await tx
            .select()
            .from(instrumentsPubbm)
            .where(eq(instrumentsPubbm.instrumentId, params.id))
            .limit(1);

          if (detail) {
            const values = {
              ...(body.lajuAlirMaksimum !== undefined && {
                lajuAlirMaksimum: String(body.lajuAlirMaksimum),
              }),
              ...(body.lajuAlirMinimum !== undefined && {
                lajuAlirMinimum: String(body.lajuAlirMinimum),
              }),
              ...(body.jenisCairan !== undefined && {
                jenisCairan: body.jenisCairan,
              }),
              ...(body.identifikasiNozzle !== undefined && {
                identifikasiNozzle: body.identifikasiNozzle,
              }),
            };

            if (Object.keys(values).length) {
              await tx
                .update(instrumentsPubbm)
                .set(values)
                .where(eq(instrumentsPubbm.instrumentId, params.id));
            }
          }
        }
      });

      return {
        message: 'Data alat ukur berhasil diperbarui',
        data: { id: params.id },
      };
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Partial(
        t.Omit(instrumentBodySchema, ['ownerId'])
      ),
      detail: { summary: 'Perbarui identitas dan detail alat ukur' },
    }
  )

  // =========================================================
  // DELETE /instruments/:id
  // =========================================================
  .delete(
    '/:id',
    async ({ params, user }) => {
      if (user!.role !== 'admin') {
        throw httpError(403, 'Hanya admin yang dapat menghapus alat ukur');
      }

      const [existing] = await db
        .select()
        .from(instruments)
        .where(eq(instruments.id, params.id))
        .limit(1);

      if (!existing) {
        throw httpError(404, 'Alat ukur tidak ditemukan');
      }

      await db.transaction(async (tx) => {
        await tx
          .delete(instrumentsMassa)
          .where(eq(instrumentsMassa.instrumentId, params.id));

        await tx
          .delete(instrumentsPubbm)
          .where(eq(instrumentsPubbm.instrumentId, params.id));

        // Profil SPBU tidak dihapus karena dipakai bersama oleh
        // alat PUBBM lain milik owner yang sama.
        await tx
          .delete(instruments)
          .where(eq(instruments.id, params.id));
      });

      return { message: 'Alat ukur berhasil dihapus' };
    },
    {
      params: t.Object({ id: t.String() }),
      detail: { summary: 'Hapus alat ukur (admin only)' },
    }
  );
