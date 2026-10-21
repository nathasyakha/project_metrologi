import { findBKDRule } from "../../rules/findBKDRules";
import { hitungBKD } from "../common/hitungBKD";

interface Input {
    jenisAlat: string;
    kelas: string;
    kapasitasMaksimum: number;
    nilaiE: number;
    layanan:
    | "TERA"
    | "TERA_ULANG";
}

export function generateKepekaan(
    data: Input
) {
    const rule =
        findBKDRule({
            jenisAlat: data.jenisAlat,
            kelas: data.kelas,
            pengujian: "KEPEKAAN"
        });

    if (!rule) {
        throw new Error("Rule kepekaan tidak ditemukan");
    }

    const muatan = data.kapasitasMaksimum;

    const bkd = hitungBKD({
        rule,
        titikUji: muatan,
        nilaiE: data.nilaiE,
        layanan: data.layanan,
        jenisAlat: data.jenisAlat
    });
    return [
        {
            muatanUji: muatan,
            bkd: bkd,
            kapasitasMaksimum: data.kapasitasMaksimum,
            jenisAlat: data.jenisAlat,
            kelas: data.kelas,
            layanan: data.layanan,
            nilaiE: data.nilaiE,
            imbuh: "Tambah imbuh sebesar BKD",
            pengamatan: null,
            hasil: null
        }
    ];
}