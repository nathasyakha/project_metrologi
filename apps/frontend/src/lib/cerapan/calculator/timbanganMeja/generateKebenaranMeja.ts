import {
    findBKDRule
} from "../../rules/findBKDRules";


import {
    hitungBKD
} from "../common/hitungBKD";


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


    const rule =
        findBKDRule({

            jenisAlat:
                data.jenisAlat,

            kelas:
                data.kelas,

            pengujian:
                "KEBENARAN"

        });



    if (!rule) {

        throw new Error(
            "Rule kebenaran timbangan meja tidak ditemukan"
        );

    }



    /*
    =============================
    TITIK PENGUJIAN
    =============================
    */

    const titikUji = [

        {
            nama:
                "Minimum",

            muatan:
                data.nilaiE
        },


        {
            nama:
                "Tengah",

            muatan:
                data.kapasitasMaksimum / 2
        },


        {
            nama:
                "Maksimum",

            muatan:
                data.kapasitasMaksimum
        }

    ];



    return titikUji.map(

        (item, index) => {


            const bkd =
                hitungBKD({

                    rule,

                    titikUji:
                        item.muatan,

                    nilaiE:
                        data.nilaiE,

                    layanan:
                        data.layanan

                });



            return {

                nomor:
                    index + 1,


                titikUji:
                    item.nama,


                muatanUji:
                    item.muatan,


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
                    null

            };

        }

    );

}