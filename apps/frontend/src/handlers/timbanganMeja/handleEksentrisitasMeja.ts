import { HandlerContext } from "@/lib/cerapan/types/handler";
import { hitungBKDMeja } from "@/lib/cerapan/calculator/timbanganMeja/hitungBKDMeja";

export function handleEksentrisitas({
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
    if (key === "lantaiAT") {
        const muatanUji = Number(row.lantaiAT);
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
                hitungBKDMeja({
                    kapasitasMaksimum: kapasitasMaksimum,
                    muatanUji: muatanUji,
                    layanan: row.layanan
                });
            row.bkd = bkd !== null ? Number(bkd.toFixed(3)) : null;
        }
    }

    /*
    ==========================
    PENGAMATAN AWAL
    ==========================
    */

    if (key === "pengamatan") {
        if (row.pengamatan === "CEK") {
            row.perluImbuh = true;
            row.imbuh = "Tambah imbuh sebesar BKD"
            row.hasil = null;
        }
        else if (row.pengamatan === "SAH") {
            row.perluImbuh = false;
            row.hasil = "SAH";
        }
    }

    /*
    ==========================
    SETELAH IMBUH
    ==========================
    */

    if (key === "pengamatanSetelahImbuh") {
        if (row.pengamatan !== "CEK") {
            return;
        }
        if (row.pengamatanSetelahImbuh === "SAH") {
            row.hasil = "SAH";
        }
        else if (row.pengamatanSetelahImbuh === "BATAL") {
            row.hasil = "BATAL";
        }
    }
}