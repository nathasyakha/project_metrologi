import { hitungBKD } from "../common/hitungBKD";
import { findBKDRule } from "../../rules/findBKDRules";

interface Input {
    jenisAlat: string;
    kelas: string;
    kapasitasMaksimum: number;
    nilaiE: number;
    layanan: "TERA" | "TERA_ULANG";
}

export function generateKebenaranBobotIngsut(data: Input) {
    const rule = findBKDRule({
        jenisAlat: data.jenisAlat,
        kelas: data.kelas,
        pengujian: "KEBENARAN"
    });

    if (!rule) {
        throw new Error("Rule kebenaran tidak ditemukan");
    }

    const muatan = data.kapasitasMaksimum;

    const placeholderBKD = hitungBKD({
        rule,
        titikUji: muatan,
        nilaiE: data.nilaiE,
        layanan: data.layanan
    });

    const bkdFormatted = placeholderBKD !== null
        ? Number(placeholderBKD.toFixed(3))
        : null;

    return [
        {
            /*
            =========================
            PLACEHOLDER
            =========================
            */
            placeholderMuatanUji: muatan,
            placeholderBKD: bkdFormatted,

            /*
            =========================
            INPUT AKTUAL
            =========================
            */
            lantaiAT: muatan,
            maksGandar: muatan,
            muatanUji: muatan,

            /*
            =========================
            PARAMETER
            =========================
            */
            jenisAlat: data.jenisAlat,
            kelas: data.kelas,
            nilaiE: data.nilaiE,
            layanan: data.layanan,

            /*
            =========================
            HASIL & PENGAMATAN
            =========================
            */
            bkd: bkdFormatted,
            pengamatan: null,
            hasil: null,

            /*
            =========================
            UJI TAMBAHAN (IMBUH)
            =========================
            */
            perluImbuh: false,
            imbuh: null,
            pengamatanSetelahImbuh: null,
            imbuh2: null,
            pengamatanSetelahImbuh2: null,
        }
    ];
}