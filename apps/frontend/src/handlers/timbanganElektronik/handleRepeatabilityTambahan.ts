import { HandlerContext } from "@/lib/cerapan/types/handler";

export function handleRepeatabilityTambahan({
    key,
    updated
}: HandlerContext) {
    if (
        key !== "penunjukanTambahan1" &&
        key !== "penunjukanTambahan2" &&
        key !== "penunjukanTambahan3" &&
        key !== "imbuh1" &&
        key !== "imbuh2" &&
        key !== "imbuh3"
    ) {
        return;
    }

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
    const row = updated[2];

    /*
=============================
PENUNJUKAN SEBENARNYA
P = I + 0,5e - ΔL
=============================
*/

    function hitungPenunjukanSebenarnya(
        penunjukan: any,
        imbuh: any,
        nilaiE: any
    ) {

        if (
            penunjukan === null ||
            penunjukan === undefined ||
            penunjukan === ""
        ) {
            return null;
        }


        return (
            Number(penunjukan)
            +
            (Number(nilaiE) * 0.5)
            -
            Number(imbuh ?? 0)
        );

    }



    row.penunjukanSebenarnya1 =
        hitungPenunjukanSebenarnya(
            row.penunjukanTambahan1,
            row.imbuh1,
            row.nilaiE
        );


    row.penunjukanSebenarnya2 =
        hitungPenunjukanSebenarnya(
            row.penunjukanTambahan2,
            row.imbuh2,
            row.nilaiE
        );


    row.penunjukanSebenarnya3 =
        hitungPenunjukanSebenarnya(
            row.penunjukanTambahan3,
            row.imbuh3,
            row.nilaiE
        );



    /*
    =============================
    VALIDASI
    =============================
    */

    const nilai = [

        row.penunjukanSebenarnya1,

        row.penunjukanSebenarnya2,

        row.penunjukanSebenarnya3

    ].filter(
        v =>
            v !== null &&
            v !== undefined
    );


    const valid =
        nilai.length === 3;


    if (!valid) {

        row.repeatTambahan = null;

        row.hasilTambahan = null;

        return;

    }

    /*
    =============================
    HITUNG R TAMBAHAN
    =============================
    */

    const pMax =
        Math.max(...nilai);

    const pMin =
        Math.min(...nilai);

    const repeatTambahan =
        Number(
            (pMax - pMin)
                .toFixed(3)
        );

    row.repeatTambahan = repeatTambahan;
    row.hasilTambahan =
        repeatTambahan <= batas
            ?
            "SAH"
            :
            "BATAL";
}