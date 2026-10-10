import { handleEksentrisitas } from "./handleEksentrisitasMeja";
import { handleKebenaran } from "./handleKebenaran";
import { handleKepekaan } from "./handleKepekaan";
import { handleRepeatability } from "./handleRepeatability";

export function handler(
    context: any
) {

    const {
        section
    } = context;



    switch (section.generator) {


        case "KEBENARAN_MEJA":

            handleKebenaran(
                context
            );

            break;

        case "EKSENTRISITAS_MEJA":

            handleEksentrisitas(
                context
            );

            break;

        case "KEPEKAAN_MEJA":

            handleKepekaan(
                context
            );

            break;

        case "REPEATABILITY_MEJA":

            handleRepeatability(
                context
            );

            break;
    }



    return false;

}