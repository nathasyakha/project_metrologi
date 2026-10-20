import { HandlerContext } from "@/lib/cerapan/types/handler";

export function handleAnakTimbanganPerlengkapan({
    key,
    updated,
    index
}: HandlerContext) {
    const row = updated[index];

    if (key !== "kesalahan") {
        return;
    }

    /*
    ==========================
    VALIDASI INPUT
    ==========================
    */


    if (
        row.kesalahan === null ||
        row.kesalahan === ""
    ) {
        row.hasil = null;
        return;
    }

    /*
    ==========================
    CEK BKD
    ==========================
    */
    const kesalahan = Math.abs(Number(row.kesalahan));
    const bkd = Number(row.bkd);

    if (
        !Number.isFinite(kesalahan) ||
        !Number.isFinite(bkd)
    ) {
        row.hasil = null;
        return;
    }

    /*
    ==========================
    HASIL
    ==========================
    */

    row.hasil =
        kesalahan <= bkd ?
            "SAH" :
            "BATAL";

}