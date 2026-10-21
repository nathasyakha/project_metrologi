
export interface InputPenyetelanNolJembatan {
    jenisAlat: string;
    kelas: string;
    kapasitasMaksimum: number;
    nilaiE: number;
    layanan: "TERA" | "TERA_ULANG";
}

export function generatePenyetelanNolJembatan(
    data: InputPenyetelanNolJembatan
) {
    return [
        {
            nomor: 1,
            langkah: "Periksa penyetelan nol",
            pemeriksaan: null,
            jenisPenyetelNol: null,

            jenisAlat: data.jenisAlat || "TIMBANGAN_JEMBATAN",
            kelas: data.kelas,
            kapasitasMaksimum: data.kapasitasMaksimum,
            nilaiE: data.nilaiE,
            layanan: data.layanan
        }
    ];
}
