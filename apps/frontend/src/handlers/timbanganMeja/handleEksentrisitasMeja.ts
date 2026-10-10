import { HandlerContext } from "@/lib/cerapan/types/handler";


export function handleEksentrisitas({

    key,

    updated,

    index

}: HandlerContext) {


    const row =
        updated[index];



    /*
    ==========================
    PENGAMATAN AWAL
    ==========================
    */


    if (
        key === "pengamatan"
    ) {

        if (
            row.pengamatan === "CEK"
        ) {

            row.perluImbuh =
                true;


            /*
            imbuh sebesar BKD
            */

            row.imbuh =
                "Tambah imbuh sebesar BKD"


            row.hasil =
                null;

        }


        else if (
            row.pengamatan === "SAH"
        ) {

            row.perluImbuh =
                false;


            row.hasil =
                "SAH";

        }

    }



    /*
    ==========================
    SETELAH IMBUH
    ==========================
    */


    if (
        key === "pengamatanSetelahImbuh"
    ) {

        if (
            row.pengamatan !== "CEK"
        ) {

            return;

        }



        if (
            row.pengamatanSetelahImbuh === "SAH"
        ) {

            row.hasil =
                "SAH";

        }


        else if (
            row.pengamatanSetelahImbuh === "BATAL"
        ) {

            row.hasil =
                "BATAL";

        }

    }
}