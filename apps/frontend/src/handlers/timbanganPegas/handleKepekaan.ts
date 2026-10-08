import { HandlerContext } from "@/lib/cerapan/types/handler";


export function handleKepekaan({

    key,

    updated,

    index

}: HandlerContext) {


    if (
        key !== "pengamatan"
    ) {

        return;

    }


    /*
    =============================
    HASIL BERDASARKAN PENGAMATAN
    =============================
    */


    if (
        updated[index].pengamatan === "BERGERAK"
    ) {

        updated[index].hasil =
            "SAH";

    }
    else if (
        updated[index].pengamatan === "TIDAK_BERGERAK"
    ) {

        updated[index].hasil =
            "BATAL";

    }
    else {

        updated[index].hasil =
            "BATAL"

    }

}