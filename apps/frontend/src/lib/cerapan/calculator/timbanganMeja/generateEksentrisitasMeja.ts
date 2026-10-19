import { hitungBKDMeja } from "./hitungBKDMeja";

interface Input {
    jenisAlat: string;
    kelas: string;
    kapasitasMaksimum: number;
    nilaiE: number;
    layanan: "TERA" | "TERA_ULANG";
}

export function generateEksentrisitasMeja(
    data: Input
) {
    const muatan = Math.ceil((data.kapasitasMaksimum / 3) / 1000) * 1000;
    const jumlahPosisi = 4;
    const bkd =
        hitungBKDMeja({
            kapasitasMaksimum: data.kapasitasMaksimum,
            muatanUji: muatan,
            layanan: data.layanan
        });
    return [...Array(jumlahPosisi)].map(
        (_value, index) => {
            return {
                posisiUji: index + 1,
                lantaiAT: muatan,
                bkd: bkd !== null ? Number(bkd.toFixed(3)) : null,
                kapasitasMaksimum: data.kapasitasMaksimum,
                layanan: data.layanan,
                pengamatan: null,
                hasil: null,
                /*
                ======================
                UJI TAMBAHAN
                ======================
                */
                perluImbuh: false,
                imbuh: null,
                pengamatanSetelahImbuh: null,
                hasilSetelahImbuh: null
            };
        }
    );
}