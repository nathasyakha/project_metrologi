import { HandlerContext } from "@/lib/cerapan/types/handler";


export function handleEksentrisitas({

    key,

    updated,

    index

}: HandlerContext) {


    if (
        key !== "pengamatan"
    ) {

        return;

    }



    updated[index].hasil =
        updated[index].pengamatan
        ??
        null;


}