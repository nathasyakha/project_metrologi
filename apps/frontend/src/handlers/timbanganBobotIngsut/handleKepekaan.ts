
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

    if (
        key === "lantaiAT" ||
        key === "maksGandar"
    ) {
        const lantaiAT = row.lantaiAT;

        if (
            lantaiAT == null ||
            lantaiAT === "" ||
            !Number.isFinite(Number(lantaiAT)) ||
            Number(lantaiAT) <= 0
        ) {
            row.maksGandar = null;
            row.bkd = null;
        } else {
            const muatanUji = Number(lantaiAT);

            row.maksGandar = Number(muatanUji);

            const kapasitasMaksimum = Number(row.kapasitasMaksimum);

            if (
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
                        layanan: row.layanan
                    });

                    row.bkd =
                        bkd !== null
                            ? Number(bkd.toFixed(3))
                            : null;
                } else {
                    row.bkd = null;
                }
            }
        }
    }

    /*
    ==========================
    HASIL PENGAMATAN
    ==========================
    */

    if (key === "pengamatan") {
        if (row.pengamatan === "SAH") {
            row.hasil = "SAH";
        } else if (row.pengamatan === "BATAL") {
            row.hasil = "BATAL";
        } else {
            row.hasil = null;
        }
    }

    /*
    ==========================
    SIMPAN PERUBAHAN
    ==========================
    */

    updated[index] = row;

    return true;
}
