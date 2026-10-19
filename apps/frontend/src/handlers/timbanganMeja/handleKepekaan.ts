import { HandlerContext } from "@/lib/cerapan/types/handler";
import { hitungBKDMeja } from "@/lib/cerapan/calculator/timbanganMeja/hitungBKDMeja";

export function handleKepekaan({
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

    if (row.pengamatan === "SAH") {
        row.hasil = "SAH";
    }
    else if (row.pengamatan === "BATAL") {
        row.hasil = "BATAL";
    }
    else {
        row.hasil = null;
    }
}