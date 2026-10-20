import { hitungBKDDacin } from "./hitungBKDDacin";

interface Input {
    jenisAlat: string;
    kelas: string;
    kapasitasMaksimum: number;
    nilaiE: number;
    layanan: "TERA" | "TERA_ULANG";
}

export function generateKebenaranDacin(data: Input) {
    const muatanUji = data.kapasitasMaksimum;

    const bkd = hitungBKDDacin({
        kapasitasMaksimum: data.kapasitasMaksimum,
        muatanUji: muatanUji,
        layanan: data.layanan
    });

    return [
        {
            muatanUji: muatanUji,
            kapasitasMaksimum: data.kapasitasMaksimum,
            jenisAlat: data.jenisAlat,
            kelas: data.kelas,
            layanan: data.layanan,
            nilaiE: data.nilaiE,
            bkd: bkd !== null ? Number(bkd.toFixed(3)) : null,
            pengamatan: null,
            hasil: null,

            /*
            ======================
            UJI TAMBAHAN
            ======================
            */
            imbuh: null,
            pengamatanSetelahImbuh: null,
            imbuh2: null,
            pengamatanSetelahImbuh2: null,
        }
    ];
}