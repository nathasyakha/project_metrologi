import type { TestObservation } from "@/lib/peneraan";
import { generatePDFByInstrument } from "./pdf";

export async function generateCerapanPDF(
    observation: TestObservation
) {
    return generatePDFByInstrument(observation);
}
