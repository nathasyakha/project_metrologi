import { Elysia, t, status as httpError } from "elysia";
import { eq, or, like } from "drizzle-orm";
import { db } from "../db";
import { instrumentOwners } from "../db/schema";
import { authMiddleware } from "../middleware/auth";
import type { JwtPayload } from "../middleware/auth";

export const ownerRoutes = new Elysia({
    prefix: "/owners", tags: ['Data Pemilik Alat'],
})
    // 1. Pasang authMiddleware di level paling atas agar 'user' terbaca global di file ini
    .use(authMiddleware)

    // GET PROFILE PEMILIK SAYA (Untuk pemilik_alat yang sedang login)
    .get("/me", async ({ user, set }) => {
        const owner = await db
            .select()
            .from(instrumentOwners)
            .where(eq(instrumentOwners.userId, user.id))
            .then(result => result[0]);

        if (!owner) {
            set.status = 404;
            return { message: "Data profil pemilik belum terdaftar", data: null };
        }

        return { data: owner };
    })

    // =================================================
    // GRUP 1: Role -> admin, petugas_penera, pemilik_alat (POST & PUT)
    // =================================================
    .guard(
        {
            beforeHandle: ({ user }) => {
                const allowed: JwtPayload['role'][] = ["admin", "petugas_penera", "pemilik_alat"];
                if (!allowed.includes(user.role)) {
                    throw httpError(403, "Akses ditolak");
                }
            }
        },
        (app) => app
            // CREATE OWNER
            .post("/", async ({ body, user }) => {
                const id = crypto.randomUUID();
                const ownerUserId = user.role === "pemilik_alat" ? user.id : (body.userId ?? null);

                await db.insert(instrumentOwners).values({
                    id,
                    userId: ownerUserId,
                    companyName: body.companyName,
                    address: body.address,
                    phone: body.phone,
                });

                return {
                    message: "Pemilik alat berhasil dibuat",
                    data: {
                        id,
                        userId: ownerUserId,
                        companyName: body.companyName,
                        address: body.address,
                        phone: body.phone,
                        createdBy: user.id,
                    }
                };
            }, {
                body: t.Object({
                    userId: t.Optional(t.String()),
                    companyName: t.String(),
                    address: t.String(),
                    phone: t.String(),
                })
            })

            // UPDATE OWNER
            .put("/:id", async ({ params, body, set, user }) => {
                const existing = await db
                    .select()
                    .from(instrumentOwners)
                    .where(eq(instrumentOwners.id, params.id))
                    .then(result => result[0]);

                if (!existing) {
                    set.status = 404;
                    return { message: "Pemilik alat tidak ditemukan" };
                }

                if (user.role === "pemilik_alat" && existing.userId !== user.id) {
                    throw httpError(403, "Akses ditolak: Anda hanya dapat mengubah data profil Anda sendiri");
                }

                await db
                    .update(instrumentOwners)
                    .set({
                        companyName: body.companyName,
                        address: body.address,
                        phone: body.phone,
                    })
                    .where(eq(instrumentOwners.id, params.id));

                return {
                    message: "Data pemilik alat berhasil diperbarui",
                    updatedBy: user.id
                };
            }, {
                params: t.Object({ id: t.String() }),
                body: t.Object({
                    companyName: t.String(),
                    address: t.String(),
                    phone: t.String()
                })
            })
    )

    // =================================================
    // GRUP 2: Role -> admin, petugas_penera, kepala, staf (GET ALL)
    // =================================================
    .guard(
        {
            beforeHandle: ({ user }) => {
                const allowed: JwtPayload['role'][] = ["admin", "petugas_penera", "kepala", "staf", "pengamat_tera", "pengawas"];
                if (!allowed.includes(user.role)) {
                    throw httpError(403, "Akses ditolak");
                }
            }
        },
        (app) => app
            .get("/", async ({ query }) => {
                const owners = await db
                    .select()
                    .from(instrumentOwners)
                    .where(
                        query.search
                            ? or(
                                like(instrumentOwners.companyName, `%${query.search}%`),
                                like(instrumentOwners.phone, `%${query.search}%`)
                            )
                            : undefined
                    );
                return { data: owners };
            }, {
                query: t.Object({
                    search: t.Optional(t.String({ description: "Cari berdasarkan nama perusahaan atau no. telepon" })),
                }),
            })
    )

    // =================================================
    // GRUP 3: Role -> admin, petugas_penera, kepala (GET DETAIL)
    // =================================================
    .guard(
        {
            beforeHandle: ({ user }) => {
                const allowed: JwtPayload['role'][] = ["admin", "petugas_penera", "kepala"];
                if (!allowed.includes(user.role)) {
                    throw httpError(403, "Akses ditolak");
                }
            }
        },
        (app) => app
            .get("/:id", async ({ params, set }) => {
                const owner = await db
                    .select()
                    .from(instrumentOwners)
                    .where(eq(instrumentOwners.id, params.id))
                    .then(result => result[0]);

                if (!owner) {
                    set.status = 404;
                    return { message: "Pemilik alat tidak ditemukan" };
                }

                return { data: owner };
            }, {
                params: t.Object({ id: t.String() })
            })
    )

    // =================================================
    // GRUP 4: Role -> admin (DELETE)
    // =================================================
    .guard(
        {
            beforeHandle: ({ user }) => {
                const allowed: JwtPayload['role'][] = ["admin"];
                if (!allowed.includes(user.role)) {
                    throw httpError(403, "Akses ditolak");
                }
            }
        },
        (app) => app
            .delete("/:id", async ({ params, set }) => {
                const existing = await db
                    .select()
                    .from(instrumentOwners)
                    .where(eq(instrumentOwners.id, params.id))
                    .then(result => result[0]);

                if (!existing) {
                    set.status = 404;
                    return { message: "Pemilik alat tidak ditemukan" };
                }

                await db
                    .delete(instrumentOwners)
                    .where(eq(instrumentOwners.id, params.id));

                return { message: "Pemilik alat berhasil dihapus" };
            }, {
                params: t.Object({ id: t.String() })
            })
    );