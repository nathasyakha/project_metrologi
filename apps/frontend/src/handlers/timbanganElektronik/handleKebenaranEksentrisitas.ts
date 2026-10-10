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
                    row.layanan
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

    const valid =

        Number.isFinite(
            Number(row.muatanUji)
        )
        &&
        Number.isFinite(
            Number(row.penunjukan)
        )
        &&
        Number.isFinite(
            Number(row.nilaiE)
        )
        &&
        Number.isFinite(
            Number(row.bkd)
        );

    if (!valid) {
        updated[index].hasil =
            null;
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