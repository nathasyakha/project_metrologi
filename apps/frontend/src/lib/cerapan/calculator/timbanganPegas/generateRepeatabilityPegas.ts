
import { findBKDRule } from "../../rules/findBKDRules";
import { hitungBKD } from "../common/hitungBKD";

interface Input {
    jenisAlat: string;
    kelas: string;
    kapasitasMaksimum: number;
    nilaiE: number;
    layanan: "TERA" | "TERA_ULANG";
}

export function generateRepeatabilityPegas(data: Input) {
    const rule = findBKDRule({
        jenisAlat: data.jenisAlat,
        kelas: data.kelas,
        pengujian: "REPEATABILITY"
    });

    if (!rule) {
        throw new Error("Rule repeatability tidak ditemukan");
    }

    const muatanUji = data.kapasitasMaksimum * 0.8;

    const bkd = hitungBKD({
        rule,
        titikUji: muatanUji,
        nilaiE: data.nilaiE,
        layanan: data.layanan
    });

    return Array.from({ length: 3 }, (_, index) => ({
        nomor: index + 1,
        muatanUji,
        kapasitasMaksimum: data.kapasitasMaksimum,
        jenisAlat: data.jenisAlat,
        kelas: data.kelas,
        layanan: data.layanan,
        nilaiE: data.nilaiE,
        penunjukan: null,
        bkd: bkd != null ? Number(bkd.toFixed(3)) : null,
        repeat: null,
        hasil: null
    }));
}
