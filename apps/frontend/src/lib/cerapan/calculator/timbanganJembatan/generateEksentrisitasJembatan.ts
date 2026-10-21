
import { findBKDRule } from "../../rules/findBKDRules";
import { hitungBKD } from "../common/hitungBKD";

export interface InputEksentrisitasJembatan {
    jenisAlat: string;
    kelas: string;
    kapasitasMaksimum: number;
    nilaiE: number;
    layanan: "TERA" | "TERA_ULANG";
}

export function generateEksentrisitasJembatan(
    data: InputEksentrisitasJembatan
) {
    const jenisAlat =
        data.jenisAlat || "TIMBANGAN_JEMBATAN";

    const rule = findBKDRule({
        jenisAlat,
        kelas: data.kelas,
        pengujian: "EKSENTRISITAS"
    });

    if (!rule) {
        throw new Error(
            "Rule BKD eksentrisitas Timbangan Jembatan tidak ditemukan"
        );
    }

    /*
     * Kapasitas internal dan nilaiE disimpan dalam gram.
     * Muatan uji pada tabel ditampilkan dalam kg.
     */
    const kapasitasMaksimumKg =
        Number(data.kapasitasMaksimum) / 1000;

    const muatanUji = Math.ceil(
        (kapasitasMaksimumKg / 3) / 1000
    ) * 1000;

    /*
     * hitungBKD menerima titikUji dan nilaiE
     * dalam satuan yang sama, yaitu gram.
     *
     * Hasil BKD dikembalikan dalam kg khusus
     * untuk TIMBANGAN_JEMBATAN.
     */
    const bkd = hitungBKD({
        rule,
        titikUji: muatanUji * 1000,
        nilaiE: Number(data.nilaiE),
        layanan: data.layanan,
        jenisAlat
    });

    return Array.from({ length: 3 }, (_, index) => ({
        posisiUji: index + 1,

        // Nilai yang tampil pada tabel menggunakan kg.
        muatanUji,
        kapasitasMaksimum: kapasitasMaksimumKg,

        jenisAlat,
        kelas: data.kelas,
        nilaiE: data.nilaiE,
        layanan: data.layanan,

        // BKD sudah dalam kg untuk Timbangan Jembatan.
        bkd: bkd !== null
            ? Number(bkd.toFixed(4))
            : null,

        // Input petugas.
        penunjukan: null,
        imbuh: null,

        // Dihitung oleh handler.
        kesalahanPenunjukan: null,
        hasil: null
    }));
}
