export function evaluasiKesimpulan(
    rows: any[]
) {


    const hasil: string[] = [];



    rows.forEach(
        row => {


            // hasil utama
            if (
                row.hasil
            ) {

                hasil.push(
                    row.hasil
                );

            }


            // hasil repeat tambahan
            if (
                row.hasilTambahan
            ) {

                hasil.push(
                    row.hasilTambahan
                );

            }


        }
    );



    /*
    belum ada pengujian selesai
    */

    if (
        hasil.length === 0
    ) {

        return null;

    }



    /*
    ada kegagalan
    */

    if (
        hasil.includes(
            "BATAL"
        )
    ) {

        return "BATAL";

    }



    /*
    semua selesai dan sah
    */

    if (
        hasil.every(
            h =>
                h === "SAH"
        )
    ) {

        return "SAH";

    }



    return null;

}