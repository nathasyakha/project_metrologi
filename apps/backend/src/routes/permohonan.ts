import { Elysia, t, status as httpError } from "elysia";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { db } from "../db";
import {
  peneraanApplications,
  peneraanApplicationInstruments,
  instruments,
  instrumentOwners,
  users,
  testObservations,
  certificates,
  statusPermohonan,
  jenisLayananPeneraan,
  lokasiPeneraan,
  capacityUnit,
  instrumentsMassa,
  pubbmStations,
  instrumentsPubbm,
} from "../db/schema";
import { authMiddleware } from "../middleware/auth";
import type { JwtPayload } from "../middleware/auth";


const jenisAlatMassa = [
  "TIMBANGAN_ELEKTRONIK",
  "TIMBANGAN_MEJA",
  "TIMBANGAN_JEMBATAN",
  "DACIN",
  "TIMBANGAN_PEGAS",
  "TIMBANGAN_SENTISIMAL",
  "TIMBANGAN_BOBOT_INGSUT",
  "NERACA_EMAS",
  "NERACA_OBAT",
  "ANAK_TIMBANGAN",
] as const;

function isAlatMassa(jenisAlat: string): boolean {
  return (jenisAlatMassa as readonly string[]).includes(jenisAlat);
}

export const permohonanRoutes = new Elysia({
  prefix: "/permohonan",
  tags: ["Permohonan Peneraan"],
})
  .use(authMiddleware)

  // ─── 1. BUAT PERMOHONAN PENERAAN ───────────────────────────────────────────
  // Skema 1 (Online - Pemilik) & Skema 2 (Offline - Admin)
  .post(
    "/",
    async ({ body, user }) => {
      const allowedRoles: JwtPayload["role"][] = [
        "admin",
        "petugas_penera",
        "pemilik_alat",
      ];

      if (!allowedRoles.includes(user.role)) {
        throw httpError(403, "Akses ditolak");
      }

      const [owner] = await db
        .select()
        .from(instrumentOwners)
        .where(eq(instrumentOwners.id, body.ownerId))
        .limit(1);

      if (!owner) {
        throw httpError(404, "Data pemilik alat tidak ditemukan");
      }

      if (
        user.role === "pemilik_alat" &&
        owner.userId !== user.id
      ) {
        throw httpError(
          403,
          "Anda hanya dapat mengajukan untuk perusahaan Anda sendiri"
        );
      }

      // Kompatibilitas: terima instrumentIds baru atau instrumentId lama.
      const instrumentIds = [
        ...new Set(
          body.instrumentIds?.length
            ? body.instrumentIds
            : body.instrumentId
              ? [body.instrumentId]
              : []
        ),
      ];

      if (instrumentIds.length === 0) {
        throw httpError(
          400,
          "Pilih minimal satu alat ukur"
        );
      }

      // Pastikan seluruh alat valid dan milik owner yang sama.
      const ownedInstruments = await db
        .select({ id: instruments.id })
        .from(instruments)
        .where(
          and(
            eq(instruments.ownerId, body.ownerId),
            inArray(instruments.id, instrumentIds)
          )
        );

      if (ownedInstruments.length !== instrumentIds.length) {
        throw httpError(
          400,
          "Satu atau lebih alat tidak ditemukan atau bukan milik pemilik ini"
        );
      }
      const ownedIds = new Set(
        ownedInstruments
          .filter((item) => instrumentIds.includes(item.id))
          .map((item) => item.id)
      );

      if (ownedIds.size !== instrumentIds.length) {
        throw httpError(
          400,
          "Satu atau lebih alat tidak ditemukan atau bukan milik pemilik ini"
        );
      }

      const year = new Date().getFullYear();
      const suffix = crypto.randomUUID().slice(0, 8).toUpperCase();

      const applicationId = crypto.randomUUID();
      const applicationNumber = `PERM-${year}-${suffix}`;

      const initialStatus =
        user.role === "admin" ||
          user.role === "petugas_penera"
          ? "DIJADWALKAN" as const
          : "MENUNGGU_VERIFIKASI" as const;

      await db.transaction(async (tx) => {
        // instrumentId lama tetap diisi untuk kompatibilitas.
        await tx.insert(peneraanApplications).values({
          id: applicationId,
          applicationNumber,
          ownerId: body.ownerId,
          instrumentId: instrumentIds[0]!,
          layanan: body.layanan,
          lokasi: body.lokasi,
          status: initialStatus,
          jadwalTanggal: body.jadwalTanggal
            ? new Date(body.jadwalTanggal)
            : null,
          petugasId: body.petugasId ?? null,
          catatan: body.catatan ?? null,
          createdBy: user.id,
        });

        await tx
          .insert(peneraanApplicationInstruments)
          .values(
            instrumentIds.map((instrumentId) => ({
              id: crypto.randomUUID(),
              applicationId,
              instrumentId,
              status: initialStatus,
            }))
          );
      });

      const [created] = await db
        .select()
        .from(peneraanApplications)
        .where(eq(peneraanApplications.id, applicationId))
        .limit(1);

      const details = await db
        .select()
        .from(peneraanApplicationInstruments)
        .where(
          eq(
            peneraanApplicationInstruments.applicationId,
            applicationId
          )
        );

      return {
        message: "Permohonan peneraan berhasil diajukan",
        data: {
          ...created,
          instruments: details,
        },
      };
    },
    {
      body: t.Object({
        ownerId: t.String(),
        instrumentId: t.Optional(t.String()),
        instrumentIds: t.Optional(
          t.Array(t.String(), { minItems: 1 })
        ),
        layanan: t.Union(
          jenisLayananPeneraan.map((j) => t.Literal(j))
        ),
        lokasi: t.Union(
          lokasiPeneraan.map((l) => t.Literal(l))
        ),
        catatan: t.Optional(t.String()),
        jadwalTanggal: t.Optional(
          t.String({ format: "date-time" })
        ),
        petugasId: t.Optional(t.String()),
      }),
      detail: {
        summary: "Pengajuan permohonan peneraan untuk satu atau banyak alat",
      },
    }
  )

  // ─── 2. LIST PERMOHONAN SAYA (Khusus Pemilik Alat) ──────────────────────────

  .get(
    "/my",
    async ({ user }) => {
      const [owner] = await db
        .select()
        .from(instrumentOwners)
        .where(eq(instrumentOwners.userId, user.id))
        .limit(1);

      if (!owner) {
        return {
          data: [],
          total: 0,
          message: "Profil pemilik belum terdaftar",
        };
      }

      const rows = await db
        .select({
          id: peneraanApplications.id,
          applicationNumber:
            peneraanApplications.applicationNumber,
          ownerId: peneraanApplications.ownerId,
          instrumentId: instruments.id,
          layanan: peneraanApplications.layanan,
          lokasi: peneraanApplications.lokasi,
          status: peneraanApplications.status,
          jadwalTanggal: peneraanApplications.jadwalTanggal,
          catatan: peneraanApplications.catatan,
          createdAt: peneraanApplications.createdAt,

          // Identitas alat
          instrumentJenisAlat: instruments.jenisAlat,
          instrumentBrand: instruments.brand,
          instrumentType: instruments.type,
          instrumentSerial: instruments.serialNumber,

          // Detail alat massa
          capacityValue: instrumentsMassa.capacityValue,
          capacityUnit: instrumentsMassa.capacityUnit,
          dayabaca: instrumentsMassa.dayabaca,
          dayabacaUnit: instrumentsMassa.dayabacaUnit,
          class: instrumentsMassa.class,

          // Identitas SPBU
          nomorSPBU: pubbmStations.nomorSPBU,
          stationAddress: pubbmStations.address,

          // Detail PUBBM
          lajuAlirMaksimum:
            instrumentsPubbm.lajuAlirMaksimum,
          lajuAlirMinimum:
            instrumentsPubbm.lajuAlirMinimum,
          jenisCairan: instrumentsPubbm.jenisCairan,
          identifikasiNozzle:
            instrumentsPubbm.identifikasiNozzle,

          // Petugas, hasil, dan sertifikat
          petugasName: users.name,
          testObservationId:
            peneraanApplications.testObservationId,
          observationStatus: testObservations.status,
          certificateId: certificates.id,
          certificateNumber: certificates.certificateNumber,
        })
        .from(peneraanApplications)
        .leftJoin(
          instruments,
          eq(
            peneraanApplications.instrumentId,
            instruments.id
          )
        )
        .leftJoin(
          instrumentsMassa,
          eq(instruments.id, instrumentsMassa.instrumentId)
        )
        .leftJoin(
          instrumentsPubbm,
          eq(instruments.id, instrumentsPubbm.instrumentId)
        )
        .leftJoin(
          pubbmStations,
          eq(
            instrumentsPubbm.stationId,
            pubbmStations.id
          )
        )
        .leftJoin(
          users,
          eq(peneraanApplications.petugasId, users.id)
        )
        .leftJoin(
          testObservations,
          eq(
            peneraanApplications.testObservationId,
            testObservations.id
          )
        )
        .leftJoin(
          certificates,
          eq(certificates.observationId, testObservations.id)
        )
        .where(
          eq(peneraanApplications.ownerId, owner.id)
        )
        .orderBy(
          desc(peneraanApplications.createdAt)
        );

      return {
        data: rows,
        total: rows.length,
      };
    },
    {
      detail: {
        summary:
          "Daftar permohonan milik pemilik beserta detail alat, SPBU, hasil, dan sertifikat",
      },
    }
  )


  // ─── 3. LIST TUGAS SAYA (Khusus Petugas Penera) ─────────────────────────────
  .get(
    "/tugas-saya",
    async ({ user }) => {
      if (!["petugas_penera", "admin", "kepala"].includes(user.role)) {
        throw httpError(403, "Akses ditolak: Hanya untuk petugas penera");
      }

      const rows = await db
        .select({
          id: peneraanApplications.id,
          applicationNumber: peneraanApplications.applicationNumber,
          layanan: peneraanApplications.layanan,
          lokasi: peneraanApplications.lokasi,
          status: peneraanApplications.status,
          jadwalTanggal: peneraanApplications.jadwalTanggal,
          catatan: peneraanApplications.catatan,
          createdAt: peneraanApplications.createdAt,
          companyName: instrumentOwners.companyName,
          companyAddress: instrumentOwners.address,
          companyPhone: instrumentOwners.phone,
          instrumentId: instruments.id,
          instrumentJenisAlat: instruments.jenisAlat,
          instrumentBrand: instruments.brand,
          instrumentType: instruments.type,
          instrumentSerial: instruments.serialNumber,
          capacityValue: instrumentsMassa.capacityValue,
          capacityUnit: instrumentsMassa.capacityUnit,
          dayabaca: instrumentsMassa.dayabaca,
          dayabacaUnit: instrumentsMassa.dayabacaUnit,
          class: instrumentsMassa.class,

          nomorSPBU: pubbmStations.nomorSPBU,
          stationAddress: pubbmStations.address,
          lajuAlirMaksimum: instrumentsPubbm.lajuAlirMaksimum,
          lajuAlirMinimum: instrumentsPubbm.lajuAlirMinimum,
          jenisCairan: instrumentsPubbm.jenisCairan,
          identifikasiNozzle: instrumentsPubbm.identifikasiNozzle,
          testObservationId: peneraanApplications.testObservationId,
        })
        .from(peneraanApplications)
        .leftJoin(instrumentOwners, eq(peneraanApplications.ownerId, instrumentOwners.id))
        .leftJoin(instruments, eq(peneraanApplications.instrumentId, instruments.id))
        .leftJoin(instrumentsMassa, eq(instruments.id, instrumentsMassa.instrumentId))
        .leftJoin(instrumentsPubbm, eq(instruments.id, instrumentsPubbm.instrumentId))
        .leftJoin(pubbmStations, eq(instrumentsPubbm.stationId, pubbmStations.id))
        .where(
          and(
            ["admin", "kepala"].includes(user.role)
              ? undefined
              : eq(peneraanApplications.petugasId, user.id),
            sql`${peneraanApplications.status} IN ('DIJADWALKAN', 'DIPROSES')`
          )
        )
        .orderBy(desc(peneraanApplications.jadwalTanggal));

      return { data: rows, total: rows.length };
    },
    {
      detail: { summary: "Daftar penugasan peneraan untuk petugas yang login" },
    }
  )

  // ─── 4. LIST SEMUA PERMOHONAN (Admin, Kepala, Staf) ─────────────────────────
  .get(
    "/",
    async ({ query, user }) => {
      const allowedRoles: JwtPayload["role"][] = [
        "admin",
        "petugas_penera",
        "kepala",
        "staf",
        "pengamat_tera",
        "pengawas",
      ];
      if (!allowedRoles.includes(user.role)) {
        throw httpError(403, "Akses ditolak");
      }

      const conditions = [];

      if (query.status) {
        conditions.push(eq(peneraanApplications.status, query.status));
      }
      if (query.ownerId) {
        conditions.push(eq(peneraanApplications.ownerId, query.ownerId));
      }
      if (query.petugasId) {
        conditions.push(eq(peneraanApplications.petugasId, query.petugasId));
      }


      const applications = await db
        .select({
          id: peneraanApplications.id,
          applicationNumber: peneraanApplications.applicationNumber,
          ownerId: peneraanApplications.ownerId,
          layanan: peneraanApplications.layanan,
          lokasi: peneraanApplications.lokasi,
          status: peneraanApplications.status,
          jadwalTanggal: peneraanApplications.jadwalTanggal,
          catatan: peneraanApplications.catatan,
          createdAt: peneraanApplications.createdAt,
          companyName: instrumentOwners.companyName,
          petugasName: users.name,
          legacyInstrumentId: peneraanApplications.instrumentId,
          testObservationId: peneraanApplications.testObservationId,
        })
        .from(peneraanApplications)
        .leftJoin(
          instrumentOwners,
          eq(peneraanApplications.ownerId, instrumentOwners.id)
        )
        .leftJoin(
          users,
          eq(peneraanApplications.petugasId, users.id)
        )
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(peneraanApplications.createdAt));

      const applicationIds = applications.map((app) => app.id);

      const detailRows = applicationIds.length
        ? await db
          .select({
            id: peneraanApplicationInstruments.id,
            applicationId: peneraanApplicationInstruments.applicationId,
            instrumentId: instruments.id,
            status: peneraanApplicationInstruments.status,
            jenisAlat: instruments.jenisAlat,
            brand: instruments.brand,
            type: instruments.type,
            serialNumber: instruments.serialNumber,
            capacityValue: instrumentsMassa.capacityValue,
            capacityUnit: instrumentsMassa.capacityUnit,
            dayabaca: instrumentsMassa.dayabaca,
            dayabacaUnit: instrumentsMassa.dayabacaUnit,
            class: instrumentsMassa.class,
            nomorSPBU: pubbmStations.nomorSPBU,
            stationAddress: pubbmStations.address,
            lajuAlirMaksimum: instrumentsPubbm.lajuAlirMaksimum,
            lajuAlirMinimum: instrumentsPubbm.lajuAlirMinimum,
            jenisCairan: instrumentsPubbm.jenisCairan,
            identifikasiNozzle: instrumentsPubbm.identifikasiNozzle,
          })
          .from(peneraanApplicationInstruments)
          .innerJoin(
            instruments,
            eq(peneraanApplicationInstruments.instrumentId, instruments.id)
          )
          .leftJoin(
            instrumentsMassa,
            eq(instruments.id, instrumentsMassa.instrumentId)
          )
          .leftJoin(
            instrumentsPubbm,
            eq(instruments.id, instrumentsPubbm.instrumentId)
          )
          .leftJoin(
            pubbmStations,
            eq(instrumentsPubbm.stationId, pubbmStations.id)
          )
          .where(
            inArray(
              peneraanApplicationInstruments.applicationId,
              applicationIds
            )
          )
        : [];

      const detailsByApplication = new Map<
        string,
        typeof detailRows
      >();

      for (const detail of detailRows) {
        const current = detailsByApplication.get(detail.applicationId) ?? [];
        current.push(detail);
        detailsByApplication.set(detail.applicationId, current);
      }

      const rows = applications.map((app) => {
        const details = detailsByApplication.get(app.id) ?? [];

        return {
          ...app,
          instruments: details,
          // Kompatibilitas sementara untuk frontend lama.
          instrumentId: details[0]?.instrumentId ?? app.legacyInstrumentId,
          instrumentJenisAlat: details[0]?.jenisAlat ?? null,
          instrumentBrand: details[0]?.brand ?? null,
          instrumentType: details[0]?.type ?? null,
          instrumentSerial: details[0]?.serialNumber ?? null,
        };
      });

      return { data: rows, total: rows.length };
    },
    {
      query: t.Object({
        status: t.Optional(t.Union(statusPermohonan.map((s) => t.Literal(s)))),
        ownerId: t.Optional(t.String()),
        petugasId: t.Optional(t.String()),
      }),
      detail: { summary: "List seluruh permohonan peneraan" },
    }
  )

  // ─── 5. DETAIL PERMOHONAN ───────────────────────────────────────────────────
  .get(
    "/:id",
    async ({ params, set, user }) => {
      const [app] = await db
        .select({
          id: peneraanApplications.id,
          applicationNumber: peneraanApplications.applicationNumber,
          ownerId: peneraanApplications.ownerId,
          instrumentId: peneraanApplications.instrumentId,
          layanan: peneraanApplications.layanan,
          lokasi: peneraanApplications.lokasi,
          status: peneraanApplications.status,
          jadwalTanggal: peneraanApplications.jadwalTanggal,
          catatan: peneraanApplications.catatan,
          petugasId: peneraanApplications.petugasId,
          testObservationId: peneraanApplications.testObservationId,
          createdBy: peneraanApplications.createdBy,
          createdAt: peneraanApplications.createdAt,
          updatedAt: peneraanApplications.updatedAt,
          companyName: instrumentOwners.companyName,
          companyAddress: instrumentOwners.address,
          companyPhone: instrumentOwners.phone,
          ownerUserId: instrumentOwners.userId,
          instrumentJenisAlat: instruments.jenisAlat,
          instrumentBrand: instruments.brand,
          instrumentType: instruments.type,
          instrumentSerial: instruments.serialNumber,
          capacityValue: instrumentsMassa.capacityValue,
          capacityUnit: instrumentsMassa.capacityUnit,
          dayabaca: instrumentsMassa.dayabaca,
          dayabacaUnit: instrumentsMassa.dayabacaUnit,
          class: instrumentsMassa.class,

          nomorSPBU: pubbmStations.nomorSPBU,
          stationAddress: pubbmStations.address,
          lajuAlirMaksimum: instrumentsPubbm.lajuAlirMaksimum,
          lajuAlirMinimum: instrumentsPubbm.lajuAlirMinimum,
          jenisCairan: instrumentsPubbm.jenisCairan,
          identifikasiNozzle: instrumentsPubbm.identifikasiNozzle,
          petugasName: users.name,
        })
        .from(peneraanApplications)
        .leftJoin(instrumentOwners, eq(peneraanApplications.ownerId, instrumentOwners.id))
        .leftJoin(instruments, eq(peneraanApplications.instrumentId, instruments.id))
        .leftJoin(users, eq(peneraanApplications.petugasId, users.id))
        .leftJoin(instrumentsMassa, eq(instruments.id, instrumentsMassa.instrumentId))
        .leftJoin(instrumentsPubbm, eq(instruments.id, instrumentsPubbm.instrumentId))
        .leftJoin(pubbmStations, eq(instrumentsPubbm.stationId, pubbmStations.id))
        .where(eq(peneraanApplications.id, params.id))
        .limit(1);

      if (!app) {
        set.status = 404;
        return { message: "Permohonan tidak ditemukan" };
      }

      // Validasi akses pemilik alat
      if (user.role === "pemilik_alat" && app.ownerUserId !== user.id) {
        throw httpError(403, "Akses ditolak: Anda tidak memiliki akses ke permohonan ini");
      }

      // Ambil data cerapan dan sertifikat jika ada
      let observation = null;
      let certificate = null;

      if (app.testObservationId) {
        const [obs] = await db
          .select()
          .from(testObservations)
          .where(eq(testObservations.id, app.testObservationId))
          .limit(1);
        observation = obs ?? null;

        if (obs) {
          const [cert] = await db
            .select()
            .from(certificates)
            .where(eq(certificates.observationId, obs.id))
            .limit(1);
          certificate = cert ?? null;
        }
      }

      return {
        data: {
          ...app,
          observation,
          certificate,
        },
      };
    },
    {
      params: t.Object({ id: t.String() }),
      detail: { summary: "Detail permohonan peneraan" },
    }
  )
  .post(
    "/offline",

    async ({ body, user, set }) => {
      const allowedRoles: JwtPayload["role"][] = [
        "admin",
        "petugas_penera",
      ];

      if (!allowedRoles.includes(user.role)) {
        throw httpError(403, "Akses ditolak");
      }

      // Validasi pemilik.
      let ownerId: string;

      if (body.ownerId) {
        const [owner] = await db
          .select()
          .from(instrumentOwners)
          .where(eq(instrumentOwners.id, body.ownerId))
          .limit(1);

        if (!owner) {
          set.status = 404;
          return { message: "Pemilik yang dipilih tidak ditemukan" };
        }

        ownerId = owner.id;
      } else {
        if (
          !body.companyName?.trim() ||
          !body.address?.trim() ||
          !body.phone?.trim()
        ) {
          throw httpError(
            400,
            "Nama perusahaan, alamat, dan telepon wajib diisi"
          );
        }

        ownerId = crypto.randomUUID();
      }

      // Format baru: instruments[].
      // Format lama tetap diterima untuk kompatibilitas.
      const legacyInstrument = {
        instrumentId: body.instrumentId,
        jenisAlat: body.jenisAlat,
        brand: body.brand,
        type: body.type,
        serialNumber: body.serialNumber,
        nomorSPBU: body.nomorSPBU,
        stationAddress: body.stationAddress,
        lajuAlirMaksimum: body.lajuAlirMaksimum,
        lajuAlirMinimum: body.lajuAlirMinimum,
        jenisCairan: body.jenisCairan,
        identifikasiNozzle: body.identifikasiNozzle,
        capacityValue: body.capacityValue,
        capacityUnit: body.capacityUnit,
        dayabaca: body.dayabaca,
        dayabacaUnit: body.dayabacaUnit,
        class: body.class,
      };

      const requestedInstruments = body.instruments?.length
        ? body.instruments
        : [legacyInstrument];

      if (requestedInstruments.length === 0) {
        throw httpError(400, "Minimal satu alat harus dipilih");
      }

      // Cegah ID alat yang sama dimasukkan dua kali.
      const selectedIds = requestedInstruments
        .map((item) => item.instrumentId)
        .filter((id): id is string => Boolean(id));

      if (new Set(selectedIds).size !== selectedIds.length) {
        throw httpError(400, "Alat yang sama tidak boleh dipilih dua kali");
      }

      const applicationId = crypto.randomUUID();
      const year = new Date().getFullYear();
      const suffix = crypto.randomUUID().slice(0, 8).toUpperCase();
      const applicationNumber = `PERM-${year}-${suffix}`;

      const resolvedInstrumentIds: string[] = [];

      // Pemilik, semua alat, permohonan, dan detailnya disimpan atomik.
      await db.transaction(async (tx) => {
        if (!body.ownerId) {
          await tx.insert(instrumentOwners).values({
            id: ownerId,
            userId: null,
            companyName: body.companyName!.trim(),
            address: body.address!.trim(),
            phone: body.phone!.trim(),
          });
        }

        for (const item of requestedInstruments) {
          // A. Alat yang sudah terdaftar.
          if (item.instrumentId) {
            const [existingInstrument] = await tx
              .select()
              .from(instruments)
              .where(eq(instruments.id, item.instrumentId))
              .limit(1);

            if (!existingInstrument) {
              throw httpError(
                404,
                `Alat ${item.instrumentId} tidak ditemukan`
              );
            }

            if (existingInstrument.ownerId !== ownerId) {
              throw httpError(
                400,
                "Salah satu alat bukan milik pemilik yang dipilih"
              );
            }

            resolvedInstrumentIds.push(existingInstrument.id);
            continue;
          }

          // B. Alat baru.
          if (!item.jenisAlat || !item.brand?.trim()) {
            throw httpError(
              400,
              "Jenis alat dan merek wajib diisi untuk alat baru"
            );
          }

          const isMassa = isAlatMassa(item.jenisAlat);
          const isPubbm = item.jenisAlat === "POMPA_UKUR_BBM";

          if (isMassa) {
            if (
              item.capacityValue == null ||
              !item.capacityUnit ||
              item.dayabaca == null ||
              !item.dayabacaUnit ||
              !item.class
            ) {
              throw httpError(
                400,
                "Spesifikasi kapasitas, daya baca, satuan, dan kelas alat massa wajib diisi"
              );
            }

            if (item.capacityValue <= 0 || item.dayabaca <= 0) {
              throw httpError(
                400,
                "Kapasitas dan daya baca harus lebih besar dari nol"
              );
            }
          }

          if (isPubbm) {
            if (
              item.lajuAlirMaksimum != null &&
              item.lajuAlirMaksimum <= 0
            ) {
              throw httpError(
                400,
                "Laju alir maksimum harus lebih besar dari nol"
              );
            }

            if (
              item.lajuAlirMinimum != null &&
              item.lajuAlirMinimum <= 0
            ) {
              throw httpError(
                400,
                "Laju alir minimum harus lebih besar dari nol"
              );
            }

            if (
              item.lajuAlirMinimum != null &&
              item.lajuAlirMaksimum != null &&
              item.lajuAlirMinimum > item.lajuAlirMaksimum
            ) {
              throw httpError(
                400,
                "Laju alir minimum tidak boleh melebihi laju alir maksimum"
              );
            }

            if (
              !item.lajuAlirMinimum &&
              item.lajuAlirMinimum !== 0
            ) {
              // Minimum boleh tidak diisi jika memang opsional.
              // Validasi profil SPBU tetap dilakukan di bawah.
            }
          }

          const instrumentId = crypto.randomUUID();

          await tx.insert(instruments).values({
            id: instrumentId,
            ownerId,
            jenisAlat: item.jenisAlat,
            brand: item.brand.trim(),
            type: item.type ?? null,
            serialNumber: item.serialNumber ?? null,
            registeredby: user.id,
          });

          // Simpan detail massa.
          if (isMassa) {
            await tx.insert(instrumentsMassa).values({
              id: crypto.randomUUID(),
              instrumentId,
              capacityValue: String(item.capacityValue),
              capacityUnit: item.capacityUnit!,
              dayabaca: String(item.dayabaca),
              dayabacaUnit: item.dayabacaUnit!,
              class: item.class!,
            });
          }

          // Simpan detail PUBBM dan gunakan satu profil SPBU
          // untuk owner yang sama.
          if (isPubbm) {
            let [station] = await tx
              .select()
              .from(pubbmStations)
              .where(eq(pubbmStations.ownerId, ownerId))
              .limit(1);

            let stationId: string;

            if (station) {
              if (
                item.nomorSPBU &&
                station.nomorSPBU !== item.nomorSPBU.trim()
              ) {
                throw httpError(
                  400,
                  "Nomor SPBU tidak sesuai dengan profil pemilik"
                );
              }

              stationId = station.id;
            } else {
              if (
                !item.nomorSPBU?.trim() ||
                !item.stationAddress?.trim()
              ) {
                throw httpError(
                  400,
                  "Nomor SPBU dan alamat wajib diisi untuk SPBU baru"
                );
              }

              stationId = crypto.randomUUID();

              await tx.insert(pubbmStations).values({
                id: stationId,
                ownerId,
                nomorSPBU: item.nomorSPBU.trim(),
                address: item.stationAddress.trim(),
              });
            }

            await tx.insert(instrumentsPubbm).values({
              id: crypto.randomUUID(),
              instrumentId,
              stationId,
              lajuAlirMaksimum:
                item.lajuAlirMaksimum != null
                  ? String(item.lajuAlirMaksimum)
                  : null,
              lajuAlirMinimum:
                item.lajuAlirMinimum != null
                  ? String(item.lajuAlirMinimum)
                  : null,
              jenisCairan: item.jenisCairan ?? null,
              identifikasiNozzle: item.identifikasiNozzle ?? null,
            });
          }

          resolvedInstrumentIds.push(instrumentId);
        }

        if (resolvedInstrumentIds.length === 0) {
          throw httpError(400, "Tidak ada alat yang berhasil diproses");
        }

        // Record induk tetap menyimpan alat pertama untuk kompatibilitas lama.
        await tx.insert(peneraanApplications).values({
          id: applicationId,
          applicationNumber,
          ownerId,
          instrumentId: resolvedInstrumentIds[0]!,
          layanan: body.layanan,
          lokasi: body.lokasi,
          status: "DIJADWALKAN",
          jadwalTanggal: body.jadwalTanggal
            ? new Date(body.jadwalTanggal)
            : null,
          petugasId: body.petugasId ?? null,
          catatan: body.catatan ?? null,
          createdBy: user.id,
        });

        // Setiap alat memiliki record detail dan status sendiri.
        await tx
          .insert(peneraanApplicationInstruments)
          .values(
            resolvedInstrumentIds.map((instrumentId) => ({
              id: crypto.randomUUID(),
              applicationId,
              instrumentId,
              status: "DIJADWALKAN" as const,
            }))
          );
      });

      const [created] = await db
        .select()
        .from(peneraanApplications)
        .where(eq(peneraanApplications.id, applicationId))
        .limit(1);

      const details = await db
        .select()
        .from(peneraanApplicationInstruments)
        .where(
          eq(
            peneraanApplicationInstruments.applicationId,
            applicationId
          )
        );

      return {
        message: "Registrasi offline berhasil",
        data: {
          ...created,
          instruments: details,
        },
      };
    },
    {
      body: t.Object({
        // Pemilik: isi salah satu — ownerId (existing) ATAU 3 field baru
        ownerId: t.Optional(t.String()),
        companyName: t.Optional(t.String()),
        address: t.Optional(t.String()),
        phone: t.Optional(t.String()),

        // Alat: isi salah satu — instrumentId (existing) ATAU field baru
        instrumentId: t.Optional(t.String()),
        jenisAlat: t.Optional(
          t.Union([
            t.Literal("TIMBANGAN_ELEKTRONIK"),
            t.Literal("TIMBANGAN_MEJA"),
            t.Literal("TIMBANGAN_JEMBATAN"),
            t.Literal("DACIN"),
            t.Literal("TIMBANGAN_PEGAS"),
            t.Literal("TIMBANGAN_SENTISIMAL"),
            t.Literal("TIMBANGAN_BOBOT_INGSUT"),
            t.Literal("NERACA_EMAS"),
            t.Literal("NERACA_OBAT"),
            t.Literal("POMPA_UKUR_BBM"),
            t.Literal("METER_AIR"),
            t.Literal("METER_KWH"),
            t.Literal("ANAK_TIMBANGAN"),
          ])
        ),
        brand: t.Optional(t.String()),
        type: t.Optional(t.String()),
        serialNumber: t.Optional(t.String()),

        // Identitas SPBU dan spesifikasi PUBBM
        nomorSPBU: t.Optional(t.String()),
        stationAddress: t.Optional(t.String()),
        lajuAlirMaksimum: t.Optional(t.Number()),
        lajuAlirMinimum: t.Optional(t.Number()),
        jenisCairan: t.Optional(t.String()),
        identifikasiNozzle: t.Optional(t.String()),

        capacityValue: t.Optional(t.Number()),
        capacityUnit: t.Optional(t.Union(capacityUnit.map((c) => t.Literal(c)))),
        dayabaca: t.Optional(t.Number()),
        dayabacaUnit: t.Optional(t.Union(capacityUnit.map((c) => t.Literal(c)))),
        class: t.Optional(t.Union([t.Literal("I"), t.Literal("II"), t.Literal("III"), t.Literal("IIII")])),

        // Permohonan
        layanan: t.Union(jenisLayananPeneraan.map((j) => t.Literal(j))),
        lokasi: t.Union(lokasiPeneraan.map((l) => t.Literal(l))),
        jadwalTanggal: t.Optional(t.String({ format: "date-time" })),
        petugasId: t.Optional(t.String()),
        catatan: t.Optional(t.String()),


        instruments: t.Optional(
          t.Array(
            t.Object({
              instrumentId: t.Optional(t.String()),
              jenisAlat: t.Optional(
                t.Union([
                  t.Literal("TIMBANGAN_ELEKTRONIK"),
                  t.Literal("TIMBANGAN_MEJA"),
                  t.Literal("TIMBANGAN_JEMBATAN"),
                  t.Literal("DACIN"),
                  t.Literal("TIMBANGAN_PEGAS"),
                  t.Literal("TIMBANGAN_SENTISIMAL"),
                  t.Literal("TIMBANGAN_BOBOT_INGSUT"),
                  t.Literal("NERACA_EMAS"),
                  t.Literal("NERACA_OBAT"),
                  t.Literal("POMPA_UKUR_BBM"),
                  t.Literal("METER_AIR"),
                  t.Literal("METER_KWH"),
                  t.Literal("ANAK_TIMBANGAN"),
                ])
              ),
              brand: t.Optional(t.String()),
              type: t.Optional(t.String()),
              serialNumber: t.Optional(t.String()),
              nomorSPBU: t.Optional(t.String()),
              stationAddress: t.Optional(t.String()),
              lajuAlirMaksimum: t.Optional(t.Number()),
              lajuAlirMinimum: t.Optional(t.Number()),
              jenisCairan: t.Optional(t.String()),
              identifikasiNozzle: t.Optional(t.String()),
              capacityValue: t.Optional(t.Number()),
              capacityUnit: t.Optional(
                t.Union(capacityUnit.map((c) => t.Literal(c)))
              ),
              dayabaca: t.Optional(t.Number()),
              dayabacaUnit: t.Optional(
                t.Union(capacityUnit.map((c) => t.Literal(c)))
              ),
              class: t.Optional(
                t.Union([
                  t.Literal("I"),
                  t.Literal("II"),
                  t.Literal("III"),
                  t.Literal("IIII"),
                ])
              ),
            })
          )
        ),

      }),
      detail: {
        summary: "Registrasi peneraan offline — gabungan pemilik + alat + permohonan dalam 1 form",
      },
    }
  )
  // ─── 6. ADMIN MENINJAU & MENJADWALKAN (Skema 1 Langkah 2) ───────────────────
  .patch(
    "/:id/jadwal",
    async ({ params, body, user, set }) => {
      if (!["admin", "kepala"].includes(user.role)) {
        throw httpError(403, "Hanya admin atau kepala yang dapat menjadwalkan permohonan");
      }

      const [existing] = await db
        .select()
        .from(peneraanApplications)
        .where(eq(peneraanApplications.id, params.id))
        .limit(1);

      if (!existing) {
        set.status = 404;
        return { message: "Permohonan tidak ditemukan" };
      }

      // Update jadwal & petugas
      await db
        .update(peneraanApplications)
        .set({
          status: body.status,
          ...(body.jadwalTanggal && { jadwalTanggal: new Date(body.jadwalTanggal) }),
          ...(body.petugasId !== undefined && { petugasId: body.petugasId }),
          ...(body.catatan !== undefined && { catatan: body.catatan }),
        })
        .where(eq(peneraanApplications.id, params.id));

      const [updated] = await db
        .select()
        .from(peneraanApplications)
        .where(eq(peneraanApplications.id, params.id))
        .limit(1);

      return {
        message:
          body.status === "DIJADWALKAN"
            ? "Permohonan berhasil dijadwalkan & petugas telah ditugaskan"
            : `Status permohonan diperbarui menjadi ${body.status}`,
        data: updated,
      };
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        status: t.Union([
          t.Literal("DIJADWALKAN"),
          t.Literal("DITOLAK"),
          t.Literal("MENUNGGU_VERIFIKASI"),
        ]),
        jadwalTanggal: t.Optional(t.String({ format: "date-time" })),
        petugasId: t.Optional(t.String({ description: "ID Petugas Penera yang ditugaskan" })),
        catatan: t.Optional(t.String({ description: "Catatan admin atau alasan penolakan" })),
      }),
      detail: { summary: "Peninjauan, penjadwalan & penugasan petugas oleh Admin" },
    }
  )

  // ─── 7. UPDATE STATUS OPERASIONAL & LINK OBSERVATION ───────────────────────
  .patch(
    "/:id/status",
    async ({ params, body, user, set }) => {
      const allowedRoles: JwtPayload["role"][] = ["admin", "petugas_penera"];
      if (!allowedRoles.includes(user.role)) {
        throw httpError(403, "Akses ditolak");
      }

      const [existing] = await db
        .select()
        .from(peneraanApplications)
        .where(eq(peneraanApplications.id, params.id))
        .limit(1);

      if (!existing) {
        set.status = 404;
        return { message: "Permohonan tidak ditemukan" };
      }

      if (user.role === "petugas_penera" && existing.petugasId !== user.id) {
        throw httpError(403, "Akses ditolak: permohonan ini tidak ditugaskan kepada Anda");
      }

      await db
        .update(peneraanApplications)
        .set({
          status: body.status,
          ...(body.testObservationId !== undefined && { testObservationId: body.testObservationId }),
          ...(body.catatan !== undefined && { catatan: body.catatan }),
        })
        .where(eq(peneraanApplications.id, params.id));

      const [updated] = await db
        .select()
        .from(peneraanApplications)
        .where(eq(peneraanApplications.id, params.id))
        .limit(1);

      return {
        message: "Status permohonan berhasil diperbarui",
        data: updated,
      };
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        status: t.Union(statusPermohonan.map((s) => t.Literal(s))),
        testObservationId: t.Optional(t.String()),
        catatan: t.Optional(t.String()),
      }),
      detail: { summary: "Update status pelaksanaan permohonan dan link ke hasil cerapan" },
    }
  )

  .post(
    "/:id/hasil",
    async ({ params, body, user, set }) => {
      const allowedRoles: JwtPayload["role"][] = [
        "admin",
        "petugas_penera",
      ];

      if (!allowedRoles.includes(user.role)) {
        throw httpError(403, "Akses ditolak");
      }

      const [existing] = await db
        .select()
        .from(peneraanApplications)
        .where(eq(peneraanApplications.id, params.id))
        .limit(1);

      if (!existing) {
        set.status = 404;
        return { message: "Permohonan tidak ditemukan" };
      }

      if (
        user.role === "petugas_penera" &&
        existing.petugasId !== user.id
      ) {
        throw httpError(
          403,
          "Permohonan ini tidak ditugaskan kepada Anda"
        );
      }

      // Permohonan induk boleh tetap DIJADWALKAN atau
      // DIPROSES selama masih ada alat yang belum diuji.
      if (
        existing.status !== "DIJADWALKAN" &&
        existing.status !== "DIPROSES"
      ) {
        throw httpError(
          400,
          `Hasil tidak dapat diinput pada status ${existing.status}`
        );
      }

      // Validasi bahwa detail alat benar-benar milik permohonan ini.
      const [detail] = await db
        .select()
        .from(peneraanApplicationInstruments)
        .where(
          and(
            eq(
              peneraanApplicationInstruments.id,
              body.applicationInstrumentId
            ),
            eq(
              peneraanApplicationInstruments.applicationId,
              params.id
            )
          )
        )
        .limit(1);

      if (!detail) {
        set.status = 404;
        return {
          message: "Detail alat tidak ditemukan pada permohonan ini",
        };
      }

      if (detail.status !== "DIJADWALKAN") {
        throw httpError(
          400,
          `Hasil alat ini sudah diproses atau statusnya ${detail.status}`
        );
      }

      const observationId = crypto.randomUUID();

      const detailStatus =
        body.status === "SAH"
          ? "DIPROSES"
          : "TIDAK_LULUS_UJI";

      await db.transaction(async (tx) => {
        // Simpan hasil pengujian untuk alat yang dipilih.
        await tx.insert(testObservations).values({
          id: observationId,
          instrumentId: detail.instrumentId,
          applicationInstrumentId: detail.id,
          inspectorId: user.id,
          observationData: body.observationData,
          status: body.status,
        });

        // Perbarui status hanya pada detail alat tersebut.
        await tx
          .update(peneraanApplicationInstruments)
          .set({ status: detailStatus })
          .where(
            and(
              eq(peneraanApplicationInstruments.id, detail.id),
              eq(
                peneraanApplicationInstruments.applicationId,
                params.id
              )
            )
          );

        // Ambil semua status detail setelah hasil disimpan.
        const details = await tx
          .select({
            id: peneraanApplicationInstruments.id,
            status: peneraanApplicationInstruments.status,
          })
          .from(peneraanApplicationInstruments)
          .where(
            eq(
              peneraanApplicationInstruments.applicationId,
              params.id
            )
          );

        const allResultsEntered = details.every(
          (item) =>
            item.status !== "DIJADWALKAN" &&
            item.status !== "MENUNGGU_VERIFIKASI"
        );

        // Permohonan induk baru diperbarui ke status akhir
        // pengujian setelah semua detail alat selesai diuji.
        if (allResultsEntered) {
          const hasFailure = details.some(
            (item) => item.status === "TIDAK_LULUS_UJI"
          );

          await tx
            .update(peneraanApplications)
            .set({
              status: hasFailure
                ? "TIDAK_LULUS_UJI"
                : "DIPROSES",

              // Kompatibilitas untuk permohonan dengan satu alat.
              ...(details.length === 1
                ? { testObservationId: observationId }
                : {}),
            })
            .where(
              eq(peneraanApplications.id, params.id)
            );
        } else if (details.length === 1) {
          // Pertahankan perilaku lama untuk permohonan satu alat.
          await tx
            .update(peneraanApplications)
            .set({
              status: detailStatus,
              testObservationId: observationId,
            })
            .where(
              eq(peneraanApplications.id, params.id)
            );
        }
      });

      const [updatedApp] = await db
        .select()
        .from(peneraanApplications)
        .where(eq(peneraanApplications.id, params.id))
        .limit(1);

      return {
        message:
          body.status === "SAH"
            ? "Hasil pengujian alat tersimpan"
            : "Alat tidak lulus uji",
        data: {
          application: updatedApp,
          applicationInstrumentId: detail.id,
          instrumentId: detail.instrumentId,
          observationId,
          instrumentStatus: detailStatus,
        },
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        applicationInstrumentId: t.String({
          description:
            "ID detail alat dari peneraan_application_instruments",
        }),
        status: t.Union([
          t.Literal("SAH"),
          t.Literal("BATAL"),
        ]),
        observationData: t.Record(
          t.String(),
          t.Any(),
          {
            description:
              "Data pengujian dinamis sesuai jenis alat",
          }
        ),
      }),
      detail: {
        summary:
          "Input hasil pengujian per alat dalam satu permohonan",
      },
    }
  )


  // ─── HAPUS PERMOHONAN (Admin only) ──────────────────────────────────────────
  .delete(
    "/:id",
    async ({ params, user, set }) => {
      if (user.role !== "admin") {
        throw httpError(403, "Hanya admin yang dapat menghapus permohonan");
      }

      const [existing] = await db
        .select()
        .from(peneraanApplications)
        .where(eq(peneraanApplications.id, params.id))
        .limit(1);

      if (!existing) {
        set.status = 404;
        return { message: "Permohonan tidak ditemukan" };
      }

      // Cegah hapus permohonan yang sudah punya sertifikat terbit — data resmi tidak boleh hilang begitu saja
      if (existing.testObservationId) {
        const [cert] = await db
          .select({ id: certificates.id })
          .from(certificates)
          .where(eq(certificates.observationId, existing.testObservationId))
          .limit(1);

        if (cert) {
          throw httpError(
            400,
            "Permohonan ini sudah memiliki sertifikat terbit dan tidak dapat dihapus. Hapus sertifikatnya terlebih dahulu."
          );
        }
      }

      await db.delete(peneraanApplications).where(eq(peneraanApplications.id, params.id));

      return { message: "Permohonan berhasil dihapus" };
    },
    {
      params: t.Object({ id: t.String() }),
      detail: { summary: "Hapus permohonan (admin only; ditolak jika sudah punya sertifikat terbit)" },
    }
  )

  // ─── EDIT PERMOHONAN (Admin only, cuma untuk yang belum final) ──────────────
  .patch(
    "/:id/edit",
    async ({ params, body, user, set }) => {
      if (user.role !== "admin") {
        throw httpError(403, "Hanya admin yang dapat mengedit permohonan");
      }

      const [existing] = await db
        .select()
        .from(peneraanApplications)
        .where(eq(peneraanApplications.id, params.id))
        .limit(1);

      if (!existing) {
        set.status = 404;
        return { message: "Permohonan tidak ditemukan" };
      }

      const terminalStatuses = ["SELESAI", "TIDAK_LULUS_UJI", "DITOLAK"];
      if (terminalStatuses.includes(existing.status)) {
        throw httpError(
          400,
          `Permohonan berstatus ${existing.status} sudah final dan tidak dapat diedit`
        );
      }

      await db
        .update(peneraanApplications)
        .set({
          ...(body.layanan !== undefined && { layanan: body.layanan }),
          ...(body.lokasi !== undefined && { lokasi: body.lokasi }),
          ...(body.jadwalTanggal !== undefined && { jadwalTanggal: body.jadwalTanggal ? new Date(body.jadwalTanggal) : null }),
          ...(body.petugasId !== undefined && { petugasId: body.petugasId }),
          ...(body.catatan !== undefined && { catatan: body.catatan }),
        })
        .where(eq(peneraanApplications.id, params.id));

      const [updated] = await db
        .select()
        .from(peneraanApplications)
        .where(eq(peneraanApplications.id, params.id))
        .limit(1);

      return { message: "Permohonan berhasil diperbarui", data: updated };
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        layanan: t.Optional(t.Union(jenisLayananPeneraan.map((j) => t.Literal(j)))),
        lokasi: t.Optional(t.Union(lokasiPeneraan.map((l) => t.Literal(l)))),
        jadwalTanggal: t.Optional(t.String({ format: "date-time" })),
        petugasId: t.Optional(t.String()),
        catatan: t.Optional(t.String()),
      }),
      detail: { summary: "Edit data dasar permohonan (admin only, ditolak jika sudah final)" },
    }
  )