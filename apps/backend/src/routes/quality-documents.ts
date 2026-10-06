import { Elysia, t, status as httpError } from "elysia";
import { eq, and, desc, isNull, isNotNull } from "drizzle-orm";
import { db } from "../db";
import { qualityDocuments, documentCategory } from "../db/schema";
import { authMiddleware } from "../middleware/auth";
import type { JwtPayload } from "../middleware/auth";

function deriveVersionFromCode(code: string): number | null {
    const parts = code.split("/");
    const lastSegment = parts[parts.length - 1];
    if (!lastSegment) return null;
    const parsed = parseInt(lastSegment, 10);
    if (Number.isNaN(parsed) || parsed < 1) return null;
    return parsed - 1;
}

const summaryColumns = {
    id: qualityDocuments.id,
    code: qualityDocuments.code,
    name: qualityDocuments.name,
    category: qualityDocuments.category,
    version: qualityDocuments.version,
    effectiveDate: qualityDocuments.effectiveDate,
    fileName: qualityDocuments.fileName,
    fileMimeType: qualityDocuments.fileMimeType,
    fileSize: qualityDocuments.fileSize,
    isActive: qualityDocuments.isActive,
    createdBy: qualityDocuments.createdBy,
    createdAt: qualityDocuments.createdAt,
    updatedAt: qualityDocuments.updatedAt,
};

export const qualityDocumentRoutes = new Elysia({
    prefix: "/quality-documents",
    tags: ["Dokumen Mutu"],
})
    .use(authMiddleware)

    // ═══════════════════════════════════════════════════════
    // GRUP 1: admin, petugas_penera -> Tambah & Revisi
    // ═══════════════════════════════════════════════════════
    .guard(
        {
            beforeHandle: ({ user }) => {
                const allowed: JwtPayload["role"][] = ["admin", "petugas_penera"];
                if (!allowed.includes(user.role)) {
                    throw httpError(403, "Akses ditolak");
                }
            },
        },
        (app) => app
            .post("/", async ({ body, user }) => {
                const id = crypto.randomUUID();
                const buffer = Buffer.from(await body.file.arrayBuffer());

                await db.insert(qualityDocuments).values({
                    id,
                    code: body.code,
                    name: body.name,
                    category: body.category,
                    version: 0,
                    effectiveDate: new Date(body.effectiveDate),
                    fileName: body.file.name,
                    fileMimeType: body.file.type || "application/octet-stream",
                    fileSize: buffer.length,
                    fileData: buffer.toString("base64"),
                    isActive: true,
                    createdBy: user.id,
                });

                return { message: "Dokumen mutu berhasil ditambahkan", data: { id } };
            }, {
                body: t.Object({
                    code: t.String(),
                    name: t.String(),
                    category: t.Union(documentCategory.map((c) => t.Literal(c))),
                    effectiveDate: t.String({ format: "date" }),
                    file: t.File({ maxSize: "10m" }),
                }),
            })

            .post("/:id/revise", async ({ params, body, user, set }) => {
                // dokumen yang sudah di-soft-delete tidak boleh direvisi
                const [existing] = await db
                    .select()
                    .from(qualityDocuments)
                    .where(and(eq(qualityDocuments.id, params.id), isNull(qualityDocuments.deletedAt)))
                    .limit(1);

                if (!existing) {
                    set.status = 404;
                    return { message: "Dokumen tidak ditemukan" };
                }
                if (!existing.isActive) {
                    throw httpError(400, "Hanya dokumen aktif yang bisa direvisi");
                }

                const newId = crypto.randomUUID();
                const buffer = Buffer.from(await body.file.arrayBuffer());

                await db.transaction(async (tx) => {
                    await tx
                        .update(qualityDocuments)
                        .set({ isActive: false })
                        .where(eq(qualityDocuments.id, existing.id));

                    await tx.insert(qualityDocuments).values({
                        id: newId,
                        code: body.code ?? existing.code,   // ⬅️ diperbaiki, sebelumnya: code: existing.code
                        name: body.name ?? existing.name,
                        category: existing.category,
                        version: existing.version + 1,
                        effectiveDate: new Date(body.effectiveDate),
                        fileName: body.file.name,
                        fileMimeType: body.file.type || "application/octet-stream",
                        fileSize: buffer.length,
                        fileData: buffer.toString("base64"),
                        isActive: true,
                        createdBy: user.id,
                    });
                });

                return { message: "Dokumen berhasil direvisi", data: { id: newId, version: existing.version + 1 } };
            }, {
                params: t.Object({ id: t.String() }),
                body: t.Object({
                    code: t.Optional(t.String()),   // ⬅️ baris baru, wajib ditambah
                    name: t.Optional(t.String()),
                    effectiveDate: t.String({ format: "date" }),
                    file: t.File({ maxSize: "10m" }),
                }),
            })

            // EDIT DOKUMEN (perbaikan data, TIDAK menambah versi/riwayat baru)
            .patch("/:id", async ({ params, body, set }) => {
                const [existing] = await db
                    .select()
                    .from(qualityDocuments)
                    .where(and(eq(qualityDocuments.id, params.id), isNull(qualityDocuments.deletedAt)))
                    .limit(1);

                if (!existing) {
                    set.status = 404;
                    return { message: "Dokumen tidak ditemukan" };
                }

                let fileFields = {};
                if (body.file) {
                    const buffer = Buffer.from(await body.file.arrayBuffer());
                    fileFields = {
                        fileName: body.file.name,
                        fileMimeType: body.file.type || "application/octet-stream",
                        fileSize: buffer.length,
                        fileData: buffer.toString("base64"),
                    };
                }

                // kalau kode diubah, coba sinkronkan version dengan angka di akhir kode
                let versionField = {};
                if (body.code !== undefined) {
                    const derivedVersion = deriveVersionFromCode(body.code);
                    if (derivedVersion !== null) {
                        versionField = { version: derivedVersion };
                    }
                }

                await db
                    .update(qualityDocuments)
                    .set({
                        ...(body.code !== undefined && { code: body.code }),
                        ...(body.name !== undefined && { name: body.name }),
                        ...(body.category !== undefined && { category: body.category }),
                        ...(body.effectiveDate !== undefined && { effectiveDate: new Date(body.effectiveDate) }),
                        ...fileFields,
                        ...versionField,   // ⬅️ ditambahkan
                    })
                    .where(eq(qualityDocuments.id, params.id));

                return { message: "Dokumen berhasil diperbarui" };
            }, {
                params: t.Object({ id: t.String() }),
                body: t.Object({
                    code: t.Optional(t.String()),
                    name: t.Optional(t.String()),
                    category: t.Optional(t.Union(documentCategory.map((c) => t.Literal(c)))),
                    effectiveDate: t.Optional(t.String({ format: "date" })),
                    file: t.Optional(t.File({ maxSize: "10m" })),
                }),
            })
    )

    // ═══════════════════════════════════════════════════════
    // GRUP 2: admin, petugas_penera, kepala, staf -> Lihat & Download
    // ═══════════════════════════════════════════════════════
    .guard(
        {
            beforeHandle: ({ user }) => {
                const allowed: JwtPayload["role"][] = ["admin", "petugas_penera", "kepala", "staf"];
                if (!allowed.includes(user.role)) {
                    throw httpError(403, "Akses ditolak");
                }
            },
        },
        (app) => app
            // LIST DOKUMEN AKTIF — bug diperbaiki: conditions sekarang benar-benar dipakai
            .get("/", async ({ query }) => {
                const conditions = [
                    eq(qualityDocuments.isActive, true),
                    isNull(qualityDocuments.deletedAt), // soft-deleted tidak boleh muncul
                ];
                if (query.category) {
                    conditions.push(eq(qualityDocuments.category, query.category));
                }

                const rows = await db
                    .select(summaryColumns)
                    .from(qualityDocuments)
                    .where(and(...conditions))
                    .orderBy(desc(qualityDocuments.createdAt));

                return { data: rows };
            }, {
                query: t.Object({
                    category: t.Optional(t.Union(documentCategory.map((c) => t.Literal(c)))),
                }),
            })

            // LIST DOKUMEN KEDALUWARSA — soft-deleted juga dikecualikan
            .get("/expired", async () => {
                const rows = await db
                    .select(summaryColumns)
                    .from(qualityDocuments)
                    .where(and(eq(qualityDocuments.isActive, false), isNull(qualityDocuments.deletedAt)))
                    .orderBy(desc(qualityDocuments.updatedAt));

                return { data: rows };
            })

            // DETAIL DOKUMEN + riwayat revisi — dokumen/riwayat yang sudah dihapus tidak ikut tampil
            .get("/:id", async ({ params, set }) => {
                const [doc] = await db
                    .select(summaryColumns)
                    .from(qualityDocuments)
                    .where(and(eq(qualityDocuments.id, params.id), isNull(qualityDocuments.deletedAt)))
                    .limit(1);

                if (!doc) {
                    set.status = 404;
                    return { message: "Dokumen tidak ditemukan" };
                }

                const history = await db
                    .select(summaryColumns)
                    .from(qualityDocuments)
                    .where(and(eq(qualityDocuments.code, doc.code), isNull(qualityDocuments.deletedAt)))
                    .orderBy(desc(qualityDocuments.version));

                return { data: doc, history };
            }, {
                params: t.Object({ id: t.String() }),
            })

            // DOWNLOAD / BUKA FILE — dokumen yang sudah dihapus tidak bisa diunduh lagi
            .get("/:id/file", async ({ params, set }) => {
                const [doc] = await db
                    .select({
                        fileName: qualityDocuments.fileName,
                        fileMimeType: qualityDocuments.fileMimeType,
                        fileData: qualityDocuments.fileData,
                    })
                    .from(qualityDocuments)
                    .where(and(eq(qualityDocuments.id, params.id), isNull(qualityDocuments.deletedAt)))
                    .limit(1);

                if (!doc) {
                    set.status = 404;
                    return { message: "Dokumen tidak ditemukan" };
                }

                set.headers["Content-Type"] = doc.fileMimeType;
                set.headers["Content-Disposition"] = `inline; filename="${doc.fileName}"`;

                return Buffer.from(doc.fileData, "base64");
            }, {
                params: t.Object({ id: t.String() }),
            })
    )

    // ═══════════════════════════════════════════════════════
    // GRUP 3: admin -> Hapus (soft delete)
    // ═══════════════════════════════════════════════════════
    .guard(
        {
            beforeHandle: ({ user }) => {
                if (user.role !== "admin") {
                    throw httpError(403, "Akses ditolak");
                }
            },
        },
        (app) => app
            .get('/trash', async () => {
                const rows = await db
                    .select({ ...summaryColumns, deletedAt: qualityDocuments.deletedAt })
                    .from(qualityDocuments)
                    .where(isNotNull(qualityDocuments.deletedAt))
                    .orderBy(desc(qualityDocuments.deletedAt));

                return { data: rows };
            })
            .delete('/:id', async ({ params, set }) => {
                // select ringan — tidak perlu tarik fileData (bisa besar) cuma buat cek eksistensi
                const [existing] = await db
                    .select({ id: qualityDocuments.id, deletedAt: qualityDocuments.deletedAt })
                    .from(qualityDocuments)
                    .where(eq(qualityDocuments.id, params.id))
                    .limit(1);

                if (!existing) {
                    set.status = 404;
                    return { message: 'Dokumen tidak ditemukan' };
                }
                if (existing.deletedAt) {
                    throw httpError(400, 'Dokumen sudah dihapus sebelumnya');
                }

                await db
                    .update(qualityDocuments)
                    .set({ deletedAt: new Date() })
                    .where(eq(qualityDocuments.id, params.id));

                return { message: 'Dokumen berhasil dihapus' };
            }, {
                params: t.Object({ id: t.String() }),
            })
            .patch('/:id/restore', async ({ params, set }) => {
                const [existing] = await db
                    .select({ id: qualityDocuments.id, deletedAt: qualityDocuments.deletedAt })
                    .from(qualityDocuments)
                    .where(eq(qualityDocuments.id, params.id))
                    .limit(1);

                if (!existing) {
                    set.status = 404;
                    return { message: 'Dokumen tidak ditemukan' };
                }
                if (!existing.deletedAt) {
                    throw httpError(400, 'Dokumen ini tidak sedang berada di sampah');
                }

                await db
                    .update(qualityDocuments)
                    .set({ deletedAt: null })
                    .where(eq(qualityDocuments.id, params.id));

                return { message: 'Dokumen berhasil dipulihkan' };
            }, {
                params: t.Object({ id: t.String() }),
            })

            // HAPUS PERMANEN — cuma boleh untuk dokumen yang SUDAH ada di sampah
            .delete('/:id/permanent', async ({ params, set }) => {
                const [existing] = await db
                    .select({ id: qualityDocuments.id, deletedAt: qualityDocuments.deletedAt })
                    .from(qualityDocuments)
                    .where(eq(qualityDocuments.id, params.id))
                    .limit(1);

                if (!existing) {
                    set.status = 404;
                    return { message: 'Dokumen tidak ditemukan' };
                }
                if (!existing.deletedAt) {
                    throw httpError(400, 'Dokumen harus dihapus (masuk sampah) dulu sebelum dihapus permanen');
                }

                await db.delete(qualityDocuments).where(eq(qualityDocuments.id, params.id));

                return { message: 'Dokumen berhasil dihapus permanen' };
            }, {
                params: t.Object({ id: t.String() }),
            })


    );