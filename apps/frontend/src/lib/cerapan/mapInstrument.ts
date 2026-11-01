
import {
    hitungKapasitasMinimum
} from "./calculator/common/hitungKapasitasMinimum";

export function mapInstrument(item: any) {
    if (!item) {
        throw new Error("Data instrumen tidak ditemukan");
    }

    // IDENTITAS
    const applicationId = item.id;
    const applicationInstrumentId =
        item.applicationInstrumentId;
    const instrumentId = item.instrumentId;

    if (!applicationId) {
        throw new Error("ID permohonan tidak ditemukan");
    }

    if (!applicationInstrumentId) {
        throw new Error("ID detail alat tidak ditemukan");
    }

    if (!instrumentId) {
        throw new Error("ID instrumen tidak ditemukan");
    }

    // SPESIFIKASI
    const kelas = item.class;

    const nilaiEAsli = Number(item.dayabaca);
    const kapasitasAsli = Number(item.capacityValue);

    if (!kelas) {
        throw new Error("Kelas alat belum tersedia");
    }

    if (!Number.isFinite(nilaiEAsli) || nilaiEAsli <= 0) {
        throw new Error("Daya baca alat tidak valid");
    }

    if (!Number.isFinite(kapasitasAsli) || kapasitasAsli <= 0) {
        throw new Error("Kapasitas alat tidak valid");
    }

    // KONVERSI DAYA BACA KE GRAM
    const nilaiEGram =
        item.dayabacaUnit === "kg"
            ? nilaiEAsli * 1000
            : nilaiEAsli;

    // KONVERSI KAPASITAS MAKSIMUM KE GRAM
    const kapasitasMaksimumGram =
        item.capacityUnit === "kg"
            ? kapasitasAsli * 1000
            : kapasitasAsli;

    // HITUNG KAPASITAS MINIMUM
    const kapasitasMinimumGram =
        hitungKapasitasMinimum(kelas, nilaiEGram);

    if (
        kapasitasMinimumGram === null ||
        !Number.isFinite(kapasitasMinimumGram) ||
        kapasitasMinimumGram <= 0
    ) {
        throw new Error(
            `Kapasitas minimum tidak dapat dihitung untuk kelas ${kelas}`
        );
    }

    // HASIL MAPPING
    return {
        // Identitas permohonan dan alat
        id: instrumentId,
        applicationId,
        applicationInstrumentId,
        instrumentId,

        // Identitas instrumen
        jenisAlat: item.instrumentJenisAlat,
        merek: item.instrumentBrand,
        model: item.instrumentType,
        nomorSeri: item.instrumentSerial,

        // Spesifikasi
        kelas,

        // Hasil perhitungan (gram)
        kapasitasMinimum: kapasitasMinimumGram,
        kapasitasMaksimum: kapasitasMaksimumGram,
        nilaiE: nilaiEGram,

        // Satuan tampilan
        kapasitasUnit: "g",
        dayabaca: nilaiEGram,
        dayabacaUnit: "g",

        layanan: item.layanan
    };
}
