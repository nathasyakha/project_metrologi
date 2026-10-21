import { findBKDRule } from "../../rules/findBKDRules";
import { hitungBKD } from "../common/hitungBKD";

export interface Input {
    jenisAlat: string;
    kelas: string;
    kapasitasMaksimum: number;
    nilaiE: number;
    layanan: "TERA" | "TERA_ULANG";
}

export function generateRepeatabilityJembatan(
    data: Input
) {

    const rule = findBKDRule({
        jenisAlat: data.jenisAlat,
        kelas: data.kelas,
        pengujian: "REPEATABILITY"
    });

    if (!rule) {
        throw new Error("Rule BKD Repeatability Timbangan Jembatan tidak ditemukan");
    }

    const kapasitasMaksimumKg = Number(data.kapasitasMaksimum) / 1000;
    const muatanUji = Number(((kapasitasMaksimumKg * 0.5)).toFixed(3));

    const bkd = hitungBKD({
        rule,
        titikUji: muatanUji * 1000,
        nilaiE: data.nilaiE,
        layanan: data.layanan,
        jenisAlat: data.jenisAlat
    });

    return Array.from({ length: 3 }, (_, index) => ({
        nomor: index + 1,
        muatanUji: muatanUji,
        kapasitasMaksimum: kapasitasMaksimumKg,
        jenisAlat: data.jenisAlat,
        kelas: data.kelas,
        layanan: data.layanan,
        nilaiE: data.nilaiE,
        bkd: bkd != null ? Number(bkd.toFixed(3)) : null,

        // Input petugas
        penunjukan: null,
        imbuh: null,

        // P = IL + 0,5e - ΔL
        penunjukanSebenarnya: null,

        // Hasil perhitungan handler
        repeat: null,
        hasil: null
    }));
}
