
import { handleKebenaran } from "./handleKebenaran";
import { handleKepekaan } from "./handleKepekaan";
import { handleRepeatability } from "./handleRepeatability";
import { handleEksentrisitas } from "./handleEksentrisitas";

export function handler(context: any) {
    const { section } = context;

    switch (section.generator) {
        case "KEBENARAN_PEGAS":
            return handleKebenaran(context);

        case "KEPEKAAN":
            return handleKepekaan(context);

        case "REPEATABILITY_PEGAS":
            return handleRepeatability(context);

        case "EKSENTRISITAS_PEGAS":
            return handleEksentrisitas(context);

        default:
            return false;
    }
}
