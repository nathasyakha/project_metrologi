import Elysia, { t, status as httpError } from 'elysia';
import { db } from '../db';
import { instruments, instrumentOwners, jenisAlatUttp } from '../db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

export const instrumentRoutes = new Elysia({ prefix: '/instruments', tags: ['Alat Ukur'] })
  .use(authMiddleware)

  // ─── POST /instruments ─────────────────────────────────────────────────────
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

      if (!owner) throw httpError(404, 'Pemilik alat tidak ditemukan');

      if (user.role === 'pemilik_alat' && owner.userId !== user.id) {
        throw httpError(403, 'Akses ditolak: Anda hanya dapat mendaftarkan alat ukur untuk profil Anda sendiri');
      }

      const id = crypto.randomUUID();

      await db.insert(instruments).values({
        id,
        ownerId: body.ownerId,
        jenisAlat: body.jenisAlat,
        brand: body.brand,
        type: body.type ?? null,
        serialNumber: body.serialNumber ?? null,
        capacityValue: body.capacityValue.toString(),
        capacityUnit: body.capacityUnit,
        dayabaca: body.dayabaca.toString(),
        dayabacaUnit: body.dayabacaUnit,
        class: body.class,
        registeredby: user.id,
      });

      const [created] = await db
        .select()
        .from(instruments)
        .where(eq(instruments.id, id))
        .limit(1);

      return { message: 'Alat ukur berhasil didaftarkan', data: created };
    },
    {
      body: t.Object({
        ownerId: t.String(),
        jenisAlat: t.Union(jenisAlatUttp.map((j) => t.Literal(j))),
        brand: t.String(),
        type: t.Optional(t.String()),
        serialNumber: t.Optional(t.String()),
        capacityValue: t.Number(),
        capacityUnit: t.Union([
          t.Literal("kg"),
          t.Literal("L"),
          t.Literal("g"),
          t.Literal("mL")
        ]),
        dayabaca: t.Number(),
        dayabacaUnit: t.Union([
          t.Literal("kg"),
          t.Literal("L"),
          t.Literal("g"),
          t.Literal("mL")
        ]),
        class: t.Union([
          t.Literal("I"),
          t.Literal("II"),
          t.Literal("III"),
          t.Literal("IIII")
        ])
      })
    })

  // ─── GET /instruments ──────────────────────────────────────────────────────
  .get(
    '/',
    async ({ query, user }) => {
      const conditions = [];

      // ⬇️ pemilik_alat cuma bisa lihat alat miliknya sendiri, tidak peduli query.ownerId apa pun
      if (user.role === 'pemilik_alat') {
        const [owner] = await db
          .select()
          .from(instrumentOwners)
          .where(eq(instrumentOwners.userId, user.id))
          .limit(1);

        if (!owner) return { data: [], total: 0 };
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
          capacityValue: instruments.capacityValue,
          capacityUnit: instruments.capacityUnit,
          dayabaca: instruments.dayabaca,
          dayabacaUnit: instruments.dayabacaUnit,
          class: instruments.class,
          registeredAt: instruments.registeredAt,
        })
        .from(instruments)
        .leftJoin(instrumentOwners, eq(instruments.ownerId, instrumentOwners.id))   // ⬅️ TAMBAHAN
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(asc(instrumentOwners.companyName), asc(instruments.jenisAlat));

      return { data: rows, total: rows.length };
    },
    {
      query: t.Object({
        ownerId: t.Optional(t.String({ description: 'Filter by ID pemilik alat' })),
      }),
      detail: { summary: 'List semua alat ukur' },
    }
  )

  // ─── GET /instruments/:id ──────────────────────────────────────────────────
  .get(
    '/:id',
    async ({ params, user }) => {
      const [row] = await db
        .select()
        .from(instruments)
        .where(eq(instruments.id, params.id))
        .limit(1);

      if (!row) throw httpError(404, 'Alat ukur tidak ditemukan');

      // ⬇️ TAMBAHAN: pemilik_alat cuma bisa lihat detail alat miliknya sendiri
      if (user.role === 'pemilik_alat') {
        const [owner] = await db
          .select()
          .from(instrumentOwners)
          .where(eq(instrumentOwners.userId, user.id))
          .limit(1);

        if (!owner || row.ownerId !== owner.id) {
          throw httpError(403, 'Akses ditolak: alat ukur ini bukan milik Anda');
        }
      }

      return { data: row };
    },
    {
      params: t.Object({ id: t.String() }),
      detail: { summary: 'Detail alat ukur berdasarkan ID' },
    }
  )

  // ─── PATCH /instruments/:id ────────────────────────────────────────────────
  .patch(
    '/:id',
    async ({ params, body, user }) => {
      if (!['admin', 'petugas_penera'].includes(user!.role)) {
        throw httpError(403, 'Hanya admin atau petugas_penera yang dapat mengubah data alat');
      }

      const [existing] = await db
        .select()
        .from(instruments)
        .where(eq(instruments.id, params.id))
        .limit(1);

      if (!existing) throw httpError(404, 'Alat ukur tidak ditemukan');

      await db
        .update(instruments)
        .set({
          ...(body.jenisAlat !== undefined && { jenisAlat: body.jenisAlat }),
          ...(body.brand !== undefined && { brand: body.brand }),
          ...(body.type !== undefined && { type: body.type }),
          ...(body.serialNumber !== undefined && { serialNumber: body.serialNumber }),
          ...(body.capacityValue !== undefined && { capacityValue: body.capacityValue.toString() }),
          ...(body.capacityUnit !== undefined && { capacityUnit: body.capacityUnit }),
          ...(body.dayabaca !== undefined && { dayabaca: body.dayabaca.toString() }),
          ...(body.dayabacaUnit !== undefined && { dayabacaUnit: body.dayabacaUnit }),
          ...(body.class !== undefined && { class: body.class }),
        })
        .where(eq(instruments.id, params.id));

      const [updated] = await db
        .select()
        .from(instruments)
        .where(eq(instruments.id, params.id))
        .limit(1);

      return { message: 'Data alat ukur berhasil diperbarui', data: updated };
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        jenisAlat: t.Optional(t.Union(jenisAlatUttp.map((j) => t.Literal(j)))),
        brand: t.Optional(t.String()),
        type: t.Optional(t.String()),
        serialNumber: t.Optional(t.String()),
        capacityValue: t.Optional(t.Number()),
        capacityUnit: t.Optional(t.Union([
          t.Literal("kg"),
          t.Literal("L"),
          t.Literal("g"),
          t.Literal("mL")
        ])),
        dayabaca: t.Optional(t.Number()),
        dayabacaUnit: t.Optional(t.Union([
          t.Literal("kg"),
          t.Literal("L"),
          t.Literal("g"),
          t.Literal("mL")
        ])),
        class: t.Optional(t.Union([
          t.Literal("I"),
          t.Literal("II"),
          t.Literal("III"),
          t.Literal("IIII")
        ]))
      }),
      detail: { summary: 'Update data alat ukur' },
    }
  )

  // ─── DELETE /instruments/:id ───────────────────────────────────────────────
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

      if (!existing) throw httpError(404, 'Alat ukur tidak ditemukan');

      await db.delete(instruments).where(eq(instruments.id, params.id));

      return { message: 'Alat ukur berhasil dihapus' };
    },
    {
      params: t.Object({ id: t.String() }),
      detail: { summary: 'Hapus alat ukur (admin only)' },
    }
  );
