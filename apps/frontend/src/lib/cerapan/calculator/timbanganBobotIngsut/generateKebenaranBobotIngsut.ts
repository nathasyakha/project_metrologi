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



export function generateKebenaranBobotIngsut(
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
            "Rule kebenaran tidak ditemukan"
        );
    }
    const muatan =
        data.kapasitasMaksimum;



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

    return [

        {

            lantaiAT:
                muatan,
            maksGandar:
                muatan,
            bkd:
                bkd,
            pengamatan:
                null,
            hasil:
                null,
            imbuh:
                null,
            pengamatanSetelahImbuh:
                null,
        }

    ];

}