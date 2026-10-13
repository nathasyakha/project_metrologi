import { hitungBKD } from "../common/hitungBKD";
import { findBKDRule } from "../../rules/findBKDRules";



interface Input {
    jenisAlat: string;
    kelas: string;
    kapasitasMaksimum: number;
    nilaiE: number;
    layanan:
    | "TERA"
    | "TERA_ULANG";
}



export function generateEksentrisitasBobotIngsut(
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
            "Rule kebenaran tidak ditemukan"
        );
    }
    const muatan =
        Math.ceil(
            data.kapasitasMaksimum * 0.3
        );


    const jumlahPosisi = 4;

    const bkd =
        hitungBKD({
            rule,
            titikUji:
                muatan,
            nilaiE:
                data.nilaiE,
            layanan:
                data.layanan
        });

    return Array.from(
        {
            length: jumlahPosisi
        },

        (_, index) => {


            return {

                posisiUji:
                    index + 1,


                /*
                =====================
                MUATAN EKSENTRISITAS
                =====================
                */

                maksGandar:
                    muatan,


                lantaiAT:
                    muatan,


                bkd:
                    bkd,


                pengamatan:
                    null,


                imbuh:
                    null,


                perluImbuh:
                    false,


                pengamatanSetelahImbuh:
                    null,


                hasil:
                    null


            };


        }

    );

}