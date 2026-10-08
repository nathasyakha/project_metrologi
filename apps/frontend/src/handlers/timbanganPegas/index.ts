import {
    handleKebenaran
}
    from "./handleKebenaran";

import {
    handleKepekaan
}
    from "./handleKepekaan";

import {
    handleRepeatability
} from "./handleRepeatability";

import {
    handleEksentrisitas
} from "./handleEksentrisitas";


export function handler(
    context: any
) {

    const {
        section
    } = context;


    switch (section.generator) {


        case "KEBENARAN":

            handleKebenaran(
                context
            );

            break;
        case "KEPEKAAN":

            handleKepekaan(
                context
            );

            break;
        case "REPEATABILITY_PEGAS":
            handleRepeatability(
                context
            );
            break;
        case "EKSENTRISITAS_PEGAS":
            handleEksentrisitas(
                context
            );
            break;


    }


    return false;

}