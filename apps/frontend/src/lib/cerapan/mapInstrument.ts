import {
    hitungKapasitasMinimum
} from "./calculator/hitungKapasitasMinimum";


export function mapInstrument(item: any) {


    const kelas =
        item.class;


    /*
    ===============================
    KONVERSI NILAI E KE GRAM
    ===============================
    */

    const nilaiEAsli =
        Number(item.dayabaca);


    const nilaiEGram =
        item.dayabacaUnit === "kg"
            ?
            nilaiEAsli * 1000
            :
            nilaiEAsli;



    /*
    ===============================
    KAPASITAS MAKSIMUM KE GRAM
    ===============================
    */


    const kapasitasMaksimumGram =
        item.capacityUnit === "kg"
            ?
            Number(item.capacityValue) * 1000
            :
            Number(item.capacityValue);



    /*
    ===============================
    HITUNG MINIMUM
    HASIL DALAM GRAM
    ===============================
    */


    const kapasitasMinimumGram =
        hitungKapasitasMinimum(
            kelas,
            nilaiEGram
        )
        ??
        0;



    return {


        id:
            item.id,


        jenisAlat:
            item.instrumentJenisAlat,


        merek:
            item.instrumentBrand,


        model:
            item.instrumentType,


        nomorSeri:
            item.instrumentSerial,


        kelas,


        /*
        =========================
        INTERNAL CALCULATION
        SEMUA GRAM
        =========================
        */


        kapasitasMinimum:
            kapasitasMinimumGram,


        kapasitasMaksimum:
            kapasitasMaksimumGram,


        nilaiE:
            nilaiEGram,



        /*
        =========================
        DISPLAY
        =========================
        */


        kapasitasUnit:
            "g",


        dayabaca:
            nilaiEGram,


        dayabacaUnit:
            "g",



        layanan:
            item.layanan

    };

}