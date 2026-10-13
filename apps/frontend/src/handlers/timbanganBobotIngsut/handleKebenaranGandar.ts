import { HandlerContext } from "@/lib/cerapan/types/handler";


export function handleKebenaranGandar({

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
            row.pengamatan === "CEK_ATAS"
        ) {

            row.perluImbuh =
                true;


            /*
            imbuh sebesar BKD
            */

            row.imbuh =
                "geser bobot ingsut kecil sebesar 1 BKD"


            row.hasil =
                null;

        }

        else if (
            row.pengamatan === "CEK_BAWAH"
        ) {

            row.perluImbuh =
                true;


            /*
            imbuh sebesar BKD
            */

            row.imbuh =
                "beri imbuh sebesar BKD pada lantai muatan"


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
            row.pengamatan !== "CEK_ATAS" &&
            row.pengamatan !== "CEK_BAWAH"
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