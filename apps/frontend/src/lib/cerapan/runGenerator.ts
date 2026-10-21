import { generateKebenaran } from "./calculator/timbanganElektronik/generateKebenaran";
import { generateKepekaan } from "./calculator/timbanganPegas/generateKepekaan";
import { generateEksentrisitas } from "./calculator/timbanganElektronik/generateEksentrisitas";
import { generateRepeatability } from "./calculator/timbanganElektronik/generateRepeatability";
import { generatePenyetelanNol } from "./calculator/timbanganElektronik/generatePenyetelNol";
import { generatePenyetelTara } from "./calculator/timbanganElektronik/generatePenyetelTara";
import { generateKebenaranPegas } from "./calculator/timbanganPegas/generateKebenaranPegas";
import { generateRepeatabilityPegas } from "./calculator/timbanganPegas/generateRepeatabilityPegas";
import { generateEksentrisitasPegas } from "./calculator/timbanganPegas/generateEksentrisitasPegas";
import { generateKebenaranMeja } from "./calculator/timbanganMeja/generateKebenaranMeja";
import { generateEksentrisitasMeja } from "./calculator/timbanganMeja/generateEksentrisitasMeja";
import { generateKepekaanMeja } from "./calculator/timbanganMeja/generateKepekaanMeja";
import { generateRepeatabilityMeja } from "./calculator/timbanganMeja/generateRepeatabilityMeja";
import { generateKebenaranSentisimal } from "./calculator/timbanganSentisimal/generateKebenaranSentisimal";
import { generateKepekaanSentisimal } from "./calculator/timbanganSentisimal/generateKepekaanSentisimal";
import { generateEksentrisitasSentisimal } from "./calculator/timbanganSentisimal/generateEksentrisitasSentisimal";
import { generateRepeatabilitySentisimal } from "./calculator/timbanganSentisimal/generateRepeatabilitySentisimal";
import { generateKemiringanSentisimal } from "./calculator/timbanganSentisimal/generateKemiringanSentisimal";
import { generateKebenaranGandar } from "./calculator/timbanganSentisimal/generateKebenaranGandar";
import { generateAnakTimbangan } from "./calculator/anakTimbangan/generateAnakTimbangan";
import { generateKebenaranBobotIngsut } from "./calculator/timbanganBobotIngsut/generateKebenaranBobotIngsut";
import { generateKepekaanBobotIngsut } from "./calculator/timbanganBobotIngsut/generateKepekaanBobotIngsut";
import { generateRepeatabilityBobotIngsut } from "./calculator/timbanganBobotIngsut/generateRepeatabilityBobotIngsut";
import { generateEksentrisitasBobotIngsut } from "./calculator/timbanganBobotIngsut/generateEksentrisitasBobotIngsut";
import { generateKemiringanBobotIngsut } from "./calculator/timbanganBobotIngsut/generateKemiringanBobotIngsut";
import { generateKebenaranGandarBobotIngsut } from "./calculator/timbanganBobotIngsut/generateKebenaranGandarBobotIngsut";
import { generateKebenaranDacin } from "./calculator/dacin/generateKebenaranDacin";
import { generateKepekaanDacin } from "./calculator/dacin/generateKepekaanDacin";
import { generateRepeatabilityDacin } from "./calculator/dacin/generateRepeatabilityDacin";
import { generateRepeatabilityJembatan } from "./calculator/timbanganJembatan/generateRepeatabilityJembatan";
import { generateEksentrisitasJembatan } from "./calculator/timbanganJembatan/generateEksentrisitasJembatan";
import { generatePenyetelanNolJembatan } from "./calculator/timbanganJembatan/generatePenyetelanNolJembatan";

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
            instrument.jenisAlat === "TIMBANGAN_JEMBATAN"
                ? Number(instrument.kapasitasMaksimum)
                : instrument.capacityUnit === "kg"
                    ? Number(instrument.kapasitasMaksimum) * 1000
                    : Number(instrument.kapasitasMaksimum),


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
        case "KEBENARAN_PEGAS":
            return generateKebenaranPegas(input);
        case "REPEATABILITY_PEGAS":
            return generateRepeatabilityPegas(input);
        case "EKSENTRISITAS_PEGAS":
            return generateEksentrisitasPegas(input);
        case "KEBENARAN_MEJA":
            return generateKebenaranMeja(input);
        case "EKSENTRISITAS_MEJA":
            return generateEksentrisitasMeja(input);
        case "KEPEKAAN_MEJA":
            return generateKepekaanMeja(input);
        case "REPEATABILITY_MEJA":
            return generateRepeatabilityMeja(input);
        case "KEBENARAN_SENTISIMAL":
            return generateKebenaranSentisimal(input);
        case "KEPEKAAN_SENTISIMAL":
            return generateKepekaanSentisimal(input);
        case "REPEATABILITY_SENTISIMAL":
            return generateRepeatabilitySentisimal(input);
        case "EKSENTRISITAS_SENTISIMAL":
            return generateEksentrisitasSentisimal(input);
        case "KEMIRINGAN_SENTISIMAL":
            return generateKemiringanSentisimal(input);
        case "KEBENARAN_GANDAR_SENTISIMAL":
            return generateKebenaranGandar(input);
        case "ANAK_TIMBANGAN_PERLENGKAPAN":
            return generateAnakTimbangan(input);
        case "KEBENARAN_BOBOT_INGSUT":
            return generateKebenaranBobotIngsut(input);
        case "KEPEKAAN_BOBOT_INGSUT":
            return generateKepekaanBobotIngsut(input);
        case "REPEATABILITY_BOBOT_INGSUT":
            return generateRepeatabilityBobotIngsut(input);
        case "EKSENTRISITAS_BOBOT_INGSUT":
            return generateEksentrisitasBobotIngsut(input);
        case "KEMIRINGAN_BOBOT_INGSUT":
            return generateKemiringanBobotIngsut(input);
        case "KEBENARAN_GANDAR_BOBOT_INGSUT":
            return generateKebenaranGandarBobotIngsut(input);
        case "KEBENARAN_DACIN":
            return generateKebenaranDacin(input);
        case "KEPEKAAN_DACIN":
            return generateKepekaanDacin(input);
        case "REPEATABILITY_DACIN":
            return generateRepeatabilityDacin(input);
        case "REPEATABILITY_JEMBATAN":
            return generateRepeatabilityJembatan(input);
        case "EKSENTRISITAS_JEMBATAN":
            return generateEksentrisitasJembatan(input);
        case "PENYETELAN_NOL_JEMBATAN":
            return generatePenyetelanNolJembatan(input);
        default:
            return [];

    }



}