import {
    findBKDRule
} from "../rules/findBKDRules";

import {
    hitungBKD
} from "./hitungBKD";


interface Input {

    jenisAlat: string;

    kelas: string;

    kapasitasMaksimum: number;

    nilaiE: number;

    layanan:
    | "TERA"
    | "TERA_ULANG";

}



export function generateEksentrisitas(
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
    ==================================
    MUATAN UJI EKSENTRISITAS
    ==================================

    1/3 kapasitas maksimum

    dibulatkan ribuan ke atas

    */

    const muatan =
        Math.ceil(
            (
                data.kapasitasMaksimum / 3
            ) / 1000
        ) * 1000;




    const jumlahPosisi = 4;



    return Array.from(
        {
            length:
                jumlahPosisi
        },

        (_, index) => {


            const placeholderBKD =
                hitungBKD({

                    rule,

                    titikUji:
                        muatan,

                    nilaiE:
                        data.nilaiE,

                    layanan:
                        data.layanan

                });



            return {


                /*
                =========================
                POSISI UJI
                =========================
                */

                posisiUji:
                    index + 1,



                /*
                =========================
                PLACEHOLDER
                =========================
                */

                placeholderMuatanUji:
                    muatan,


                placeholderBKD:
                    placeholderBKD !== null

                        ?

                        Number(
                            placeholderBKD.toFixed(3)
                        )

                        :

                        null,



                /*
                =========================
                INPUT AKTUAL
                =========================
                */


                muatanUji:
                    muatan,


                penunjukan:
                    null,



                /*
                =========================
                PARAMETER
                =========================
                */

                jenisAlat:
                    data.jenisAlat,


                kelas:
                    data.kelas,


                nilaiE:
                    data.nilaiE,


                layanan:
                    data.layanan,



                /*
                =========================
                HASIL
                =========================
                */


                bkd:
                    placeholderBKD !== null

                        ?

                        Number(
                            placeholderBKD.toFixed(3)
                        )

                        :

                        null,


                pengamatan:
                    null,


                hasil:
                    null,



                /*
                =========================
                UJI TAMBAHAN
                =========================
                */

                perluUjiTambahan:
                    false,


                arahUjiTambahan:
                    null,


                penunjukanSetelahImbuh:
                    null

            };

        }
    );

}