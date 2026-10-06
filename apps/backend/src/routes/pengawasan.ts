import { Elysia, t, status as httpError } from "elysia";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { db } from "../db";
import { pengawasan, pengawasanCerapan, jenisPengawasan } from "../db/schema";
import { authMiddleware } from "../middleware/auth";
import type { JwtPayload } from "../middleware/auth";

const cerapanItemBody = t.Object({
    data: t.Record(t.String(), t.Unknown()),
});

export const pengawasanRoutes = new Elysia({
    prefix: "/pengawasan",
    tags: ["Pengawasan"],
})
    .use(authMiddleware)
    .guard(
        {
            beforeHandle: ({ user }) => {
                const allowed: JwtPayload["role"][] = ["admin", "pengamat_tera", "pengawas"];
                if (!allowed.includes(user.role)) {
                    throw httpError(403, "Akses ditolak");
                }
            },
        },
        (app) => app
            .post("/", async ({ body, user }) => {
                const id = crypto.randomUUID();

                await db.transaction(async (tx) => {
                    await tx.insert(pengawasan).values({
                        id,
                        jenisPengujian: body.jenisPengujian,
                        tanggalPengawasan: new Date(body.tanggalPengawasan),
                        alamat: body.alamat,
                        petugasId: user.id,
                    });

                    if (body.cerapan?.length) {
                        await tx.insert(pengawasanCerapan).values(
                            body.cerapan.map((c) => ({
                                id: crypto.randomUUID(),
                                pengawasanId: id,
                                data: c.data,
                            }))
                        );
                    }
                });

                return { message: "Pengawasan berhasil dicatat", data: { id } };
            }, {
                body: t.Object({
                    jenisPengujian: t.Union(jenisPengawasan.map((j) => t.Literal(j))),
                    tanggalPengawasan: t.String({ format: "date" }),
                    alamat: t.String(),
                    cerapan: t.Array(cerapanItemBody),
                }),
            })

            // TAMBAH ITEM CERAPAN KE PENGAWASAN YANG SUDAH ADA
            .post("/:id/cerapan", async ({ params, body, set }) => {
                const [existing] = await db
                    .select({ id: pengawasan.id })
                    .from(pengawasan)
                    .where(eq(pengawasan.id, params.id))
                    .limit(1);

                if (!existing) {
                    set.status = 404;
                    return { message: "Pengawasan tidak ditemukan" };
                }

                const cerapanId = crypto.randomUUID();
                await db.insert(pengawasanCerapan).values({
                    id: cerapanId,
                    pengawasanId: params.id,
                    data: body.data,
                });

                return { message: "Item cerapan berhasil ditambahkan", data: { id: cerapanId } };
            }, {
                params: t.Object({ id: t.String() }),
                body: cerapanItemBody,
            })

            // UPDATE ISI SATU ITEM CERAPAN
            .patch("/cerapan/:cerapanId", async ({ params, body, set }) => {
                const [existing] = await db
                    .select({ id: pengawasanCerapan.id })
                    .from(pengawasanCerapan)
                    .where(eq(pengawasanCerapan.id, params.cerapanId))
                    .limit(1);

                if (!existing) {
                    set.status = 404;
                    return { message: "Item cerapan tidak ditemukan" };
                }

                await db
                    .update(pengawasanCerapan)
                    .set({ data: body.data })
                    .where(eq(pengawasanCerapan.id, params.cerapanId));

                return { message: "Item cerapan berhasil diperbarui" };
            }, {
                params: t.Object({ cerapanId: t.String() }),
                body: cerapanItemBody,
            })


            // HAPUS SATU ITEM CERAPAN
            .delete("/cerapan/:cerapanId", async ({ params, set }) => {
                const [existing] = await db
                    .select({ id: pengawasanCerapan.id })
                    .from(pengawasanCerapan)
                    .where(eq(pengawasanCerapan.id, params.cerapanId))
                    .limit(1);

                if (!existing) {
                    set.status = 404;
                    return { message: "Item cerapan tidak ditemukan" };
                }

                await db.delete(pengawasanCerapan).where(eq(pengawasanCerapan.id, params.cerapanId));
                return { message: "Item cerapan berhasil dihapus" };
            }, {
                params: t.Object({ cerapanId: t.String() }),
            })
    )

    // ═══════════════════════════════════════════════════════
    .guard(
        {
            beforeHandle: ({ user }) => {
                const allowed: JwtPayload["role"][] = ["admin", "petugas_penera", "kepala", "staf", "pengamat_tera", "pengawas"];
                if (!allowed.includes(user.role)) {
                    throw httpError(403, "Akses ditolak");
                }
            },
        },
        (app) => app
            .get("/", async ({ query }) => {
                const conditions = [];

                if (query.jenisPengujian) {
                    conditions.push(eq(pengawasan.jenisPengujian, query.jenisPengujian));
                }
                if (query.startDate) {
                    conditions.push(gte(pengawasan.tanggalPengawasan, new Date(query.startDate)));
                }
                if (query.endDate) {
                    conditions.push(lte(pengawasan.tanggalPengawasan, new Date(query.endDate)));
                }

                const rows = await db
                    .select()
                    .from(pengawasan)
                    .where(conditions.length ? and(...conditions) : undefined)
                    .orderBy(desc(pengawasan.tanggalPengawasan));

                return { data: rows };
            }, {
                query: t.Object({
                    jenisPengujian: t.Optional(t.Union(jenisPengawasan.map((j) => t.Literal(j)))),
                    startDate: t.Optional(t.String({ format: "date" })),
                    endDate: t.Optional(t.String({ format: "date" })),
                }),
            })

            .get("/:id", async ({ params, set }) => {
                const [header] = await db
                    .select()
                    .from(pengawasan)
                    .where(eq(pengawasan.id, params.id))
                    .limit(1);

                if (!header) {
                    set.status = 404;
                    return { message: "Pengawasan tidak ditemukan" };
                }

                const items = await db
                    .select()
                    .from(pengawasanCerapan)
                    .where(eq(pengawasanCerapan.pengawasanId, params.id));

                return { data: header, cerapan: items };
            }, {
                params: t.Object({ id: t.String() }),
            })
    )

    // ═══════════════════════════════════════════════════════
    // GRUP 3: admin -> Hapus
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
            .delete("/:id", async ({ params, set }) => {
                const [existing] = await db
                    .select({ id: pengawasan.id })
                    .from(pengawasan)
                    .where(eq(pengawasan.id, params.id))
                    .limit(1);

                if (!existing) {
                    set.status = 404;
                    return { message: "Pengawasan tidak ditemukan" };
                }

                await db.transaction(async (tx) => {
                    await tx.delete(pengawasanCerapan).where(eq(pengawasanCerapan.pengawasanId, params.id));
                    await tx.delete(pengawasan).where(eq(pengawasan.id, params.id));
                });

                return { message: "Pengawasan berhasil dihapus" };
            }, {
                params: t.Object({ id: t.String() }),
            })
    );