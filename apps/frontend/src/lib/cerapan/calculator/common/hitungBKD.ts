import type {
    BKDRule
} from "../../rules/bkdRules";


export function hitungBKD({
    rule,
    titikUji,
    nilaiE,
    layanan,
    jenisAlat,

}: {
    rule: BKDRule;
    titikUji: number;
    nilaiE: number;
    layanan:
    | "TERA"
    | "TERA_ULANG";
    jenisAlat: string;
}) {

    const interval =
        titikUji / nilaiE;

    let limit =
        rule.limits.find(item =>
            interval >= item.minE
            &&
            interval <= item.maxE
        );

    if (!limit && rule.limits.length >= 3) {
        limit = rule.limits[2];
    }

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
    if (jenisAlat === "TIMBANGAN_JEMBATAN") {
        bkd /= 1000;
    }

    return Number(bkd.toFixed(4));
}