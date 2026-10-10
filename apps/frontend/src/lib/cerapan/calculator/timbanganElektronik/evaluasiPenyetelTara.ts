export function evaluasiPenyetelTara(
    row: any
) {

    /*
    ==========================
    CEK +0,25e
    ==========================
    */


    if (
        row.penunjukan10e !== null &&
        row.penunjukan025e !== null
    ) {

        const selisih025 =
            Math.abs(
                Number(row.penunjukan10e)
                -
                Number(row.penunjukan025e)
            );


        if (
            selisih025 === 0
        ) {

            row.pengamatan025e =
                "Tetap, tambah imbuh 0,5e";

            row.hasil =
                null;

        }
        else if (
            selisih025 === Number(row.nilaiE)
        ) {
            row.pengamatan025e =
                "Berubah dan stabil sebesar 1e";
            row.hasil =
                "BATAL";
        }


        else {


            row.pengamatan025e =
                "Berubah";


            row.hasil =
                "BATAL";


            return;

        }

    }



    /*
    ==========================
    CEK +0,5e
    ==========================
    */


    if (
        row.penunjukan025e !== null &&
        row.penunjukan05e !== null
    ) {



        const selisih05 =
            Math.abs(
                Number(row.penunjukan025e)
                -
                Number(row.penunjukan05e)
            );



        if (
            selisih05 === Number(row.nilaiE)
        ) {

            row.pengamatan05e =
                "Berubah dan stabil sebesar 1e";


            row.hasil =
                "SAH";


        }
        else if (
            selisih05 !== Number(row.nilaiE)
        ) {
            row.pengamatan05e =
                "Berubah";
            row.hasil =
                "BATAL";
        }


        else {


            row.pengamatan05e =
                "Tetap";


            row.hasil =
                "BATAL";

        }

    }

}