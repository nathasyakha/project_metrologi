import { handleKebenaran } from "./handleKebenaran";
import { handleKepekaan } from "./handleKepekaan";
import { handleRepeatability } from "./handleRepeatability";

export function handler(context: any) {
    const { section } = context;

    switch (section.generator) {
        case "KEBENARAN_DACIN":
            handleKebenaran(context);
            break;
        case "KEPEKAAN_DACIN":
            handleKepekaan(context);
            break;
        case "REPEATABILITY_DACIN":
            handleRepeatability(context);
            break;
    }
    return false;
}