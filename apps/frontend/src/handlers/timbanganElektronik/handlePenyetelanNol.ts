import { evaluasiJenisPenyetelNol } from "@/lib/cerapan/calculator/evaluasiJenisPenyetelNol";
import { evaluasiPenyetelanNol } from "@/lib/cerapan/calculator/evaluasiPenyetelNol";
import { HandlerContext } from "@/lib/cerapan/types/handler";

export function handlePenyetelanNol({
    key,
    value,
    updated,
    index
}: HandlerContext) {
    if (
        key === "penunjukanSM025e" ||
        key === "penunjukanSM10e"
    ) {
        updated[index].hasil =
            null;
    }

    /*
    ==========================
    PILIH JENIS PENYETEL NOL
    ==========================
    */

    if (
        key === "pemeriksaan"
    ) {
        const jenis =
            evaluasiJenisPenyetelNol(
                value
            );
        updated[index].jenisPenyetelNol =
            jenis.jenisPenyetelNol;
        updated[index].hasil =
            null;
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
        evaluasiPenyetelanNol(
            updated[index]
        );
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
        evaluasiPenyetelanNol(
            updated[index]
        );
    }
}