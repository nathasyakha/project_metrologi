
export interface InputPenyetelTaraJembatan {
    jenisAlat: string;
    kelas: string;
    kapasitasMaksimum: number;
    nilaiE: number;
    layanan: "TERA" | "TERA_ULANG";
}

export function generatePenyetelTaraJembatan(
    data: InputPenyetelTaraJembatan
) {
    if (data.layanan !== "TERA") {
        return [];
    }
    // Kapasitas maksimum dan nilaiE mengikuti satuan
    // internal yang digunakan aplikasi, yaitu gram.
    const kapasitasMaksimumKg =
        Number(data.kapasitasMaksimum) / 1000;

    const nilaiEKg =
        Number(data.nilaiE) / 1000;

    // ATS sekitar 20% kapasitas maksimum, dalam kg.
    const langkah = Number(
        (kapasitasMaksimumKg * 0.2).toFixed(3)
    );

    return [
        {
            langkah,
            tekanTara: 0,

            // Semua nilai imbuh ditampilkan dalam kg.
            imbuh10e: Number((10 * nilaiEKg).toFixed(3)),
            imbuh025e: Number((0.25 * nilaiEKg).toFixed(3)),
            imbuh05e: Number((0.5 * nilaiEKg).toFixed(3)),
            penunjukan10e: null,
            penunjukan025e: null,
            penunjukan05e: null,
            hasil: null,
            jenisAlat: data.jenisAlat || "TIMBANGAN_JEMBATAN",
            kelas: data.kelas,
            kapasitasMaksimum: kapasitasMaksimumKg,
            nilaiE: nilaiEKg,
            layanan: data.layanan
        }
    ];
}
