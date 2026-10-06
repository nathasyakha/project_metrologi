import Elysia, { t, status as httpError } from 'elysia';
import { db } from '../db';
import { certificates, testObservations, instruments, instrumentOwners, peneraanApplications } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';
import type { JwtPayload } from '../middleware/auth';

async function assertCertificateOwnership(certificateId: string, user: JwtPayload) {
  if (user.role !== 'pemilik_alat') return; // role lain tidak dibatasi di sini

  const [row] = await db
    .select({ ownerUserId: instrumentOwners.userId })
    .from(certificates)
    .innerJoin(testObservations, eq(certificates.observationId, testObservations.id))
    .innerJoin(instruments, eq(testObservations.instrumentId, instruments.id))
    .innerJoin(instrumentOwners, eq(instruments.ownerId, instrumentOwners.id))
    .where(eq(certificates.id, certificateId))
    .limit(1);

  if (!row || row.ownerUserId !== user.id) {
    throw httpError(403, 'Akses ditolak: sertifikat ini bukan milik Anda');
  }
}

export const certificateRoutes = new Elysia({
  prefix: '/certificates',
  tags: ['Sertifikat'],
})
  .use(authMiddleware)

  // ─── POST /certificates ────────────────────────────────────────────────────
  .post(
    '/',
    async ({ body, user }) => {
      // ── Kondisi 1: Role harus admin atau kepala ──────────────────────────
      if (!['admin', 'kepala'].includes(user!.role)) {
        throw httpError(403, 'Hanya admin atau kepala yang berwenang menerbitkan sertifikat');
      }

      // ── Kondisi 2: Cek hasil pengujian exist ─────────────────────────────
      const [observation] = await db
        .select()
        .from(testObservations)
        .where(eq(testObservations.id, body.observationId))
        .limit(1);

      if (!observation) {
        throw httpError(404, 'Data hasil pengujian tidak ditemukan');
      }

      // ── Kondisi 3: Status pengujian harus PASS (SAH) ─────────────────────
      if (observation.status !== 'SAH') {
        throw httpError(
          422,
          'Sertifikat tidak dapat diterbitkan. Alat ukur dinyatakan BATAL (tidak memenuhi syarat)'
        );
      }

      // ── Kondisi 4: Belum ada sertifikat untuk observationId yang sama ─────
      const [existingCert] = await db
        .select()
        .from(certificates)
        .where(eq(certificates.observationId, body.observationId))
        .limit(1);

      if (existingCert) {
        throw httpError(
          409,
          `Sertifikat sudah pernah diterbitkan untuk pengujian ini (No. ${existingCert.certificateNumber})`
        );
      }

      // ── Kondisi 5: expiryDate harus di masa depan ─────────────────────────
      const expiry = new Date(body.expiryDate);
      const now = new Date();

      if (isNaN(expiry.getTime())) {
        throw httpError(400, 'Format tanggal kadaluarsa tidak valid');
      }

      if (expiry <= now) {
        throw httpError(400, 'Tanggal kadaluarsa sertifikat harus di masa depan');
      }

      // ── Semua kondisi terpenuhi — terbitkan sertifikat ───────────────────
      const id = crypto.randomUUID();
      const year = now.getFullYear();
      const suffix = (crypto.randomUUID().split('-')[0] ?? 'XXXXXXXX').toUpperCase();
      const certificateNumber = body.certificateNumber ?? `CERT-${year}-${suffix}`;

      await db.transaction(async (tx) => {
        await tx.insert(certificates).values({
          id,
          observationId: body.observationId,
          certificateNumber,
          issuedBy: user!.id,
          expiryDate: expiry,
        });

        // ⬇️ TAMBAHAN: cari permohonan yang terhubung ke observation ini, tandai SELESAI
        await tx
          .update(peneraanApplications)
          .set({ status: 'SELESAI' })
          .where(eq(peneraanApplications.testObservationId, body.observationId));
      });

      const [created] = await db
        .select()
        .from(certificates)
        .where(eq(certificates.id, id))
        .limit(1);

      return {
        message: '✅ Sertifikat berhasil diterbitkan',
        data: created,
      };
    },
    {
      body: t.Object({
        observationId: t.String({ description: 'ID hasil pengujian (test_observations.id)' }),
        expiryDate: t.String({
          description: 'Tanggal kadaluarsa sertifikat (ISO 8601). Harus di masa depan.',
          examples: ['2027-09-04T00:00:00.000Z'],
        }),
        certificateNumber: t.Optional(
          t.String({
            description:
              'Nomor sertifikat manual. Jika kosong, akan di-generate otomatis: CERT-YYYY-XXXXXXXX',
          })
        ),
      }),
      detail: {
        summary: 'Terbitkan sertifikat alat ukur',
        description: `
**Kondisi penerbitan sertifikat (semua harus terpenuhi):**

1. Role user adalah \`admin\` atau \`kepala\`
2. Hasil pengujian ditemukan di database
3. Status pengujian adalah **PASS (SAH)**
4. Belum ada sertifikat yang diterbitkan untuk pengujian yang sama
5. \`expiryDate\` harus di masa depan
        `.trim(),
      },
    }
  )

  // ─── GET /certificates/my (Khusus Pemilik Alat) ───────────────────────────
  .get(
    '/my',
    async ({ user }) => {
      const rows = await db
        .select({
          id: certificates.id,
          certificateNumber: certificates.certificateNumber,
          issueDate: certificates.issueDate,
          expiryDate: certificates.expiryDate,
          status: certificates.status,
          createdAt: certificates.createdAt,
          observationId: certificates.observationId,
          instrumentBrand: instruments.brand,
          instrumentType: instruments.type,
          instrumentSerial: instruments.serialNumber,
          companyName: instrumentOwners.companyName,
        })
        .from(certificates)
        .innerJoin(testObservations, eq(certificates.observationId, testObservations.id))
        .innerJoin(instruments, eq(testObservations.instrumentId, instruments.id))
        .innerJoin(instrumentOwners, eq(instruments.ownerId, instrumentOwners.id))
        .where(eq(instrumentOwners.userId, user.id))
        .orderBy(desc(certificates.createdAt));

      return { data: rows, total: rows.length };
    },
    {
      detail: { summary: 'List sertifikat milik pemilik alat yang login' },
    }
  )

  // ─── GET /certificates ─────────────────────────────────────────────────────
  .get(
    '/',
    async ({ query, user }) => {
      // ⬇️ pemilik_alat otomatis dialihkan ke logika /my (cuma lihat miliknya sendiri)
      if (user.role === 'pemilik_alat') {
        const rows = await db
          .select({
            id: certificates.id,
            certificateNumber: certificates.certificateNumber,
            issueDate: certificates.issueDate,
            expiryDate: certificates.expiryDate,
            status: certificates.status,
            createdAt: certificates.createdAt,
            observationId: certificates.observationId,
          })
          .from(certificates)
          .innerJoin(testObservations, eq(certificates.observationId, testObservations.id))
          .innerJoin(instruments, eq(testObservations.instrumentId, instruments.id))
          .innerJoin(instrumentOwners, eq(instruments.ownerId, instrumentOwners.id))
          .where(eq(instrumentOwners.userId, user.id))
          .orderBy(desc(certificates.createdAt));

        return { data: rows, total: rows.length };
      }

      const rows = await db
        .select()
        .from(certificates)
        .where(
          query.observationId ? eq(certificates.observationId, query.observationId) : undefined
        )
        .orderBy(desc(certificates.createdAt));

      return { data: rows, total: rows.length };
    },
    {
      query: t.Object({
        observationId: t.Optional(t.String({ description: 'Filter by ID pengujian' })),
      }),
      detail: { summary: 'List semua sertifikat yang diterbitkan' },
    }
  )

  .get(
    '/:id',
    async ({ params, user }) => {
      const [row] = await db
        .select()
        .from(certificates)
        .where(eq(certificates.id, params.id))
        .limit(1);

      if (!row) throw httpError(404, 'Sertifikat tidak ditemukan');

      await assertCertificateOwnership(row.id, user); // ⬅️ TAMBAHAN

      return { data: row };
    },
    {
      params: t.Object({ id: t.String() }),
      detail: { summary: 'Detail sertifikat berdasarkan ID' },
    }
  )

  .get(
    '/number/:no',
    async ({ params, user }) => {
      const [row] = await db
        .select()
        .from(certificates)
        .where(eq(certificates.certificateNumber, params.no))
        .limit(1);

      if (!row)
        throw httpError(404, `Sertifikat dengan nomor "${params.no}" tidak ditemukan`);

      await assertCertificateOwnership(row.id, user); // ⬅️ TAMBAHAN

      return { data: row };
    },
    {
      params: t.Object({
        no: t.String({ description: 'Nomor sertifikat, misal: CERT-2026-A1B2C3D4' }),
      }),
      detail: { summary: 'Cari sertifikat berdasarkan nomor sertifikat' },
    }
  )

  // ─── HAPUS SERTIFIKAT (Admin only) ──────────────────────────────────────────
  .delete(
    "/:id",
    async ({ params, user, set }) => {
      if (user.role !== "admin") {
        throw httpError(403, "Hanya admin yang dapat menghapus sertifikat");
      }

      const [existing] = await db
        .select()
        .from(certificates)
        .where(eq(certificates.id, params.id))
        .limit(1);

      if (!existing) {
        set.status = 404;
        return { message: "Sertifikat tidak ditemukan" };
      }

      await db.delete(certificates).where(eq(certificates.id, params.id));

      return { message: "Sertifikat berhasil dihapus" };
    },
    {
      params: t.Object({ id: t.String() }),
      detail: { summary: "Hapus sertifikat (admin only)" },
    }
  )


