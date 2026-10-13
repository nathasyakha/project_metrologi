import { handleKebenaran } from "./handleKebenaran";
import { handleKepekaan } from "./handleKepekaan";
import { handleRepeatability } from "./handleRepeatability";
import { handleEksentrisitas } from "./handleEksentrisitas";
import { handleKemiringan } from "./handleKemiringan";
import { handleKebenaranGandar } from "./handleKebenaranGandar";

export function handler(context: any) {
    const { section } = context;

    switch (section.generator) {
        case "KEBENARAN_BOBOT_INGSUT":
            handleKebenaran(context);
            break;
        case "KEPEKAAN_BOBOT_INGSUT":
            handleKepekaan(context);
            break;
        case "REPEATABILITY_BOBOT_INGSUT":
            handleRepeatability(context);
            break;
        case "EKSENTRISITAS_BOBOT_INGSUT":
            handleEksentrisitas(context);
            break;
        case "KEMIRINGAN_BOBOT_INGSUT":
            handleKemiringan(context);
            break;
        case "KEBENARAN_GANDAR_BOBOT_INGSUT":
            handleKebenaranGandar(context);
            break;
    }
    return false;
}