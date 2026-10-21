import { hitungBKD } from "../common/hitungBKD";
import { findBKDRule } from "../../rules/findBKDRules";

interface Input {
    kapasitasMaksimum: number;
    jenisAlat: string;
    kelas: string;
    nilaiE: number;
    layanan:
    | "TERA"
    | "TERA_ULANG";
}

export function generateKebenaranGandar(
    data: Input
) {
    /*
    ============================
    HANYA TERA
    ============================
    */

    if (data.layanan !== "TERA") {
        return [];
    }
    const rule =
        findBKDRule({
            jenisAlat: data.jenisAlat,
            kelas: data.kelas,
            pengujian: "KEBENARAN_GANDAR"
        });

    if (!rule) {
        throw new Error("Rule kebenaran tidak ditemukan");
    }
    const muatan = Number(data.kapasitasMaksimum);
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

    return [
        {
            maksGandar: maksGandar,
            lantaiAT: maksGandar,
            kapasitasMaksimum: data.kapasitasMaksimum,
            jenisAlat: data.jenisAlat,
            kelas: data.kelas,
            layanan: data.layanan,
            nilaiE: data.nilaiE,
            bkd: bkd,
            pengamatan: null,
            perluImbuh: false,
            hasil: null,
            imbuh: null,
            pengamatanSetelahImbuh: null,
        }
    ];

}