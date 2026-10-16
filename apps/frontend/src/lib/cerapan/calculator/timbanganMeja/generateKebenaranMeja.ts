import {
    hitungBKDMeja
} from "./hitungBKDMeja";


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


    /*
    =============================
    MUATAN UJI
    TIMBANGAN MEJA

    Menggunakan kapasitas maksimum

    =============================
    */


    const muatanUji =
        data.kapasitasMaksimum;



    const bkd =
        hitungBKDMeja({
            kapasitasMaksimum: data.kapasitasMaksimum,
            muatanUji: muatanUji,
            layanan: data.layanan
        });



    return [

        {
            lantaiAT: muatanUji,

            tembor:
                muatanUji,


            bkd:
                bkd !== null
                    ?
                    Number(
                        bkd.toFixed(3)
                    )
                    :
                    null,


            pengamatan:
                null,


            hasil:
                null,

            /*
            ======================
            UJI TAMBAHAN
            ======================
            */
            imbuh:
                null,
            pengamatanSetelahImbuh:
                null
        }
    ];

}