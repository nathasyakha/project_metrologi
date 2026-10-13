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



    const row =
        updated[index];



    if (
        row.pengamatan === "SAH"
    ) {

        row.hasil =
            "SAH";

    }


    else if (
        row.pengamatan === "BATAL"
    ) {

        row.hasil =
            "BATAL";

    }


    else {

        row.hasil =
            null;

    }


}