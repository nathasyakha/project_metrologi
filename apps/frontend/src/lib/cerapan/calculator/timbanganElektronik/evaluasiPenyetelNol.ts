export interface EvaluasiPenyetelNolInput {

    kapasitasMaksimum: number;
    nilaiE: number;
}


export function evaluasiPenyetelanNol(
    row: any
) {

    if (
        row.jenisPenyetelNol === "Semi otomatis"
    ) {


        /*
        =================================
        +0,25e
        =================================
        */


        if (
            row.penunjukanSM10e !== null &&
            row.penunjukanSM025e !== null
        ) {


            const selisih025 =
                Math.abs(
                    Number(row.penunjukanSM10e)
                    -
                    Number(row.penunjukanSM025e)
                );


            if (
                selisih025 === row.nilaiE
            ) {


                row.pengamatanSM025e =
                    "Berubah dan stabil sebesar 1e";


                row.hasil =
                    "BATAL";


                return;

            }


            else if (
                selisih025 === 0
            ) {


                row.pengamatanSM025e =
                    "Tetap, tambah imbuh 0,5e";


                row.hasil =
                    null;


            }


            else {


                row.pengamatanSM025e =
                    "Berubah";


                row.hasil =
                    "BATAL";


                return;

            }

        }



        /*
        =================================
        +0,5e
        =================================
        */


        if (
            row.penunjukanSM025e !== null &&
            row.penunjukanSM05e !== null
        ) {


            const selisih05 =
                Math.abs(
                    Number(row.penunjukanSM025e)
                    -
                    Number(row.penunjukanSM05e)
                );


            if (
                selisih05 === row.nilaiE
            ) {


                row.pengamatanSM05e =
                    "Berubah dan stabil sebesar 1e";


                row.hasil =
                    "SAH";


            }


            else if (
                selisih05 === 0
            ) {


                row.pengamatanSM05e =
                    "Tetap";


                row.hasil =
                    "BATAL";


            }


            else {


                row.pengamatanSM05e =
                    "Berubah";


                row.hasil =
                    "BATAL";

            }

        }

    }
    /*
  ===================================
  OTOMATIS
  ===================================
  */


    if (
        row.jenisPenyetelNol === "Otomatis"
    ) {
        const selisih025 =
            Math.abs(
                Number(row.penunjukanOtomatis10e)
                -
                Number(row.penunjukanOtomatis025e)
            );


        if (
            row.penunjukanOtomatis10e !== null &&
            row.penunjukanOtomatis025e !== null
        ) {


            if (
                selisih025 === 0
            ) {

                row.pengamatanOtomatis025e =
                    "Tetap, tambah imbuh 0,5e";


                row.hasil = null;


            }
            else if (
                selisih025 === row.nilaiE
            ) {
                row.pengamatanOtomatis025e =
                    "Berubah dan stabil sebesar 1e";
                row.hasil =
                    "BATAL";

            }
            else {


                row.pengamatanOtomatis025e =
                    "Berubah";

                row.hasil = "BATAL";

            }

        }



        if (
            row.penunjukanOtomatis025e !== null &&
            row.penunjukanOtomatis05e !== null
        ) {
            const selisih05 =
                Math.abs(
                    Number(row.penunjukanOtomatis025e)
                    -
                    Number(row.penunjukanOtomatis05e)
                );


            if (
                selisih05 === Number(row.nilaiE)
            ) {


                row.pengamatanOtomatis05e =
                    "Berubah dan stabil sebesar 1e";


                row.hasil =
                    "SAH";

            }

            else if (
                selisih05 === 0
            ) {


                row.pengamatanOtomatis05e =
                    "Tetap";


                row.hasil =
                    "BATAL";

            }
            else {


                row.pengamatanOtomatis05e =
                    "Berubah";

                row.hasil = "BATAL";

            }

        }

    }

}