import { HandlerContext } from "@/lib/cerapan/types/handler";
import { hitungBKD } from "@/lib/cerapan/calculator/common/hitungBKD";
import { findBKDRule } from "@/lib/cerapan/rules/findBKDRules";

export function handleRepeatability({
    key,
    updated,
    index
}: HandlerContext) {

    /*
    ==========================
    HITUNG ULANG BKD
    ==========================
    */

    if (key === "muatanUji") {
        const row = { ...updated[index] };
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
                pengujian: "REPEATABILITY"
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

        updated[index] = row;
    }

    /*
    ==========================
    HITUNG REPEATABILITY
    ==========================
    */

    if (
        key !== "penunjukan" &&
        key !== "muatanUji"
    ) {
        return false;
    }

    const p1 = updated[0]?.penunjukan;
    const p2 = updated[1]?.penunjukan;
    const p3 = updated[2]?.penunjukan;

    const lengkap =
        p1 != null && p1 !== "" &&
        p2 != null && p2 !== "" &&
        p3 != null && p3 !== "";

    if (!lengkap) {
        updated[2].repeat = null;
        updated[2].hasil = null;
        return true;
    }

    const nilai = [
        Number(p1),
        Number(p2),
        Number(p3)
    ];

    if (!nilai.every(Number.isFinite)) {
        updated[2].repeat = null;
        updated[2].hasil = null;
        return true;
    }

    const repeat =
        Math.max(...nilai) -
        Math.min(...nilai);

    updated[2].repeat =
        Number(repeat.toFixed(3));

    const bkd = Number(updated[0].bkd);

    if (
        updated[0].bkd == null ||
        updated[0].bkd === "" ||
        !Number.isFinite(bkd)
    ) {
        updated[2].hasil = null;
    } else {
        updated[2].hasil =
            repeat <= bkd
                ? "SAH"
                : "BATAL";
    }

    return true;
}
