import { hitungBKDMeja } from "./hitungBKDMeja";


interface Input {
    jenisAlat: string;
    kelas: string;
    kapasitasMaksimum: number;
    nilaiE: number;
    layanan: "TERA" | "TERA_ULANG";
}

export function generateRepeatabilityMeja(
    data: Input
) {
    const muatanUji = data.kapasitasMaksimum;
    const jumlahPosisi = 3;
    const bkd =
        hitungBKDMeja({
            kapasitasMaksimum: data.kapasitasMaksimum,
            muatanUji: muatanUji,
            layanan: data.layanan
        });
    return [...Array(jumlahPosisi)].map(
        (_value, index) => {
            return {
                nomor: index + 1,
                lantaiAT: muatanUji,
                kapasitasMaksimum: data.kapasitasMaksimum,
                layanan: data.layanan,
                bkd: bkd !== null ? Number(bkd.toFixed(3)) : null,
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