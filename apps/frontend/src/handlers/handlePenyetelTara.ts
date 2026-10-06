import {
    evaluasiPenyetelTara
} from "@/lib/cerapan/calculator/evaluasiPenyetelTara";


export function handlePenyetelTara({

    key,

    updated,

    index

}: any) {


    if (
        key !== "penunjukan10e" &&
        key !== "penunjukan025e" &&
        key !== "penunjukan05e"
    ) {

        return;

    }


    evaluasiPenyetelTara(
        updated[index]
    );


}