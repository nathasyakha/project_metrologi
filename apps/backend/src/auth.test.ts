import { describe, expect, it, beforeAll } from "bun:test";
import { app } from "./index";

describe("Auth & Role Guard System", () => {
    let adminToken = "";
    let stafToken = "";

    // 1. Lakukan login terlebih dahulu untuk mendapatkan token masing-masing role
    beforeAll(async () => {
        // Login sebagai Admin (menggunakan data dari seeder atau registrasi)
        const adminRes = await app.handle(
            new Request("http://localhost/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: "admin@metrologi.com",
                    password: "admin12345",
                }),
            })
        );
        const adminData = (await adminRes.json()) as { token?: string };
        if (adminData.token) adminToken = adminData.token;

        // (Opsional) Anda bisa mendaftarkan akun staf baru untuk uji coba role staf
        await app.handle(
            new Request("http://localhost/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: "Staf Dummy",
                    email: "staf@metrologi.com",
                    password: "password123",
                    role: "staf",
                    nip: "199501012020011002",
                }),
            })
        );

        const stafRes = await app.handle(
            new Request("http://localhost/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: "staf@metrologi.com",
                    password: "password123",
                }),
            })
        );
        const stafData = (await stafRes.json()) as { token?: string };
        if (stafData.token) stafToken = stafData.token;
    });

    // 2. Test Endpoint /auth/me dengan Token Valid
    it("GET /auth/me harus berhasil jika membawa token yang valid", async () => {
        const response = await app.handle(
            new Request("http://localhost/auth/me", {
                headers: {
                    Authorization: `Bearer ${adminToken}`,
                },
            })
        );

        expect(response.status).toBe(200);
        const data = (await response.json()) as { data: { email: string } };
        expect(data.data.email).toBe("admin@metrologi.com");
    });

    // 3. Test Endpoint /auth/me Tanpa Token
    it("GET /auth/me harus mengembalikan 401 jika tidak membawa token", async () => {
        const response = await app.handle(
            new Request("http://localhost/auth/me")
        );

        expect(response.status).toBe(401);
    });

    // 4. Test Hak Akses Role (Guard /owners DELETE yang hanya untuk Admin)
    it("DELETE /owners/:id harus diizinkan untuk role 'admin'", async () => {
        // Misal mencoba menghapus ID dummy (meskipun data tidak ada, harusnya lolos guard admin -> 404, bukan 403)
        const response = await app.handle(
            new Request("http://localhost/owners/random-id-123", {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${adminToken}`,
                },
            })
        );

        // Status 404 berarti lolos pengecekan role (otorisasi sukses), tapi data pemilik alat tidak ditemukan di DB
        expect(response.status).toBe(404);
    });

    it("DELETE /owners/:id harus DITOLAK (403) jika diakses oleh role 'staf'", async () => {
        const response = await app.handle(
            new Request("http://localhost/owners/random-id-123", {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${stafToken}`,
                },
            })
        );

        // Staf tidak boleh menghapus data pemilik alat (hanya admin)
        expect(response.status).toBe(403);
    });
});