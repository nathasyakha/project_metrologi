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

    row.penunjukanSebenarnya1 =
        Number(row.penunjukanTambahan1) +
        (Number(row.nilaiE) * 0.5) -
        Number(row.imbuh1);

    row.penunjukanSebenarnya2 =
        Number(row.penunjukanTambahan2) +
        (Number(row.nilaiE) * 0.5) -
        Number(row.imbuh2);

    row.penunjukanSebenarnya3 =
        Number(row.penunjukanTambahan3) +
        (Number(row.nilaiE) * 0.5) -
        Number(row.imbuh3);

    /*
    =============================
    VALIDASI
    =============================
    */

    const nilai = [
        Number(row.penunjukanSebenarnya1),
        Number(row.penunjukanSebenarnya2),
        Number(row.penunjukanSebenarnya3)
    ];

    const valid =
        nilai.every(
            Number.isFinite
        );

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