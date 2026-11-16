
type HasilUji = "SAH" | "BATAL";

export function evaluasiKesimpulan(
    observationData: Record<string, any[]>
): HasilUji | null {

    if (
        !observationData ||
        Object.keys(observationData).length === 0
    ) {
        return null;
    }

    const semuaHasil: HasilUji[] = [];

    for (const [sectionId, rows] of Object.entries(observationData)) {

        if (!rows || rows.length === 0) {
            return null;
        }

        let hasilSection: HasilUji[] = [];


        // PEMERIKSAAN VISUAL
        if (sectionId === "visual") {

            for (const row of rows) {

                const kondisi = String(
                    row.kondisi ?? ""
                ).trim().toUpperCase();

                if (
                    kondisi === "YA" ||
                    kondisi === "ADA"
                ) {
                    hasilSection.push("SAH");
                }
                else if (
                    kondisi === "TIDAK" ||
                    kondisi === "TIDAK ADA"
                ) {
                    hasilSection.push("BATAL");
                }
                else {
                    // Kondisi belum diisi atau tidak dikenal
                    return null;
                }
            }

        } else if (sectionId === "repeatability") {

            const row = rows[rows.length - 1];

            if (
                row.hasil !== "SAH" &&
                row.hasil !== "BATAL"
            ) {
                return null;
            }

            hasilSection.push(row.hasil);

            if (row.perluUjiTambahan === true) {

                if (
                    row.hasilTambahan !== "SAH" &&
                    row.hasilTambahan !== "BATAL"
                ) {
                    return null;
                }

                hasilSection.push(row.hasilTambahan);
            }

        } else {

            // PENGUJIAN LAIN:
            // Setiap baris wajib mempunyai hasil.
            for (const row of rows) {

                if (
                    row.hasil !== "SAH" &&
                    row.hasil !== "BATAL"
                ) {
                    return null;
                }

                hasilSection.push(row.hasil);

                // Pengujian tambahan jika diperlukan.
                if (row.perluUjiTambahan === true) {

                    if (
                        row.hasilTambahan !== "SAH" &&
                        row.hasilTambahan !== "BATAL"
                    ) {
                        return null;
                    }

                    hasilSection.push(row.hasilTambahan);
                }
            }
        }

        semuaHasil.push(...hasilSection);
    }

    // Satu pengujian BATAL menyebabkan hasil keseluruhan BATAL.
    if (semuaHasil.includes("BATAL")) {
        return "BATAL";
    }

    // Semua pengujian wajib harus SAH.
    if (
        semuaHasil.length > 0 &&
        semuaHasil.every(hasil => hasil === "SAH")
    ) {
        return "SAH";
    }

    return null;
}
