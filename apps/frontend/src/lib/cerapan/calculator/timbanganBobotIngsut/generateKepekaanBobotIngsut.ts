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

export function generateKepekaanBobotIngsut(
    data: Input
) {

    const rule =
        findBKDRule({
            jenisAlat: data.jenisAlat,
            kelas: data.kelas,
            pengujian: "KEPEKAAN"
        });

    if (!rule) {
        throw new Error("Rule kebenaran tidak ditemukan");
    }
    const muatan = data.kapasitasMaksimum;
    const bkd = hitungBKD({
        rule,
        titikUji: muatan,
        nilaiE: data.nilaiE,
        layanan: data.layanan,
        jenisAlat: data.jenisAlat
    });
    return [
        {
            lantaiAT: muatan,
            maksGandar: muatan,
            perluImbuh: false,
            kapasitasMaksimum: data.kapasitasMaksimum,
            jenisAlat: data.jenisAlat,
            kelas: data.kelas,
            layanan: data.layanan,
            nilaiE: data.nilaiE,
            bkd: bkd,
            imbuh: "Tambah imbuh sebesar BKD",
            pengamatan: null,
            hasil: null
        }

    ];

}