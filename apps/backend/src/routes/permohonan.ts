import { Elysia, t, status as httpError } from "elysia";
import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "../db";
import {
  peneraanApplications,
  instruments,
  instrumentOwners,
  users,
  testObservations,
  certificates,
  statusPermohonan,
  jenisLayananPeneraan,
  lokasiPeneraan,
  capacityUnit,
} from "../db/schema";
import { authMiddleware } from "../middleware/auth";
import type { JwtPayload } from "../middleware/auth";

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
      const allowedRoles: JwtPayload["role"][] = ["admin", "petugas_penera", "pemilik_alat"];
      if (!allowedRoles.includes(user.role)) {
        throw httpError(403, "Akses ditolak");
      }

      // 1. Validasi Pemilik Alat
      const [owner] = await db
        .select()
        .from(instrumentOwners)
        .where(eq(instrumentOwners.id, body.ownerId))
        .limit(1);

      if (!owner) throw httpError(404, "Data pemilik alat tidak ditemukan");

      // Jika role pemilik_alat, pastikan hanya bisa mendaftarkan untuk profilnya sendiri
      if (user.role === "pemilik_alat" && owner.userId !== user.id) {
        throw httpError(403, "Akses ditolak: Anda hanya dapat mengajukan untuk perusahaan Anda sendiri");
      }

      // 2. Validasi Alat Ukur
      const [instrument] = await db
        .select()
        .from(instruments)
        .where(and(eq(instruments.id, body.instrumentId), eq(instruments.ownerId, body.ownerId)))
        .limit(1);

      if (!instrument) {
        throw httpError(404, "Alat ukur tidak ditemukan atau tidak sesuai dengan data pemilik");
      }

      // 3. Generate Nomor Permohonan
      const year = new Date().getFullYear();
      const randomSuffix = (crypto.randomUUID().split("-")[0] ?? "XXXX").toUpperCase();
      const applicationNumber = `PERM-${year}-${randomSuffix}`;
      const id = crypto.randomUUID();

      const initialStatus = ["admin", "petugas_penera"].includes(user.role)
        ? "DIJADWALKAN"
        : "MENUNGGU_VERIFIKASI";

      await db.insert(peneraanApplications).values({
        id,
        applicationNumber,
        ownerId: body.ownerId,
        instrumentId: body.instrumentId,
        layanan: body.layanan,
        lokasi: body.lokasi,
        status: initialStatus,
        jadwalTanggal: body.jadwalTanggal ? new Date(body.jadwalTanggal) : null,
        petugasId: body.petugasId ?? null,
        catatan: body.catatan ?? null,
        createdBy: user.id,
      });

      const [created] = await db
        .select()
        .from(peneraanApplications)
        .where(eq(peneraanApplications.id, id))
        .limit(1);

      return {
        message: "Permohonan peneraan berhasil diajukan",
        data: created,
      };
    },
    {
      body: t.Object({
        ownerId: t.String({ description: "ID Profil Pemilik Alat" }),
        instrumentId: t.String({ description: "ID Alat Ukur" }),
        layanan: t.Union(jenisLayananPeneraan.map((j) => t.Literal(j))),
        lokasi: t.Union(lokasiPeneraan.map((l) => t.Literal(l))),
        catatan: t.Optional(t.String()),
        jadwalTanggal: t.Optional(t.String({ format: "date-time" })),
        petugasId: t.Optional(t.String()),
      }),
      detail: { summary: "Pengajuan permohonan peneraan (Online/Offline)" },
    }
  )

  // ─── 2. LIST PERMOHONAN SAYA (Khusus Pemilik Alat) ──────────────────────────
  .get(
    "/my",
    async ({ user }) => {
      // Ambil ownerId yang berelasi dengan akun user yang sedang login
      const [owner] = await db
        .select()
        .from(instrumentOwners)
        .where(eq(instrumentOwners.userId, user.id))
        .limit(1);

      if (!owner) {
        return { data: [], message: "Profil pemilik belum terdaftar" };
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
          instrumentJenisAlat: instruments.jenisAlat,
          instrumentBrand: instruments.brand,
          instrumentType: instruments.type,
          instrumentSerial: instruments.serialNumber,
          petugasName: users.name,
          certificateId: certificates.id,
          certificateNumber: certificates.certificateNumber,
          observationStatus: testObservations.status,
        })
        .from(peneraanApplications)
        .leftJoin(instruments, eq(peneraanApplications.instrumentId, instruments.id))
        .leftJoin(users, eq(peneraanApplications.petugasId, users.id))
        .leftJoin(testObservations, eq(peneraanApplications.testObservationId, testObservations.id))
        .leftJoin(certificates, eq(certificates.observationId, testObservations.id))
        .where(eq(peneraanApplications.ownerId, owner.id))
        .orderBy(desc(peneraanApplications.createdAt));

      return { data: rows, total: rows.length };
    },
    {
      detail: { summary: "Daftar permohonan peneraan milik user yang sedang login" },
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
          capacityValue: instruments.capacityValue,
          capacityUnit: instruments.capacityUnit,
          dayabaca: instruments.dayabaca,
          dayabacaUnit: instruments.dayabacaUnit,
          class: instruments.class,
          testObservationId: peneraanApplications.testObservationId,
        })
        .from(peneraanApplications)
        .leftJoin(instrumentOwners, eq(peneraanApplications.ownerId, instrumentOwners.id))
        .leftJoin(instruments, eq(peneraanApplications.instrumentId, instruments.id))
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
          instrumentId: instruments.id,
          instrumentJenisAlat: instruments.jenisAlat,
          instrumentBrand: instruments.brand,
          instrumentType: instruments.type,
          instrumentSerial: instruments.serialNumber,
          capacityValue: instruments.capacityValue,
          capacityUnit: instruments.capacityUnit,
          dayabaca: instruments.dayabaca,
          dayabacaUnit: instruments.dayabacaUnit,
          class: instruments.class,
          petugasName: users.name,
          testObservationId: peneraanApplications.testObservationId,
        })
        .from(peneraanApplications)
        .leftJoin(instrumentOwners, eq(peneraanApplications.ownerId, instrumentOwners.id))
        .leftJoin(instruments, eq(peneraanApplications.instrumentId, instruments.id))
        .leftJoin(users, eq(peneraanApplications.petugasId, users.id))
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(peneraanApplications.createdAt));

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
          capacityValue: instruments.capacityValue,
          capacityUnit: instruments.capacityUnit,
          dayabaca: instruments.dayabaca,
          dayabacaUnit: instruments.dayabacaUnit,
          class: instruments.class,
          petugasName: users.name,
        })
        .from(peneraanApplications)
        .leftJoin(instrumentOwners, eq(peneraanApplications.ownerId, instrumentOwners.id))
        .leftJoin(instruments, eq(peneraanApplications.instrumentId, instruments.id))
        .leftJoin(users, eq(peneraanApplications.petugasId, users.id))
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
      const allowedRoles: JwtPayload["role"][] = ["admin", "petugas_penera"];
      if (!allowedRoles.includes(user.role)) {
        throw httpError(403, "Akses ditolak");
      }

      // ── Resolusi Pemilik: pakai yang existing, atau buat baru ──────────────
      let ownerId: string;

      if (body.ownerId) {
        const [existingOwner] = await db
          .select()
          .from(instrumentOwners)
          .where(eq(instrumentOwners.id, body.ownerId))
          .limit(1);

        if (!existingOwner) {
          set.status = 404;
          return { message: "Pemilik yang dipilih tidak ditemukan" };
        }
        ownerId = existingOwner.id;
      } else {
        if (!body.companyName || !body.address || !body.phone) {
          throw httpError(400, "Data pemilik baru (nama, alamat, telepon) wajib diisi lengkap");
        }
        ownerId = crypto.randomUUID();
      }

      // ── Resolusi Alat: pakai yang existing (harus milik owner di atas), atau buat baru ──
      let instrumentId: string;

      if (body.instrumentId) {
        const [existingInstrument] = await db
          .select()
          .from(instruments)
          .where(eq(instruments.id, body.instrumentId))
          .limit(1);

        if (!existingInstrument) {
          set.status = 404;
          return { message: "Alat ukur yang dipilih tidak ditemukan" };
        }
        // kalau owner-nya baru dibuat, instrument lama tidak mungkin cocok — cukup validasi kalau owner sudah ada
        if (body.ownerId && existingInstrument.ownerId !== ownerId) {
          throw httpError(400, "Alat ukur yang dipilih bukan milik pemilik yang dipilih");
        }
        instrumentId = existingInstrument.id;
      } else {
        const required = [body.jenisAlat, body.brand, body.capacityValue, body.capacityUnit, body.dayabaca, body.dayabacaUnit, body.class];
        if (required.some((v) => v === undefined || v === null)) {
          throw httpError(400, "Data alat ukur baru wajib diisi lengkap");
        }
        instrumentId = crypto.randomUUID();
      }

      // ── Nomor permohonan ────────────────────────────────────────────────────
      const year = new Date().getFullYear();
      const randomSuffix = (crypto.randomUUID().split("-")[0] ?? "XXXX").toUpperCase();
      const applicationNumber = `PERM-${year}-${randomSuffix}`;
      const applicationId = crypto.randomUUID();

      // ── Semua operasi dalam satu transaksi — atomik ─────────────────────────
      await db.transaction(async (tx) => {
        if (!body.ownerId) {
          await tx.insert(instrumentOwners).values({
            id: ownerId,
            userId: null, // walk-in, belum tentu punya akun
            companyName: body.companyName!,
            address: body.address!,
            phone: body.phone!,
          });
        }

        if (!body.instrumentId) {
          await tx.insert(instruments).values({
            id: instrumentId,
            ownerId,
            jenisAlat: body.jenisAlat!,
            brand: body.brand!,
            type: body.type ?? null,
            serialNumber: body.serialNumber ?? null,
            capacityValue: body.capacityValue!.toString(),
            capacityUnit: body.capacityUnit!,
            dayabaca: body.dayabaca!.toString(),
            dayabacaUnit: body.dayabacaUnit!,
            class: body.class!,
            registeredby: user.id,
          });
        }

        await tx.insert(peneraanApplications).values({
          id: applicationId,
          applicationNumber,
          ownerId,
          instrumentId,
          layanan: body.layanan,
          lokasi: body.lokasi,
          status: "DIJADWALKAN", // walk-in = otomatis terverifikasi, tidak pernah MENUNGGU_VERIFIKASI
          jadwalTanggal: body.jadwalTanggal ? new Date(body.jadwalTanggal) : null,
          petugasId: body.petugasId ?? null,
          catatan: body.catatan ?? null,
          createdBy: user.id,
        });
      });

      const [created] = await db
        .select()
        .from(peneraanApplications)
        .where(eq(peneraanApplications.id, applicationId))
        .limit(1);

      return {
        message: "Registrasi peneraan offline berhasil — pemilik, alat, dan permohonan tersimpan",
        data: created,
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

      if (existing.status !== "DIJADWALKAN") {
        throw httpError(
          400,
          `Hasil hanya bisa diinput untuk permohonan berstatus DIJADWALKAN (status saat ini: ${existing.status})`
        );
      }

      const observationId = crypto.randomUUID();
      const newApplicationStatus = body.status === "SAH" ? "DIPROSES" : "TIDAK_LULUS_UJI";

      await db.transaction(async (tx) => {
        await tx.insert(testObservations).values({
          id: observationId,
          instrumentId: existing.instrumentId,
          inspectorId: user.id,
          observationData: body.observationData,
          status: body.status,
        });

        await tx
          .update(peneraanApplications)
          .set({
            testObservationId: observationId,
            status: newApplicationStatus,
          })
          .where(eq(peneraanApplications.id, params.id));
      });

      const [updatedApp] = await db
        .select()
        .from(peneraanApplications)
        .where(eq(peneraanApplications.id, params.id))
        .limit(1);

      return {
        message:
          body.status === "SAH"
            ? "Hasil pengujian tersimpan. Alat SAH — menunggu penerbitan sertifikat."
            : "Hasil pengujian tersimpan. Alat TIDAK LULUS UJI.",
        data: { application: updatedApp, observationId },
      };
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        status: t.Union([t.Literal("SAH"), t.Literal("BATAL")]),
        observationData: t.Record(t.String(), t.Any(), {
          description: 'Data pengujian dinamis sesuai jenis alat. Contoh: { "beban_1": "10kg" }',
        }),
      }),
      detail: { summary: "Input hasil pengujian oleh petugas — otomatis link ke permohonan" },
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