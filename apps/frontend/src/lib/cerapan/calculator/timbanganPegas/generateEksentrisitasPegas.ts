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



export function generateEksentrisitasPegas(
    data: Input
) {


    const rule =
        findBKDRule({

            jenisAlat:
                data.jenisAlat,

            kelas:
                data.kelas,

            pengujian:
                "EKSENTRISITAS"

        });



    if (!rule) {

        throw new Error(
            "Rule eksentrisitas tidak ditemukan"
        );

    }



    /*
    ================================
    MUATAN UJI
    1/3 KAPASITAS MAKSIMUM
    ================================
    */

    const muatanUji =
        Math.ceil(
            (
                data.kapasitasMaksimum / 3
            ) / 1000
        ) * 1000;



    const bkd =
        hitungBKD({

            rule,

            titikUji:
                muatanUji,

            nilaiE:
                data.nilaiE,

            layanan:
                data.layanan

        });



    const jumlahPosisi = 4;



    return Array.from(
        {
            length:
                jumlahPosisi
        },

        (_, index) => {


            return {

                posisiUji:
                    index + 1,


                muatanUji:
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
                    null

            };


        }

    );

}