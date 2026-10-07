import { evaluasiUjiTambahan } from "../lib/cerapan/calculator/evaluasiUjiTambahanKebenaran";
import { HandlerContext } from "@/lib/cerapan/types/handler";

export function handleUjiTambahan({
    section,
    key,
    updated,
    index
}: HandlerContext) {

    if (
        (
            section.generator === "KEBENARAN" ||
            section.generator === "EKSENTRISITAS"
        )
        &&
        key === "penunjukanSetelahImbuh"
    ) {
        evaluasiUjiTambahan(
            updated[index]
        );
        return true;
    }
    return false;
}