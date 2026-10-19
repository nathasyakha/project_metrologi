import { hitungBKD } from "../common/hitungBKD";
import { findBKDRule } from "../../rules/findBKDRules";

interface Input {
    jenisAlat: string;
    kelas: string;
    kapasitasMaksimum: number;
    nilaiE: number;
    layanan:
    | "TERA"
    | "TERA_ULANG";
}

export function generateRepeatabilitySentisimal(
    data: Input
) {
    const rule =
        findBKDRule({
            jenisAlat: data.jenisAlat,
            kelas: data.kelas,
            pengujian: "REPEATABILITY"
        });

    if (!rule) {
        throw new Error("Rule kebenaran tidak ditemukan");
    }
    const muatan = data.kapasitasMaksimum;
    const bkd = hitungBKD({
        rule,
        titikUji: muatan,
        nilaiE: data.nilaiE,
        layanan: data.layanan
    });

    return Array.from({ length: 3 }, (_, index) => {
        return {
            nomor: index + 1,
            lantaiAT: muatan,
            piringAT: muatan / 100,
            kapasitasMaksimum: data.kapasitasMaksimum,
            jenisAlat: data.jenisAlat,
            kelas: data.kelas,
            layanan: data.layanan,
            nilaiE: data.nilaiE,
            bkd: bkd,
            pengamatan: null,
            imbuh: null,
            pengamatanSetelahImbuh: null,
            hasil: null,
            perluImbuh: false
        };
    });
}