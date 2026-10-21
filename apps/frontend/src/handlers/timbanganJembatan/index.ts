//import { handleKebenaran } from "./handleKebenaran";
//import { handleKepekaan } from "./handleKepekaan";
import { handleRepeatability } from "./handleRepeatability";
import { handleEksentrisitas } from "./handleEksentrisitas";
import { handlePenyetelanNol } from "./handlePenyetelanNol";

export function handler(context: any) {
    const { section } = context;

    switch (section.generator) {
        //case "KEBENARAN_PEGAS":
        //  return handleKebenaran(context);

        case "REPEATABILITY_JEMBATAN":
            return handleRepeatability(context);

        case "EKSENTRISITAS_JEMBATAN":
            return handleEksentrisitas(context);
        case "PENYETELAN_NOL_JEMBATAN":
            return handlePenyetelanNol(context);

        default:
            return false;
    }
}
