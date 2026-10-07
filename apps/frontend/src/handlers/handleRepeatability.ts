import { HandlerContext } from "@/lib/cerapan/types/handler";

export function handleRepeatability({
    key,
    updated
}: HandlerContext) {
    if (
        key !== "penunjukan" &&
        key !== "penunjukan2" &&
        key !== "penunjukanSetelahImbuh" &&
        key !== "penunjukanTambahan1" &&
        key !== "penunjukanTambahan2" &&
        key !== "penunjukanTambahan3"
    ) {
        return;
    }

    /*
    =============================
    EVALUASI IMBUH 0,5e
    =============================
    */

    updated.forEach((row: any) => {
        if (
            Number.isFinite(
                Number(row.penunjukan)
            )
            &&
            Number.isFinite(
                Number(row.penunjukanSetelahImbuh)
            )
        ) {
            if (
                Number(row.penunjukan)
                ===
                Number(row.penunjukanSetelahImbuh)
            ) {
                row.pengamatan05e =
                    "Tetap, +0,5e sampai penunjukan bertambah → angkat 0,5e dari lantai muatan";
            }
            else {
                row.pengamatan05e =
                    "Berubah → angkat 0,5e dari lantai muatan";
            }
        }
        else {
            row.pengamatan05e = null;
        }
    });

    /*
    =============================
    BATAS REPEATABILITY
    =============================
    */

    const batas =
        updated[0].layanan === "TERA"
            ?
            updated[0].nilaiE
            :
            updated[0].nilaiE * 2;

    /*
    =============================
    P1 P2 P3
    =============================
    */


    const p1 =
        updated[0]?.penunjukan2;
    const p2 =
        updated[1]?.penunjukan2;
    const p3 =
        updated[2]?.penunjukan2;

    const valid =
        Number.isFinite(Number(p1)) &&
        Number.isFinite(Number(p2)) &&
        Number.isFinite(Number(p3)) &&
        p1 !== "" &&
        p2 !== "" &&
        p3 !== "";

    if (!valid) {
        updated[2].repeat = null;
        updated[2].hasil = null;
        return;
    }

    const nilai = [
        p1,
        p2,
        p3
    ]
        .filter(
            v =>
                v !== null &&
                v !== undefined &&
                v !== ""
        )
        .map(Number);

    let repeat = null;

    /*
    =============================
    HITUNG REPEATABILITY
    MINIMAL 2 DATA
    =============================
    */

    if (
        nilai.length >= 2
    ) {
        const pMax =
            Math.max(...nilai);
        const pMin =
            Math.min(...nilai);
        repeat =
            Number(
                (
                    pMax - pMin
                )
                    .toFixed(3)
            );

        updated[2].repeat =
            repeat;
    }
    else {
        updated[2].repeat =
            null;
    }

    /*
    =============================
    HASIL HANYA JIKA 3 DATA
    =============================
    */
    if (
        nilai.length === 3 &&
        repeat !== null
    ) {
        updated[2].hasil =
            repeat <= batas
                ?
                "SAH"
                :
                "BATAL";
    }
    else {
        updated[2].hasil = null;
    }

    /*
    =============================
    CEK TAMBAHAN
    P1-P2 = BATAS
    =============================
    */

    const selisih =
        Math.abs(
            Number(p1) -
            Number(p2)
        );

    updated[2].selisih =
        selisih;

    if (
        selisih === batas
    ) {
        updated[2].perluUjiTambahan =
            true;
        updated[2].tampilTambahan =
            true;
    }
    else {
        updated[2].perluUjiTambahan =
            false;
        updated[2].tampilTambahan =
            false;
    }
}