import { generateKebenaran } from "./calculator/timbanganElektronik/generateKebenaran";
import { generateKepekaan } from "./calculator/timbanganPegas/generateKepekaan";
import { generateEksentrisitas } from "./calculator/timbanganElektronik/generateEksentrisitas";
import { generateRepeatability } from "./calculator/timbanganElektronik/generateRepeatability";
import { generatePenyetelanNol } from "./calculator/timbanganElektronik/generatePenyetelNol";
import { generatePenyetelTara } from "./calculator/timbanganElektronik/generatePenyetelTara";
import { generateRepeatabilityPegas } from "./calculator/timbanganPegas/generateRepeatabilityPegas";
import { generateEksentrisitasPegas } from "./calculator/timbanganPegas/generateEksentrisitasPegas";


export function runCerapanGenerator(
    instrument: any,
    pengujian: string
) {


    const input = {

        jenisAlat:
            instrument.jenisAlat,


        kelas:
            instrument.kelas,


        kapasitasMinimum:
            Number(instrument.kapasitasMinimum),

        kapasitasMaksimum:
            instrument.capacityUnit === "kg"
                ?
                Number(instrument.kapasitasMaksimum) * 1000
                :
                Number(instrument.kapasitasMaksimum),


        nilaiE:
            instrument.dayabacaUnit === "kg"
                ?
                Number(instrument.dayabaca) * 1000
                :
                Number(instrument.dayabaca),


        layanan:
            instrument.layanan

    };


    console.log(
        "INPUT GENERATOR",
        input
    );


    switch (pengujian) {
        case "KEBENARAN":
            return generateKebenaran(input);
        case "EKSENTRISITAS":
            return generateEksentrisitas(input);
        case "PENYETELAN_NOL":
            return generatePenyetelanNol(input);
        case "PENYETEL_TARA":
            return generatePenyetelTara(input);
        case "KEPEKAAN":
            return generateKepekaan(input);
        case "REPEATABILITY":
            return generateRepeatability(input);
        case "REPEATABILITY_PEGAS":
            return generateRepeatabilityPegas(input);
        case "EKSENTRISITAS_PEGAS":
            return generateEksentrisitasPegas(input);
        default:
            return [];

    }



}