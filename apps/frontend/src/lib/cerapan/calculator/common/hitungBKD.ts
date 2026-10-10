import type {
    BKDRule
} from "../../rules/bkdRules";


export function hitungBKD({
    rule,
    titikUji,
    nilaiE,
    layanan

}: {
    rule: BKDRule;
    titikUji: number;
    nilaiE: number;
    layanan:
    | "TERA"
    | "TERA_ULANG";
}) {

    const interval =
        titikUji / nilaiE;

    const limit =
        rule.limits.find(item =>
            interval >= item.minE
            &&
            interval <= item.maxE
        );

    if (!limit) {
        return null;
    }
    let bkd =
        limit.faktorBKD * nilaiE;

    // ======================
    // TERA ULANG
    // BKD dikali 2
    // ======================
    if (layanan === "TERA_ULANG") {
        bkd =
            bkd * 2;
    }

    return Number(
        bkd.toFixed(4)
    );
}