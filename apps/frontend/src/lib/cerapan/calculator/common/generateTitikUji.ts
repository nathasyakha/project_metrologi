import { findBKDRule } from "../../rules/findBKDRules";
import { hitungBKD } from "./hitungBKD";
import { hitungRentangBKD } from "../../rules/hitungBKDTengah";
import { hitungTitikTengah } from "./getTitikInterval";


interface GenerateTitikInput {

    jenisAlat: string;

    kelas: string;

    kapasitasMinimum: number;

    kapasitasMaksimum: number;

    nilaiE: number;

    layanan:
    | "TERA"
    | "TERA_ULANG";

}


export function generateTitikUji(
    data: GenerateTitikInput
) {


    const rule =
        findBKDRule({

            jenisAlat: data.jenisAlat,

            kelas: data.kelas,

            pengujian: "KEBENARAN"

        });



    if (!rule) {

        throw new Error(
            "Rule BKD tidak ditemukan"
        );

    }



    /*
    ==========================
    RENTANG BKD SESUAI KELAS
    ==========================
    */


    const rentang =
        hitungRentangBKD(
            rule,
            data.nilaiE
        );



    const titikTengah =
        hitungTitikTengah({

            jenisAlat:
                data.jenisAlat,

            batasBawah:
                rentang.batasBawah,

            batasAtas:
                rentang.batasAtas,

            kapasitasMax:
                data.kapasitasMaksimum

        });



    const titikUji = [

        data.kapasitasMinimum,

        titikTengah,

        data.kapasitasMaksimum

    ]
        .filter(
            (x): x is number =>
                x !== null &&
                x > 0
        );



    return titikUji.map(
        (nilai, index) => ({

            nomor: index + 1,

            titikUji: nilai,

            bkd:
                hitungBKD({

                    rule,

                    titikUji: nilai,

                    nilaiE: data.nilaiE,

                    layanan: data.layanan

                })

        })
    );

}