import { hitungBKD } from "../common/hitungBKD";
import { findBKDRule } from "../../rules/findBKDRules";
import {
    hitungBatasBawah,
    hitungBatasAtas
} from "../common/hitungInterval";
import { hitungTitikTengah } from "../common/getTitikInterval";

interface Input {
    jenisAlat: string;
    kelas: string;
    kapasitasMinimum: number;
    kapasitasMaksimum: number;
    nilaiE: number;
    layanan: "TERA" | "TERA_ULANG";
}

export function generateKebenaranPegas(data: Input) {
    const batasBawah = hitungBatasBawah(
        data.jenisAlat,
        data.kelas,
        data.nilaiE
    );

    const batasAtas = hitungBatasAtas(
        data.kelas,
        data.nilaiE
    );

    const titikTengah = hitungTitikTengah({
        jenisAlat: data.jenisAlat,
        batasBawah,
        batasAtas,
        kapasitasMax: data.kapasitasMaksimum
    });

    const rule = findBKDRule({
        jenisAlat: data.jenisAlat,
        kelas: data.kelas,
        pengujian: "KEBENARAN"
    });

    if (!rule) {
        throw new Error("Rule kebenaran tidak ditemukan");
    }

    const titikUji = [
        data.kapasitasMinimum,
        titikTengah,
        data.kapasitasMaksimum
    ].filter(
        nilai => nilai !== null && nilai !== undefined
    );

    return titikUji.map((muatanUji, index) => {
        const bkd = hitungBKD({
            rule,
            titikUji: muatanUji,
            nilaiE: data.nilaiE,
            layanan: data.layanan,
            jenisAlat: data.jenisAlat
        });

        return {
            nomor: index + 1,
            muatanUji,
            bkd: bkd !== null
                ? Number(bkd.toFixed(3))
                : null,
            kapasitasMaksimum: data.kapasitasMaksimum,
            jenisAlat: data.jenisAlat,
            kelas: data.kelas,
            nilaiE: data.nilaiE,
            layanan: data.layanan,
            pengamatan: null,
            hasil: null
        };
    });
}
