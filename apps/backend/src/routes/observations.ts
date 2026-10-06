import Elysia, { t, status as httpError } from 'elysia';
import { db } from '../db';
import { testObservations, instruments, instrumentOwners } from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

export const observationRoutes = new Elysia({
  prefix: '/observations',
  tags: ['Cerapan Pengujian'],
})
  .use(authMiddleware)

  // ─── POST /observations ────────────────────────────────────────────────────
  .post(
    '/',
    async ({ body, user }) => {
      if (!['admin', 'petugas_penera'].includes(user!.role)) {
        throw httpError(403, 'Hanya petugas penera atau admin yang dapat mencatat pengujian');
      }

      const [instrument] = await db
        .select()
        .from(instruments)
        .where(eq(instruments.id, body.instrumentId))
        .limit(1);

      if (!instrument) throw httpError(404, 'Alat ukur tidak ditemukan');

      const id = crypto.randomUUID();

      await db.insert(testObservations).values({
        id,
        instrumentId: body.instrumentId,
        inspectorId: user!.id,
        observationData: body.observationData,
        status: body.status,
      });

      const [created] = await db
        .select()
        .from(testObservations)
        .where(eq(testObservations.id, id))
        .limit(1);

      return {
        message: `Hasil pengujian berhasil dicatat. Status: ${body.status === 'SAH' ? '✅ SAH' : '❌ BATAL'}`,
        data: created,
      };
    },
    {
      body: t.Object({
        instrumentId: t.String({ description: 'ID alat ukur yang diuji' }),
        status: t.Union([t.Literal('SAH'), t.Literal('BATAL')]),
        observationData: t.Record(t.String(), t.Any(), {
          description:
            'Data pengujian dinamis sesuai jenis alat. Contoh: { "beban_1": "10kg", "deviasi": "0.02" }',
        }),
      }),
      detail: { summary: 'Catat hasil pengujian alat ukur' },
    }
  )

  // ─── GET /observations ─────────────────────────────────────────────────────
  .get(
    '/',
    async ({ query, user }) => {
      // ⬇️ pemilik_alat cuma bisa lihat cerapan dari alat miliknya sendiri
      if (user.role === 'pemilik_alat') {
        const [owner] = await db
          .select()
          .from(instrumentOwners)
          .where(eq(instrumentOwners.userId, user.id))
          .limit(1);

        if (!owner) return { data: [], total: 0 };

        const rows = await db
          .select({
            id: testObservations.id,
            instrumentId: testObservations.instrumentId,
            inspectorId: testObservations.inspectorId,
            observationData: testObservations.observationData,
            status: testObservations.status,
            testedAt: testObservations.testedAt,
            createdAt: testObservations.createdAt,
          })
          .from(testObservations)
          .innerJoin(instruments, eq(testObservations.instrumentId, instruments.id))
          .where(
            and(
              eq(instruments.ownerId, owner.id),
              query.instrumentId ? eq(testObservations.instrumentId, query.instrumentId) : undefined
            )
          )
          .orderBy(desc(testObservations.createdAt));

        return { data: rows, total: rows.length };
      }

      const rows = await db
        .select()
        .from(testObservations)
        .where(
          query.instrumentId ? eq(testObservations.instrumentId, query.instrumentId) : undefined
        )
        .orderBy(desc(testObservations.createdAt));

      return { data: rows, total: rows.length };
    },
    {
      query: t.Object({
        instrumentId: t.Optional(t.String({ description: 'Filter by ID alat ukur' })),
      }),
      detail: { summary: 'List semua hasil pengujian' },
    }
  )

  .get(
    '/:id',
    async ({ params, user }) => {
      const [row] = await db
        .select()
        .from(testObservations)
        .where(eq(testObservations.id, params.id))
        .limit(1);

      if (!row) throw httpError(404, 'Data pengujian tidak ditemukan');

      // ⬇️ TAMBAHAN: pemilik_alat cuma bisa lihat cerapan dari alat miliknya
      if (user.role === 'pemilik_alat') {
        const [instrument] = await db
          .select()
          .from(instruments)
          .where(eq(instruments.id, row.instrumentId))
          .limit(1);

        const [owner] = await db
          .select()
          .from(instrumentOwners)
          .where(eq(instrumentOwners.userId, user.id))
          .limit(1);

        if (!instrument || !owner || instrument.ownerId !== owner.id) {
          throw httpError(403, 'Akses ditolak: data pengujian ini bukan milik alat Anda');
        }
      }

      return { data: row };
    },
    {
      params: t.Object({ id: t.String() }),
      detail: { summary: 'Detail hasil pengujian berdasarkan ID' },
    }
  )

  // ─── PATCH /observations/:id ───────────────────────────────────────────────
  .patch(
    '/:id',
    async ({ params, body, user }) => {
      if (user!.role !== 'admin') {
        throw httpError(403, 'Hanya admin yang dapat melakukan koreksi data pengujian');
      }

      const [existing] = await db
        .select()
        .from(testObservations)
        .where(eq(testObservations.id, params.id))
        .limit(1);

      if (!existing) throw httpError(404, 'Data pengujian tidak ditemukan');

      await db
        .update(testObservations)
        .set({
          ...(body.status && { status: body.status }),
          ...(body.observationData && { observationData: body.observationData }),
        })
        .where(eq(testObservations.id, params.id));

      const [updated] = await db
        .select()
        .from(testObservations)
        .where(eq(testObservations.id, params.id))
        .limit(1);

      return { message: 'Data pengujian berhasil dikoreksi', data: updated };
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        status: t.Optional(t.Union([t.Literal('SAH'), t.Literal('BATAL')])),
        observationData: t.Optional(t.Record(t.String(), t.Any())),
      }),
      detail: { summary: 'Koreksi data pengujian (admin only)' },
    }
  );
