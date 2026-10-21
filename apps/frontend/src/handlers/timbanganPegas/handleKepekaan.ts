
import { HandlerContext } from "@/lib/cerapan/types/handler";
import { hitungBKD } from "@/lib/cerapan/calculator/common/hitungBKD";
import { findBKDRule } from "@/lib/cerapan/rules/findBKDRules";

export function handleKepekaan({
    key,
    updated,
    index
}: HandlerContext) {

    const row = { ...updated[index] };

    /*
    ==========================
    HITUNG ULANG BKD
    ==========================
    */

    if (key === "muatanUji") {
        const raw = row.muatanUji;
        const muatanUji = Number(raw);
        const kapasitasMaksimum =
            Number(row.kapasitasMaksimum);

        if (
            raw == null ||
            raw === "" ||
            !Number.isFinite(muatanUji) ||
            muatanUji <= 0 ||
            !Number.isFinite(kapasitasMaksimum) ||
            kapasitasMaksimum <= 0 ||
            muatanUji > kapasitasMaksimum
        ) {
            row.bkd = null;
        } else {
            const rule = findBKDRule({
                jenisAlat: row.jenisAlat,
                kelas: row.kelas,
                pengujian: "KEPEKAAN"
            });

            if (rule) {
                const bkd = hitungBKD({
                    rule,
                    titikUji: muatanUji,
                    nilaiE: Number(row.nilaiE),
                    layanan: row.layanan,
                    jenisAlat: row.jenisAlat
                });

                row.bkd =
                    bkd != null
                        ? Number(bkd.toFixed(3))
                        : null;
            } else {
                row.bkd = null;
            }
        }
    }

    /*
    ==========================
    HASIL PENGAMATAN
    ==========================
    */

    if (key === "pengamatan") {
        if (row.pengamatan === "BERGERAK") {
            row.hasil = "SAH";
        } else if (
            row.pengamatan === "TIDAK_BERGERAK" ||
            row.pengamatan === "KURANG"
        ) {
            row.hasil = "BATAL";
        } else {
            row.hasil = null;
        }
    }

    updated[index] = row;
    return true;
}
