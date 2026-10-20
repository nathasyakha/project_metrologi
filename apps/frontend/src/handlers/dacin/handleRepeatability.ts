import { HandlerContext } from "@/lib/cerapan/types/handler";
import { hitungBKDDacin } from "@/lib/cerapan/calculator/dacin/hitungBKDDacin";

export function handleRepeatability({
    key,
    updated,
    index
}: HandlerContext) {
    const row = updated[index];

    /*
    ==========================
    HITUNG ULANG BKD
    ==========================
    */
    if (key === "muatanUji") {
        const muatanUji = Number(row.muatanUji);
        const kapasitasMaksimum = Number(row.kapasitasMaksimum);
        if (
            !Number.isFinite(muatanUji) ||
            muatanUji <= 0 ||
            !Number.isFinite(kapasitasMaksimum) ||
            kapasitasMaksimum <= 0 ||
            muatanUji > kapasitasMaksimum
        ) {
            row.bkd = null;
        } else {
            const bkd =
                hitungBKDDacin({
                    kapasitasMaksimum: kapasitasMaksimum,
                    muatanUji: muatanUji,
                    layanan: row.layanan
                });
            row.bkd = bkd !== null ? Number(bkd.toFixed(3)) : null;
        }
    }

    /*
    ==========================
    1. PENGAMATAN AWAL
    ==========================
    */
    if (key === "pengamatan") {
        if (row.pengamatan === "SAH") {
            row.perluImbuh = false;
            row.imbuh = "-";
            row.pengamatanSetelahImbuh = null;
            row.imbuh2 = "-";
            row.pengamatanSetelahImbuh2 = null;
            row.hasil = "SAH";
        }
        else if (row.pengamatan === "CEK_BAWAH") {
            row.perluImbuh = true;
            row.imbuh = `Beri imbuh sebesar ${row.bkd ?? "BKD"} g pada muatan uji`;
            row.pengamatanSetelahImbuh = null;
            row.imbuh2 = "-";
            row.pengamatanSetelahImbuh2 = null;
            row.hasil = null;
        }
        else if (row.pengamatan === "CEK_ATAS") {
            row.perluImbuh = true;
            row.imbuh = "Geser Bobot Ingsut sebesar 1 skala ke kanan";
            row.pengamatanSetelahImbuh = null;
            row.imbuh2 = "-";
            row.pengamatanSetelahImbuh2 = null;
            row.hasil = null;
        }
    }

    /*
    ==========================
    2. PENGAMATAN 1 (SETELAH IMBUH 1)
    ==========================
    */
    if (key === "pengamatanSetelahImbuh") {
        if (row.pengamatan === "CEK_BAWAH") {
            if (row.pengamatanSetelahImbuh === "SAH_1" || row.pengamatanSetelahImbuh === "SAH_2") {
                row.imbuh2 = "-";
                row.pengamatanSetelahImbuh2 = null;
                row.hasil = "SAH";
            } else if (row.pengamatanSetelahImbuh === "BATAL") {
                row.imbuh2 = "-";
                row.pengamatanSetelahImbuh2 = null;
                row.hasil = "BATAL";
            }
        }
        else if (row.pengamatan === "CEK_ATAS") {
            const nilaiE = row.nilaiE ?? 0;
            const bkd = row.bkd ?? 0;

            if (bkd >= nilaiE) {
                if (row.pengamatanSetelahImbuh === "SAH_1") {
                    row.imbuh2 = "-";
                    row.pengamatanSetelahImbuh2 = null;
                    row.hasil = "SAH";
                } else if (row.pengamatanSetelahImbuh === "BATAL") {
                    row.imbuh2 = "-";
                    row.pengamatanSetelahImbuh2 = null;
                    row.hasil = "BATAL";
                } else if (row.pengamatanSetelahImbuh === "SAH_2") {
                    row.imbuh2 = "Tambah imbuh sebesar 0,5 BKD, dan amati";
                    row.pengamatanSetelahImbuh2 = null;
                    row.hasil = null;
                }
            } else {
                if (row.pengamatanSetelahImbuh === "BATAL") {
                    row.imbuh2 = "-";
                    row.pengamatanSetelahImbuh2 = null;
                    row.hasil = "BATAL";
                } else if (row.pengamatanSetelahImbuh === "SAH_2") {
                    row.imbuh2 = "Tambah imbuh sebesar d - BKD, dan amati";
                    row.pengamatanSetelahImbuh2 = null;
                    row.hasil = null;
                }
            }
        }
    }

    /*
    ==========================
    3. PENGAMATAN 2 (SETELAH IMBUH 2)
    ==========================
    */
    if (key === "pengamatanSetelahImbuh2") {
        if (row.pengamatan === "CEK_ATAS" && row.pengamatanSetelahImbuh === "SAH_2") {
            if (
                row.pengamatanSetelahImbuh2 === "SAH_1" ||
                row.pengamatanSetelahImbuh2 === "SAH_2" ||
                row.pengamatanSetelahImbuh2 === "SAH_3"
            ) {
                row.hasil = "SAH";
            }
        }
    }

    updated[index] = row;
    return true;
}