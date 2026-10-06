import { hitungBKD } from "./hitungBKD";
import { findBKDRule } from "../rules/findBKDRules";
import { hitungBatasBawah, hitungBatasAtas } from "./hitungInterval";
import { hitungTitikTengah } from "./getTitikInterval";

interface Input {
    jenisAlat: string;
    kelas: string;
    kapasitasMinimum: number;
    kapasitasMaksimum: number;
    nilaiE: number;
    layanan:
    | "TERA"
    | "TERA_ULANG";
}

export function generateKebenaran(
    data: Input
) {

    const batasBawah = hitungBatasBawah(
        data.jenisAlat,
        data.kelas,
        data.nilaiE
    );
    const batasAtas = hitungBatasAtas(
        data.kelas,
        data.nilaiE
    );
    const titikTengah = hitungTitikTengah({
        jenisAlat: data.jenisAlat,
        batasBawah,
        batasAtas,
        kapasitasMax: data.kapasitasMaksimum
    });

    console.log(
        "INPUT GENERATE KEBENARAN",
        data
    );

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

    const titik = [
        data.kapasitasMinimum,
        titikTengah,
        data.kapasitasMaksimum
    ]
        .filter(
            nilai => nilai !== null
        );

    const hasil = titik.map(
        (nilai, index) => {

            const placeholderBKD =
                hitungBKD({
                    rule,

                    titikUji:
                        nilai,

                    nilaiE:
                        data.nilaiE,

                    layanan:
                        data.layanan
                });


            return {

                nomor:
                    index + 1,


                /*
                 * =========================
                 * PLACEHOLDER
                 * =========================
                 */

                placeholderMuatanUji:
                    nilai,

                placeholderBKD:
                    placeholderBKD !== null
                        ? Number(
                            placeholderBKD.toFixed(3)
                        )
                        : null,


                /*
                 * =========================
                 * INPUT AKTUAL
                 * =========================
                 */

                muatanUji:
                    nilai,

                penunjukan:
                    null,


                /*
                 * =========================
                 * DATA PERHITUNGAN
                 * =========================
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
                 * =========================
                 * HASIL
                 * =========================
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

                //kondisi 1e
                perluUjiTambahan: false,
                arahUjiTambahan: null,
                penunjukanSetelahImbuh: null

            };

        }
    );


    return hasil;
}