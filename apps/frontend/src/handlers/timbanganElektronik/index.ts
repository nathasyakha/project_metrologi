import {
    handlePenyetelanNol
} from "./handlePenyetelanNol";


import {
    handlePenyetelTara
} from "./handlePenyetelTara";


import {
    handleKebenaranEksentrisitas
} from "./handleKebenaranEksentrisitas";


import {
    handleRepeatability
} from "./handleRepeatability";


import {
    handleRepeatabilityTambahan
} from "./handleRepeatabilityTambahan";


import {
    handleUjiTambahan
} from "./handleUjiTambahan";



export function handler(
    context: any
) {

    const {
        section
    } = context;



    const handledTambahan =
        handleUjiTambahan(
            context
        );


    if (handledTambahan) {

        return true;

    }



    switch (section.generator) {


        case "PENYETELAN_NOL":

            handlePenyetelanNol(context);

            break;



        case "PENYETEL_TARA":

            handlePenyetelTara(context);

            break;



        case "KEBENARAN":

        case "EKSENTRISITAS":

            handleKebenaranEksentrisitas(context);

            break;



        case "REPEATABILITY":

            handleRepeatability(context);

            handleRepeatabilityTambahan(context);

            break;

    }


    return false;

}