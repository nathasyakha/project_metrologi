import { handleKebenaran } from "./handleKebenaran";
import { handleKepekaan } from "./handleKepekaan";
import { handleRepeatability } from "./handleRepeatability";
import { handleEksentrisitas } from "./handleEksentrisitas";
import { handleKemiringan } from "./handleKemiringan";
import { handleKebenaranGandar } from "./handleKebenaranGandar";
import { handleAnakTimbanganPerlengkapan } from "./handleAnakTimbanganPerlengkapan";

export function handler(
    context: any
) {

    const {
        section
    } = context;



    switch (section.generator) {


        case "KEBENARAN_SENTISIMAL":

            handleKebenaran(
                context
            );

            break;

        case "KEPEKAAN_SENTISIMAL":

            handleKepekaan(
                context
            );

            break;
        case "REPEATABILITY_SENTISIMAL":

            handleRepeatability(
                context
            );

            break;

        case "EKSENTRISITAS_SENTISIMAL":
            handleEksentrisitas(
                context
            );
            break;
        case "KEMIRINGAN_SENTISIMAL":
            handleKemiringan(
                context
            );
            break;
        case "KEBENARAN_GANDAR_SENTISIMAL":
            handleKebenaranGandar(
                context
            );
            break;
        case "ANAK_TIMBANGAN_PERLENGKAPAN":
            handleAnakTimbanganPerlengkapan(
                context
            );
            break;

    }



    return false;

}