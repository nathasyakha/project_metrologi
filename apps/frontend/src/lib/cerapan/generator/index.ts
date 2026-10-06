import { generateKebenaran } from "../calculator/generateKebenaran";
import { generateKepekaan } from "../calculator/generateKepekaan";
import { generateRepeatability } from "../calculator/generateRepeatability.ts";
import { generateEksentrisitas } from "../calculator/generateEksentrisitas";
import { generatePenyetelanNol } from "../calculator/generatePenyetelNol";



export const cerapanGenerators = {
    KEBENARAN:
        generateKebenaran,
    EKSENTRISITAS:
        generateEksentrisitas,
    PENYETELAN_NOL:
        generatePenyetelanNol,
    KEPEKAAN:
        generateKepekaan,
    REPEATABILITY:
        generateRepeatability,
};