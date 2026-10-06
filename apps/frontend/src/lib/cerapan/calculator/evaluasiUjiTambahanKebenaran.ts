/*
     * ==========================================
     * EVALUASI UJI TAMBAHAN 0,5e
     * ==========================================
     *
     * Digunakan khusus apabila pengujian
     * kebenaran berada pada kondisi 1e
     * yang membutuhkan pengamatan tambahan.
     *
     * PLUS:
     * ATS + 1e
     *
     * setelah tambah 0,5e:
     * berubah -> BATAL
     * tetap   -> SAH
     *
     * MINUS:
     * ATS - 1e
     *
     * setelah tambah 0,5e:
     * berubah -> SAH
     * tetap   -> BATAL
     */

export function evaluasiUjiTambahan(
    row: any
) {

    /*
     * Input belum diisi
     */
    if (
        row.penunjukanSetelahImbuh === null ||
        row.penunjukanSetelahImbuh === undefined ||
        row.penunjukanSetelahImbuh === ""
    ) {
        row.hasil =
            null;
        return;
    }

    const penunjukanAwal =
        Number(
            row.penunjukan
        );
    const penunjukanSetelah =
        Number(
            row.penunjukanSetelahImbuh
        );

    if (
        !Number.isFinite(
            penunjukanAwal
        ) ||
        !Number.isFinite(
            penunjukanSetelah
        )
    ) {

        row.hasil =
            null;

        return;

    }


    /*
     * Apakah penunjukan berubah
     */
    const berubah =
        penunjukanSetelah !==
        penunjukanAwal;


    /*
     * ==========================================
     * ATS + 1e
     * ==========================================
     */

    if (
        row.arahUjiTambahan ===
        "PLUS"
    ) {

        row.pengamatan =
            berubah

                ? "ATS + 1e → tambah 0,5e → penunjukan berubah"

                : "ATS + 1e → tambah 0,5e → penunjukan tetap";


        row.hasil =
            berubah

                ? "BATAL"

                : "SAH";


        return;

    }


    /*
     * ==========================================
     * ATS - 1e
     * ==========================================
     */

    if (
        row.arahUjiTambahan ===
        "MINUS"
    ) {

        row.pengamatan =
            berubah

                ? "ATS - 1e → tambah 0,5e → penunjukan berubah"

                : "ATS - 1e → tambah 0,5e → penunjukan tetap";


        row.hasil =
            berubah

                ? "SAH"

                : "BATAL";


        return;

    }


    row.hasil =
        null;

}