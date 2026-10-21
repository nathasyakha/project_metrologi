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

export function generateEksentrisitasSentisimal(
    data: Input
) {
    const rule = findBKDRule({
        jenisAlat: data.jenisAlat,
        kelas: data.kelas,
        pengujian: "EKSENTRISITAS"
    });

    if (!rule) {
        throw new Error("Rule kebenaran tidak ditemukan");
    }

    const muatan = data.kapasitasMaksimum;
    const jumlahPosisi = 4;
    let maksGandar = 0;

    if (muatan === 150000) {
        maksGandar = 15000;
    }
    if (muatan === 300000) {
        maksGandar = 25000;
    }
    if (muatan === 500000) {
        maksGandar = 50000;
    }

    const bkd = hitungBKD({
        rule,
        titikUji: maksGandar,
        nilaiE: data.nilaiE,
        layanan: data.layanan,
        jenisAlat: data.jenisAlat
    });

    return Array.from(
        { length: jumlahPosisi },
        (_, index) => {
            return {
                posisiUji: index + 1,
                maksGandar: maksGandar,
                lantaiAT: maksGandar,
                kapasitasMaksimum: data.kapasitasMaksimum,
                jenisAlat: data.jenisAlat,
                kelas: data.kelas,
                layanan: data.layanan,
                nilaiE: data.nilaiE,
                bkd: bkd,
                pengamatan: null,
                imbuh: null,
                perluImbuh: false,
                pengamatanSetelahImbuh: null,
                hasil: null
            };
        }
    );
}