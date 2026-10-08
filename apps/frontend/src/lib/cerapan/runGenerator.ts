import { generateKebenaran } from "./calculator/generateKebenaran";
import { generateKepekaan } from "./calculator/generateKepekaan";
import { generateEksentrisitas } from "./calculator/generateEksentrisitas";
import { generateRepeatability } from "./calculator/generateRepeatability";
import { generatePenyetelanNol } from "./calculator/generatePenyetelNol";
import { generatePenyetelTara } from "./calculator/generatePenyetelTara";
import { generateRepeatabilityPegas } from "./calculator/generateRepeatabilityPegas";
import { generateEksentrisitasPegas } from "./calculator/generateEksentrisitasPegas";


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