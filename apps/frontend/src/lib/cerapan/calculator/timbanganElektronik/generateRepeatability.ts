
import { hitungTitikTengah } from "../common/getTitikInterval";
import {
    hitungBatasBawah,
    hitungBatasAtas
} from "../common/hitungInterval";
import { findBKDRule } from "../../rules/findBKDRules";
import { hitungBKD } from "../common/hitungBKD";

export interface InputRepeatability {
    kapasitasMaksimum: number;
    jenisAlat: string;
    kelas: string;
    nilaiE: number;

    layanan:
    | "TERA"
    | "TERA_ULANG";
}

export function generateRepeatability(
    data: InputRepeatability
) {

    const rule = findBKDRule({
        jenisAlat: data.jenisAlat,
        kelas: data.kelas,
        pengujian: "REPEATABILITY"
    });

    if (!rule) {
        throw new Error(
            "Rule Repeatability tidak ditemukan"
        );
    }

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

    if (titikTengah === null) {
        throw new Error(
            "Titik tengah repeatability tidak ditemukan"
        );
    }

    // =========================
    // HITUNG BKD
    // =========================

    const placeholderBKD = hitungBKD({
        rule,

        titikUji: titikTengah,

        nilaiE: data.nilaiE,

        layanan: data.layanan,

        jenisAlat: data.jenisAlat
    });

    const nilaiBKD =
        placeholderBKD !== null
            ? Number(placeholderBKD.toFixed(3))
            : null;

    // =========================
    // DATA REPEATABILITY
    // =========================


    return [
        {
            muatanUji: titikTengah,

            placeholderMuatanUji: titikTengah,
            placeholderBKD: nilaiBKD,

            bkd: nilaiBKD,

            // Identitas alat untuk handler
            jenisAlat: data.jenisAlat,
            kelas: data.kelas,
            kapasitasMaksimum: data.kapasitasMaksimum,

            penunjukan: null,
            penunjukan2: null,

            nilaiE: data.nilaiE,
            layanan: data.layanan,

            perluUjiTambahan: false,
            tampilTambahan: false,

            penunjukanTambahan1: null,
            penunjukanTambahan2: null,
            penunjukanTambahan3: null,

            imbuh1: null,
            imbuh2: null,
            imbuh3: null,

            penunjukanSebenarnya1: null,
            penunjukanSebenarnya2: null,
            penunjukanSebenarnya3: null,

            repeatTambahan: null,
            hasilTambahan: null,

            repeat: null,
            hasil: null
        },

        {
            muatanUji: titikTengah,

            placeholderMuatanUji: titikTengah,
            placeholderBKD: nilaiBKD,

            bkd: nilaiBKD,

            jenisAlat: data.jenisAlat,
            kelas: data.kelas,
            kapasitasMaksimum: data.kapasitasMaksimum,

            penunjukan: null,
            penunjukan2: null,

            nilaiE: data.nilaiE,
            layanan: data.layanan,

            repeat: null,
            hasil: null
        },

        {
            muatanUji: titikTengah,

            placeholderMuatanUji: titikTengah,
            placeholderBKD: nilaiBKD,

            bkd: nilaiBKD,

            jenisAlat: data.jenisAlat,
            kelas: data.kelas,
            kapasitasMaksimum: data.kapasitasMaksimum,

            penunjukan: null,
            penunjukan2: null,

            nilaiE: data.nilaiE,
            layanan: data.layanan,

            muatanUjiTambahan: titikTengah,

            repeat: null,
            hasil: null
        }
    ];
}
