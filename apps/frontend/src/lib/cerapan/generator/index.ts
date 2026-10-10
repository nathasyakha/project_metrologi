import { generateKebenaran } from "../calculator/timbanganElektronik/generateKebenaran.ts";
import { generateKepekaan } from "../calculator/timbanganPegas/generateKepekaan.ts";
import { generateRepeatability } from "../calculator/timbanganElektronik/generateRepeatability.ts";
import { generateEksentrisitas } from "../calculator/timbanganElektronik/generateEksentrisitas.ts";
import { generatePenyetelanNol } from "../calculator/timbanganElektronik/generatePenyetelNol.ts";



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