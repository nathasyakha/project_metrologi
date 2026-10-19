import { HandlerContext } from "@/lib/cerapan/types/handler";
import { hitungBKD } from "@/lib/cerapan/calculator/common/hitungBKD";
import { findBKDRule } from "@/lib/cerapan/rules/findBKDRules";

export function handleKebenaran({
    key,
    updated,
    index
}: HandlerContext) {

    const row = { ...updated[index] };

    // Hitung ulang BKD ketika muatan diubah
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
                pengujian: "KEBENARAN"
            });

            if (rule) {
                const bkd = hitungBKD({
                    rule,
                    titikUji: muatanUji,
                    nilaiE: Number(row.nilaiE),
                    layanan: row.layanan
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

    // Hasil pengamatan
    if (key === "pengamatan") {
        row.hasil =
            row.pengamatan === "SAH" ||
                row.pengamatan === "BATAL"
                ? row.pengamatan
                : null;
    }

    updated[index] = row;
    return true;
}
