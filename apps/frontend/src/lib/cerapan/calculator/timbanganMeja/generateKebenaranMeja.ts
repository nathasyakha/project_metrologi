import { hitungBKDMeja } from "./hitungBKDMeja";

interface Input {
    jenisAlat: string;
    kelas: string;
    kapasitasMaksimum: number;
    nilaiE: number;
    layanan:
    | "TERA"
    | "TERA_ULANG";
}

export function generateKebenaranMeja(
    data: Input
) {
    const muatanUji = data.kapasitasMaksimum;
    const bkd = hitungBKDMeja({
        kapasitasMaksimum: data.kapasitasMaksimum,
        muatanUji: muatanUji,
        layanan: data.layanan
    });
    return [
        {
            lantaiAT: muatanUji,
            bkd: bkd !== null ? Number(bkd.toFixed(3)) : null,
            pengamatan: null,
            hasil: null,
            kapasitasMaksimum: data.kapasitasMaksimum,
            layanan: data.layanan,
            imbuh: null,
            pengamatanSetelahImbuh: null
        }
    ];
}