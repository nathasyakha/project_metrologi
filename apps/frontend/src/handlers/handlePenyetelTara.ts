import { evaluasiPenyetelTara } from "@/lib/cerapan/calculator/evaluasiPenyetelTara";
import { HandlerContext } from "@/lib/cerapan/types/handler";

export function handlePenyetelTara({
    key,
    updated,
    index
}: HandlerContext) {
    if (
        key !== "penunjukan10e" &&
        key !== "penunjukan025e" &&
        key !== "penunjukan05e"
    ) {
        return;
    }
    evaluasiPenyetelTara(
        updated[index]
    );
}