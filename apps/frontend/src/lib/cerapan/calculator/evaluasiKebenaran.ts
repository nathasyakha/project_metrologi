export interface EvaluasiKebenaranInput {

    muatanUji: number;

    penunjukan: number;

    nilaiE: number;


    /*
     * BKD final hasil hitungBKD()
     *
     * TERA:
     * 0.5e / 1e / 1.5e
     *
     * TERA_ULANG:
     * 1e / 2e / 3e
     */
    bkd: number;


    layanan:
    | "TERA"
    | "TERA_ULANG";

}



export interface EvaluasiKebenaranResult {

    pengamatan: string;


    hasil:
    | "SAH"
    | "BATAL"
    | null;


    /*
     * Menampilkan UI imbuh 0,5e
     */
    perluUjiTambahan: boolean;


    /*
     * Arah kondisi tambahan
     *
     * PLUS:
     * ATS + n.e
     *
     * MINUS:
     * ATS - n.e
     */
    arahUjiTambahan:
    | "PLUS"
    | "MINUS"
    | null;

}




function hampirSama(
    a: number,
    b: number
): boolean {

    return Math.abs(a - b) < 0.000001;

}





/*
=====================================================
EVALUASI TERA
=====================================================
*/

function evaluasiTera(

    {
        muatanUji,
        penunjukan,
        nilaiE,
        bkd

    }: EvaluasiKebenaranInput

): EvaluasiKebenaranResult {


    const selisih =
        penunjukan - muatanUji;


    const abs =
        Math.abs(
            selisih
        );


    const faktor =
        bkd / nilaiE;



    /*
    =========================================
    BKD 0,5e
    =========================================
    */

    if (
        hampirSama(
            faktor,
            0.5
        )
    ) {


        if (
            hampirSama(
                abs,
                0
            )
        ) {

            return {

                pengamatan:
                    "Penunjukan = massa ATS",

                hasil:
                    "SAH",

                perluUjiTambahan:
                    false,

                arahUjiTambahan:
                    null

            };

        }


        return {

            pengamatan:
                "Penunjukan ≠ massa ATS",

            hasil:
                "BATAL",

            perluUjiTambahan:
                false,

            arahUjiTambahan:
                null

        };

    }





    /*
    =========================================
    BKD 1e
    =========================================
    */

    if (
        hampirSama(
            faktor,
            1
        )
    ) {


        /*
        ATS
        */

        if (
            hampirSama(
                abs,
                0
            )
        ) {

            return {

                pengamatan:
                    "Penunjukan = massa ATS",

                hasil:
                    "SAH",

                perluUjiTambahan:
                    false,

                arahUjiTambahan:
                    null

            };

        }




        /*
        ATS +1e
        ATS -1e
        */

        if (
            hampirSama(
                abs,
                nilaiE
            )
        ) {


            return {

                pengamatan:

                    selisih > 0

                        ?

                        "Penunjukan = ATS + 1e"

                        :

                        "Penunjukan = ATS - 1e",


                hasil:
                    null,


                perluUjiTambahan:
                    true,


                arahUjiTambahan:

                    selisih > 0

                        ?

                        "PLUS"

                        :

                        "MINUS"

            };

        }



        return {

            pengamatan:
                "Penunjukan > massa ATS ±1e",

            hasil:
                "BATAL",

            perluUjiTambahan:
                false,

            arahUjiTambahan:
                null

        };

    }






    /*
    =========================================
    BKD 1,5e
    =========================================
    */

    if (
        hampirSama(
            faktor,
            1.5
        )
    ) {


        if (
            hampirSama(
                abs,
                nilaiE
            )
        ) {

            return {

                pengamatan:
                    "Penunjukan = massa ATS",

                hasil:
                    "SAH",

                perluUjiTambahan:
                    false,

                arahUjiTambahan:
                    null

            };

        }

        if (
            abs <= nilaiE
        ) {

            return {

                pengamatan:
                    "Penunjukan = massa ATS ± 1e",

                hasil:
                    "SAH",

                perluUjiTambahan:
                    false,

                arahUjiTambahan:
                    null

            };

        }



        return {

            pengamatan:
                "Penunjukan > massa ATS ±1e",

            hasil:
                "BATAL",

            perluUjiTambahan:
                false,

            arahUjiTambahan:
                null

        };

    }



    return {

        pengamatan:
            "Faktor BKD TERA tidak dikenali",

        hasil:
            null,

        perluUjiTambahan:
            false,

        arahUjiTambahan:
            null

    };

}








/*
=====================================================
EVALUASI TERA ULANG
=====================================================
*/

function evaluasiTeraUlang(

    {
        muatanUji,
        penunjukan,
        nilaiE,
        bkd

    }: EvaluasiKebenaranInput

): EvaluasiKebenaranResult {


    const selisih =
        penunjukan - muatanUji;


    const abs =
        Math.abs(
            selisih
        );


    const faktor =
        bkd / nilaiE;



    /*
    =========================================
    BKD 1e
    (0,5e tera × 2)
    =========================================
    */

    if (
        hampirSama(
            faktor,
            1
        )
    ) {

        if (
            hampirSama(
                abs,
                0
            )
        ) {

            return {

                pengamatan:
                    "Penunjukan = massa ATS",

                hasil:
                    "SAH",

                perluUjiTambahan:
                    false,

                arahUjiTambahan:
                    null

            };

        }

        if (
            hampirSama(
                abs,
                nilaiE
            )
        ) {


            return {

                pengamatan:

                    selisih > 0

                        ?

                        "Penunjukan = ATS + 1e"

                        :

                        "Penunjukan = ATS - 1e",


                hasil:
                    null,


                perluUjiTambahan:
                    true,


                arahUjiTambahan:

                    selisih > 0

                        ?

                        "PLUS"

                        :

                        "MINUS"

            };

        }

        return {

            pengamatan:
                "Penunjukan > massa ATS ±1e",

            hasil:
                "BATAL",

            perluUjiTambahan:
                false,

            arahUjiTambahan:
                null

        };

    }





    /*
    =========================================
    BKD 2e
    (1e tera ×2)
    =========================================
    */

    if (
        hampirSama(
            faktor,
            2
        )
    ) {


        if (
            hampirSama(
                abs,
                0
            )
        ) {

            return {

                pengamatan:
                    "Penunjukan = massa ATS",

                hasil:
                    "SAH",

                perluUjiTambahan:
                    false,

                arahUjiTambahan:
                    null

            };

        }


        if (
            abs <= nilaiE
        ) {

            return {

                pengamatan:
                    "Penunjukan = massa ATS ±1e",

                hasil:
                    "SAH",

                perluUjiTambahan:
                    false,

                arahUjiTambahan:
                    null

            };

        }




        if (
            hampirSama(
                abs,
                2 * nilaiE
            )
        ) {

            return {

                pengamatan:

                    selisih > 0

                        ?

                        "Penunjukan = ATS + 2e"

                        :

                        "Penunjukan = ATS - 2e",


                hasil:
                    null,


                perluUjiTambahan:
                    true,


                arahUjiTambahan:

                    selisih > 0

                        ?

                        "PLUS"

                        :

                        "MINUS"

            };

        }




        return {

            pengamatan:
                "Penunjukan > ATS ±2e",

            hasil:
                "BATAL",

            perluUjiTambahan:
                false,

            arahUjiTambahan:
                null

        };

    }





    /*
    =========================================
    BKD 3e
    (1,5e tera ×2)
    =========================================
    */

    if (
        hampirSama(
            faktor,
            3
        )
    ) {
        if (
            hampirSama(
                abs,
                0
            )
        ) {

            return {

                pengamatan:
                    "Penunjukan = massa ATS",

                hasil:
                    "SAH",

                perluUjiTambahan:
                    false,

                arahUjiTambahan:
                    null

            };

        }
        if (
            abs <= nilaiE
        ) {

            return {

                pengamatan:
                    "Penunjukan = massa ATS ±1e",

                hasil:
                    "SAH",

                perluUjiTambahan:
                    false,

                arahUjiTambahan:
                    null

            };

        }

        if (
            abs <= 2 * nilaiE
        ) {

            return {

                pengamatan:
                    "Penunjukan = massa ATS ±2e",

                hasil:
                    "SAH",

                perluUjiTambahan:
                    false,

                arahUjiTambahan:
                    null

            };

        }

        if (
            hampirSama(
                abs,
                3 * nilaiE
            )
        ) {

            return {

                pengamatan:

                    selisih > 0

                        ?

                        "Penunjukan = ATS + 3e"

                        :

                        "Penunjukan = ATS - 3e",


                hasil:
                    null,


                perluUjiTambahan:
                    true,


                arahUjiTambahan:

                    selisih > 0

                        ?

                        "PLUS"

                        :

                        "MINUS"

            };

        }

        return {

            pengamatan:
                "Penunjukan > massa ATS ±3e",

            hasil:
                "BATAL",

            perluUjiTambahan:
                false,

            arahUjiTambahan:
                null

        };

    }



    return {

        pengamatan:
            "Faktor BKD TERA ULANG tidak dikenali",

        hasil:
            null,

        perluUjiTambahan:
            false,

        arahUjiTambahan:
            null

    };

}







/*
=====================================================
MAIN FUNCTION
=====================================================
*/

export function evaluasiKebenaran(

    data: EvaluasiKebenaranInput

): EvaluasiKebenaranResult {



    if (

        !Number.isFinite(
            data.muatanUji
        ) ||

        !Number.isFinite(
            data.penunjukan
        ) ||

        !Number.isFinite(
            data.nilaiE
        ) ||

        !Number.isFinite(
            data.bkd
        )

    ) {

        return {

            pengamatan:
                "",

            hasil:
                null,

            perluUjiTambahan:
                false,

            arahUjiTambahan:
                null

        };

    }



    if (
        data.layanan === "TERA"
    ) {

        return evaluasiTera(
            data
        );

    }




    if (
        data.layanan === "TERA_ULANG"
    ) {

        return evaluasiTeraUlang(
            data
        );

    }




    return {

        pengamatan:
            "Layanan tidak dikenali",

        hasil:
            null,

        perluUjiTambahan:
            false,

        arahUjiTambahan:
            null

    };

}