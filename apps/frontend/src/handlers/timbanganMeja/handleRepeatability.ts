import { HandlerContext } from "@/lib/cerapan/types/handler";


export function handleRepeatability({

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
            row.pengamatan === "CEK_ATAS" ||
            row.pengamatan === "CEK_BAWAH"
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
            row.pengamatan !== "CEK_ATAS" &&
            row.pengamatan !== "CEK_BAWAH"
        ) {

            return;

        }



        if (
            row.pengamatanSetelahImbuh === "SAH" ||
            row.pengamatanSetelahImbuh === "SAH2"
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