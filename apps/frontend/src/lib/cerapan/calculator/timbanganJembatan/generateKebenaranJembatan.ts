
import { findBKDRule } from "../../rules/findBKDRules";

export interface InputKebenaranJembatan {
    jenisAlat: string;
    kelas: string;
    kapasitasMaksimum: number;
    nilaiE: number;
    layanan: "TERA" | "TERA_ULANG";
}

export function generateKebenaranJembatan(
    data: InputKebenaranJembatan
) {
    const jenisAlat =
        data.jenisAlat || "TIMBANGAN_JEMBATAN";

    const rule = findBKDRule({
        jenisAlat,
        kelas: data.kelas,
        pengujian: "KEBENARAN"
    });

    if (!rule) {
        throw new Error(
            "Rule BKD Kebenaran Timbangan Jembatan tidak ditemukan"
        );
    }

    // Identitas alat tersimpan dalam gram.
    // Tampilan pengujian menggunakan kg.
    const kapasitasKg =
        Number(data.kapasitasMaksimum) / 1000;

    const nilaiEKg =
        Number(data.nilaiE) / 1000;

    // Lima baris kosong sebagai data awal.
    const baris = Array.from(
        { length: 5 },
        (_, index) => ({
            nomor: index + 1,
            standar: null,
            ballast: null,
            standarBallast: null,
            penunjukan: null,
            imbuh: null,
            penunjukanSebenarnya: null,
            kesalahan: null,
            bkd: null,
            hasil: null,

            jenisAlat,
            kelas: data.kelas,
            kapasitasMaksimum: kapasitasKg,
            nilaiE: nilaiEKg,
            layanan: data.layanan
        })
    );

    return baris;
}
