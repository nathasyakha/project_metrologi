import { describe, expect, it } from "bun:test";
import { app } from "./index";

describe("Legal Metrology System API", () => {

    it("GET / harus mengembalikan pesan welcome", async () => {
        const response = await app.handle(new Request("http://localhost/"));

        // Tambahkan 'as { message: string; [key: string]: any }' di sini
        const data = (await response.json()) as {
            message: string;
            docs?: string;
            version?: string;
        };

        expect(response.status).toBe(200);
        expect(data).toHaveProperty("message");
        expect(data.message).toBe("Welcome to Legal Metrology System API");
    });

    it("GET /not-found harus mengembalikan 404", async () => {
        const response = await app.handle(new Request("http://localhost/invalid-route"));
        expect(response.status).toBe(404);
    });

});