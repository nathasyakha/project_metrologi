import { hitungBKDDacin } from "./hitungBKDDacin";

interface Input {
    jenisAlat: string;
    kelas: string;
    kapasitasMaksimum: number;
    nilaiE: number;
    layanan: "TERA" | "TERA_ULANG";
}

export function generateKepekaanDacin(data: Input) {
    const muatanUji = data.kapasitasMaksimum;

    const bkd = hitungBKDDacin({
        kapasitasMaksimum: data.kapasitasMaksimum,
        muatanUji: muatanUji,
        layanan: data.layanan
    });

    return [
        {
            muatanUji: muatanUji,
            bkd: bkd !== null ? Number(bkd.toFixed(3)) : null,
            imbuh: "Tambah imbuh sebesar BKD",
            pengamatan: null,
            hasil: null,
        }
    ];
}