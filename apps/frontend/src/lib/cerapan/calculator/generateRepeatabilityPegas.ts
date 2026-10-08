import { findBKDRule } from "../rules/findBKDRules";
import { hitungBKD } from "./hitungBKD";


interface Input {

    jenisAlat: string;

    kelas: string;

    kapasitasMaksimum: number;

    nilaiE: number;

    layanan:
    | "TERA"
    | "TERA_ULANG";

}



export function generateRepeatabilityPegas(
    data: Input
) {

    const rule =
        findBKDRule({

            jenisAlat: data.jenisAlat,

            kelas: data.kelas,

            pengujian: "REPEATABILITY"

        });


    if (!rule) {

        throw new Error(
            "Rule repeatability tidak ditemukan"
        );

    }



    const muatan =
        data.kapasitasMaksimum * 0.8;



    const bkd =
        hitungBKD({

            rule,

            titikUji: muatan,

            nilaiE: data.nilaiE,

            layanan: data.layanan

        });



    return [

        {
            nomor: 1,

            muatanUji:
                muatan,

            penunjukan:
                null,

            bkd,

            hasil:
                null

        },


        {
            nomor: 2,

            muatanUji:
                muatan,

            penunjukan:
                null,

            bkd,

            hasil:
                null

        },


        {
            nomor: 3,

            muatanUji:
                muatan,

            penunjukan:
                null,

            bkd,

            hasil:
                null

        }

    ];

}