
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
    /*
    Data identitas aplikasi disimpan dalam gram.
    Tampilan Timbangan Jembatan menggunakan kg.
    */
    const kapasitasMaksimumKg =
        Number(data.kapasitasMaksimum) / 1000;

    const nilaiEKg =
        Number(data.nilaiE) / 1000;

    const imbuh10e = Number((10 * nilaiEKg).toFixed(4));
    const imbuh025e = Number((0.25 * nilaiEKg).toFixed(4));
    const imbuh05e = Number((0.5 * nilaiEKg).toFixed(4));

    return [
        {
            nomor: 1,

            // Pemeriksaan penyetelan nol utama
            langkah: "Setel nol timbangan",
            pemeriksaan: null,
            jenisPenyetelNol: null,

            // Data untuk penyetel otomatis
            langkahOtomatis: Number(
                (kapasitasMaksimumKg * 0.02).toFixed(3)
            ),
            penyetelBekerja: null,
            imbuhOtomatis10e: imbuh10e,
            penunjukanOtomatis10e: null,
            imbuhOtomatis025e: imbuh025e,
            penunjukanOtomatis025e: null,
            pengamatanOtomatis025e: null,
            imbuhOtomatis05e: imbuh05e,
            penunjukanOtomatis05e: null,
            pengamatanOtomatis05e: null,

            // Data untuk penyetel semi otomatis
            tambah10e: imbuh10e,
            penunjukanSM10e: null,
            tambah025e: imbuh025e,
            penunjukanSM025e: null,
            pengamatanSM025e: null,
            tambah05e: imbuh05e,
            penunjukanSM05e: null,
            pengamatanSM05e: null,

            // Hasil evaluasi
            hasil: null,

            // Identitas alat
            jenisAlat: data.jenisAlat || "TIMBANGAN_JEMBATAN",
            kelas: data.kelas,
            kapasitasMaksimum: kapasitasMaksimumKg,
            nilaiE: nilaiEKg,
            layanan: data.layanan
        }
    ];
}
