import { hitungTitikTengah } from "../common/getTitikInterval";
import { hitungBatasBawah } from "../common/hitungInterval";
import { hitungBatasAtas } from "../common/hitungInterval";
import { findBKDRule } from "../../rules/findBKDRules";

export interface InputRepeatability {

    kapasitasMaksimum: number;
    jenisAlat: string;
    kelas: string;
    nilaiE: number;

    layanan:
    | "TERA"
    | "TERA_ULANG";

}


export function generateRepeatability(
    data: InputRepeatability
) {

    const rule =
        findBKDRule({
            jenisAlat:
                data.jenisAlat,

            kelas:
                data.kelas,

            pengujian:
                "REPEATABILITY"
        });


    if (!rule) {

        throw new Error(
            "Rule Repeatability tidak ditemukan"
        );

    }


    const batasBawah =
        hitungBatasBawah(
            data.jenisAlat,
            data.kelas,
            data.nilaiE
        );


    const batasAtas =
        hitungBatasAtas(
            data.kelas,
            data.nilaiE
        );


    const titikTengah =
        hitungTitikTengah({

            jenisAlat:
                data.jenisAlat,

            batasBawah,

            batasAtas,

            kapasitasMax:
                data.kapasitasMaksimum

        });

    if (
        titikTengah === null
    ) {

        throw new Error(
            "Titik tengah repeatability tidak ditemukan"
        );

    }

    return [

        {

            muatanUji:
                titikTengah,

            penunjukan:
                null,
            penunjukan2:
                null,
            nilaiE:
                data.nilaiE,

            layanan:
                data.layanan,

            /*
            =====================
            TAMBAHAN REPEAT
            =====================
            */

            perluUjiTambahan: false,
            tampilTambahan: false,


            penunjukanTambahan1: null,
            penunjukanTambahan2: null,
            penunjukanTambahan3: null,
            imbuh1: null,
            imbuh2: null,
            imbuh3: null,
            penunjukanSebenarnya1: null,
            penunjukanSebenarnya2: null,
            penunjukanSebenarnya3: null,
            repeatTambahan: null,
            hasilTambahan: null,
            repeat:
                null,

            hasil:
                null
        },


        {

            muatanUji:
                titikTengah,

            penunjukan:
                null,
            penunjukan2:
                null,


            nilaiE:
                data.nilaiE,

            layanan:
                data.layanan,


            repeat:
                null,

            hasil:
                null
        },


        {
            muatanUji:
                titikTengah,

            penunjukan:
                null,
            penunjukan2:
                null,

            nilaiE:
                data.nilaiE,

            layanan:
                data.layanan,
            muatanUjiTambahan: titikTengah,

            repeat:
                null,

            hasil:
                null
        }

    ];
}