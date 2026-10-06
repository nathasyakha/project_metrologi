import {
    evaluasiUjiTambahan
} from "../lib/cerapan/calculator/evaluasiUjiTambahanKebenaran";


export function handleUjiTambahan({

    section,

    key,

    updated,

    index

}: any) {


    if (
        (
            section.generator === "KEBENARAN" ||
            section.generator === "EKSENTRISITAS"
        )
        &&
        key === "penunjukanSetelahImbuh"
    ) {

        evaluasiUjiTambahan(
            updated[index]
        );


        return true;

    }


    return false;

}