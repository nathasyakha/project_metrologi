import { HandlerContext } from "@/lib/cerapan/types/handler";


export function handleKepekaan({

    key,
    updated,
    index

}: HandlerContext) {


    const row =
        updated[index];



    if (
        key !== "pengamatan"
    ) {

        return;

    }



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