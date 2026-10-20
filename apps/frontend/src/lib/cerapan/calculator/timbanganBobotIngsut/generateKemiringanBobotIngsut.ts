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



export function generateKemiringanBobotIngsut(
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

    const rule = findBKDRule({
        jenisAlat: data.jenisAlat,
        kelas: data.kelas,
        pengujian: "KEMIRINGAN"
    });

    if (!rule) {
        throw new Error("Rule kebenaran tidak ditemukan");
    }
    const muatan = Number(data.kapasitasMaksimum) * 0.5;

    const bkd = hitungBKD({
        rule,
        titikUji: muatan,
        nilaiE: data.nilaiE,
        layanan: data.layanan
    });

    return [
        {
            lantaiAT: muatan,
            maksGandar: muatan,
            perluImbuh: false,
            kapasitasMaksimum: data.kapasitasMaksimum,
            jenisAlat: data.jenisAlat,
            kelas: data.kelas,
            layanan: data.layanan,
            nilaiE: data.nilaiE,
            bkd: bkd,
            pengamatan: null,
            hasil: null,
            imbuh: null,
            pengamatanSetelahImbuh: null,
        }

    ];

}