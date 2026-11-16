import { hitungBKD } from "@/lib/cerapan/calculator/common/hitungBKD";
import { findBKDRule } from "@/lib/cerapan/rules/findBKDRules";
import { evaluasiKebenaran } from "@/lib/cerapan/calculator/timbanganElektronik/evaluasiKebenaran";
import { HandlerContext } from "@/lib/cerapan/types/handler";

export function handleKebenaranEksentrisitas({
    key,
    updated,
    index
}: HandlerContext) {
    if (
        key !== "muatanUji" &&
        key !== "penunjukan"
    ) {
        return;
    }

    let row =
        updated[index];

    /*
    =============================
    RESET SAAT INPUT BERUBAH
    =============================
    */

    if (
        key === "muatanUji"
        ||
        key === "penunjukan"
    ) {
        updated[index].pengamatan =
            null;
        updated[index].hasil =
            null;
    }

    /*
    =============================
    HITUNG BKD
    =============================
    */

    const rule =
        findBKDRule({
            jenisAlat:
                row.jenisAlat,
            kelas:
                row.kelas,
            pengujian:
                "KEBENARAN"
        });

    if (rule) {
        const bkd =
            hitungBKD({
                rule,
                titikUji:
                    Number(
                        row.muatanUji
                    ),
                nilaiE:
                    Number(
                        row.nilaiE
                    ),
                layanan:
                    row.layanan,
                jenisAlat: row.jenisAlat
            });

        updated[index].bkd =
            bkd !== null
                ?
                Number(
                    bkd.toFixed(3)
                )
                :
                null;
    }
    row = updated[index];

    /*
    =============================
    VALIDASI DATA
    =============================
    */

    const isValidNumber = (value: any): boolean => {
        if (
            value === null ||
            value === undefined ||
            String(value).trim() === ""
        ) {
            return false;
        }

        return Number.isFinite(Number(value));
    };

    const valid =
        isValidNumber(row.muatanUji) &&
        isValidNumber(row.penunjukan) &&
        isValidNumber(row.nilaiE) &&
        isValidNumber(row.bkd);

    if (!valid) {
        updated[index].hasil = null;
        updated[index].pengamatan = null;
        return;
    }
    /*
    =============================
    EVALUASI
    =============================
    */

    const evaluasi =
        evaluasiKebenaran({
            muatanUji:
                Number(row.muatanUji),
            penunjukan:
                Number(row.penunjukan),
            nilaiE:
                Number(row.nilaiE),
            bkd:
                Number(row.bkd),
            layanan:
                row.layanan
        });

    updated[index].pengamatan =
        evaluasi.pengamatan;
    updated[index].hasil =
        evaluasi.hasil;
    updated[index].perluUjiTambahan =
        evaluasi.perluUjiTambahan;
    updated[index].arahUjiTambahan =
        evaluasi.arahUjiTambahan;
}