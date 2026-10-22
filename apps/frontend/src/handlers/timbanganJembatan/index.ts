import { handleKebenaran } from "./handleKebenaran";
import { handleRepeatability } from "./handleRepeatability";
import { handleEksentrisitas } from "./handleEksentrisitas";
import { handlePenyetelanNol } from "./handlePenyetelanNol";
import { handlePenyetelTara } from "./handlePenyetelTara";

export function handler(context: any) {
    const { section } = context;

    switch (section.generator) {
        case "KEBENARAN_JEMBATAN":
            return handleKebenaran(context);
        case "REPEATABILITY_JEMBATAN":
            return handleRepeatability(context);
        case "EKSENTRISITAS_JEMBATAN":
            return handleEksentrisitas(context);
        case "PENYETELAN_NOL_JEMBATAN":
            return handlePenyetelanNol(context);
        case "PENYETELAN_TARA_JEMBATAN":
            return handlePenyetelTara(context);
        default:
            return false;
    }
}
