import type { TestObservation } from "@/lib/peneraan";
import { generatePDF as generateElektronik } from "./timbanganElektronik/generatePDF";
import { generatePDF as generatePegas } from "./timbanganPegas/generatePDF";

export async function generatePDFByInstrument(
    observation: TestObservation
) {
    const jenisAlat =
        observation.observationData?.identitas?.jenisAlat;

    switch (jenisAlat) {
        case "TIMBANGAN_ELEKTRONIK":
            return generateElektronik(observation);

        case "TIMBANGAN_PEGAS":
            return generatePegas(observation);

        case "TIMBANGAN_MEJA":
            throw new Error(
                "Generator PDF Timbangan Meja belum tersedia"
            );

        case "TIMBANGAN_SENTISIMAL":
            throw new Error(
                "Generator PDF Timbangan Sentisimal belum tersedia"
            );

        case "TIMBANGAN_BOBOT_INGSUT":
            throw new Error(
                "Generator PDF Timbangan Bobot Ingsut belum tersedia"
            );

        case "DACIN":
            throw new Error(
                "Generator PDF Dacin belum tersedia"
            );

        case "TIMBANGAN_JEMBATAN":
            throw new Error(
                "Generator PDF Timbangan Jembatan belum tersedia"
            );

        default:
            throw new Error(
                `Jenis alat tidak dikenali: ${jenisAlat}`
            );
    }
}
