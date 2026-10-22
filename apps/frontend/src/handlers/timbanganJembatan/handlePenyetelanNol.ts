import { evaluasiJenisPenyetelNol } from "@/lib/cerapan/calculator/timbanganElektronik/evaluasiJenisPenyetelNol";
import { evaluasiPenyetelanNol } from "@/lib/cerapan/calculator/timbanganElektronik/evaluasiPenyetelNol";
import { HandlerContext } from "@/lib/cerapan/types/handler";

export function handlePenyetelanNol({
    key,
    value,
    updated,
    index
}: HandlerContext) {
    const row = updated[index];

    if (!row) return;

    /*
    ==========================
    PILIH JENIS PENYETEL NOL
    ==========================
    */

    if (key === "pemeriksaan") {
        const jenis = evaluasiJenisPenyetelNol(value);

        row.jenisPenyetelNol = jenis.jenisPenyetelNol;
        row.hasil = null;
        return;
    }

    /*
    ==========================
    OTOMATIS
    ==========================
    */

    if (
        key === "penunjukanOtomatis10e" ||
        key === "penunjukanOtomatis025e" ||
        key === "penunjukanOtomatis05e"
    ) {
        evaluasiPenyetelanNol(row);
        return;
    }

    /*
    ==========================
    SEMI OTOMATIS
    ==========================
    */

    if (
        key === "penunjukanSM10e" ||
        key === "penunjukanSM025e" ||
        key === "penunjukanSM05e"
    ) {
        evaluasiPenyetelanNol(row);
    }
}
