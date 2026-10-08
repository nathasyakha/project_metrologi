export function evaluasiKesimpulan(
    rows: any[]
) {

    /*
    =============================
    AMBIL DATA HASIL
    =============================
    */

    const hasil = rows
        .map(
            row => row.hasil
        )
        .filter(
            value =>
                value !== null &&
                value !== undefined &&
                value !== ""
        );



    /*
    =============================
    BELUM SELESAI
    =============================
    */

    if (
        hasil.length === 0
    ) {

        return null;

    }



    /*
    =============================
    ADA BATAL
    =============================
    */

    if (
        hasil.includes("BATAL")
    ) {

        return "BATAL";

    }



    /*
    =============================
    SEMUA SAH
    =============================
    */

    if (
        hasil.every(
            value =>
                value === "SAH"
        )
    ) {

        return "SAH";

    }



    return null;

}