
import { HandlerContext } from "@/lib/cerapan/types/handler";

export function handlePenyetelanNol({
    key,
    updated,
    index
}: HandlerContext) {
    if (
        key !== "pemeriksaan" &&
        key !== "jenisPenyetelNol"
    ) {
        return;
    }

    if (!Array.isArray(updated) || updated.length === 0) {
        return;
    }

    const row = updated[index];
    if (!row) return;

    /*
    ==================================
    PENENTUAN JENIS PENYETELAN NOL
    ==================================
    */

    if (key === "pemeriksaan") {
        switch (row.pemeriksaan) {
            case "BERUBAH":
                row.jenisPenyetelNol = "OTOMATIS";
                break;

            case "TIDAK_BERUBAH":
                row.jenisPenyetelNol = "SEMI OTOMATIS";
                break;

            default:
                row.jenisPenyetelNol = null;
                break;
        }
    }
}
