import { HandlerContext } from "@/lib/cerapan/types/handler";
import { hitungBKDDacin } from "@/lib/cerapan/calculator/dacin/hitungBKDDacin";

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