import type { CerapanTemplate } from "../types";
import { CerapanPenyetelanNolTambahan } from "@/components/cerapan/PenyetelanNolTambahan";


export const timbanganJembatan: CerapanTemplate = {
    jenisAlat:
        "TIMBANGAN_JEMBATAN",
    pemeriksaan: [
        {
            id: "visual",
            title: "Pemeriksaan Visual",
            type: "checklist",
            items: [
                {
                    parameter: "Tanda Tera",
                    kondisi: "ADA"
                },
                {
                    parameter: "Alat Penunjuk Kedataran",
                    kondisi: "ADA"
                },
                {
                    parameter: "Bersih, Kering, dan Tidak Berkarat",
                    kondisi: "YA"
                },
                {
                    parameter: "Sesuai ITP/IT yang berlaku",
                    kondisi: "YA"
                },
            ]
        },

    ],

    pengujian: [
        /*
        ======================================
        KETIDAKTETAPAN / REPEATABILITY
        ======================================
        */

        {
            id:
                "repeatability",
            title:
                "Pengujian Kemampuan Ulang",
            description:
                "Muatan sekitar 50% Kapasitas Maksimum",
            type:
                "table",
            generator:
                "REPEATABILITY_JEMBATAN",
            columns: [
                {
                    key: "muatanUji",
                    label: "Muatan Uji (kg)",
                    type: "number",
                    max:
                        (row: any) =>
                            Number(row.kapasitasMaksimum)
                },
                {
                    key:
                        "penunjukan",

                    label:
                        "Penunjukan IL (kg)",

                    type:
                        "number",
                },
                {
                    key:
                        "imbuh",

                    label:
                        "ΔL (kg)",

                    type:
                        "number",
                },
                {
                    key:
                        "penunjukanSebenarnya",

                    label:
                        "P = IL + 0,5e - ΔL (kg)",

                    type:
                        "number",
                    readonly:
                        true
                },
            ],

            summaryRows: [
                {
                    key:
                        "bkd",
                    label:
                        "BKD (kg)",
                    type:
                        "number",
                    readonly:
                        true
                },
                {
                    key:
                        "repeat",

                    label:
                        "R = Pmax - Pmin (kg)",

                    type:
                        "number",

                    readonly:
                        true
                },
                {
                    key:
                        "hasil",

                    label:
                        "Hasil",

                    type:
                        "text",

                    readonly:
                        true
                }
            ]

        },
        /*
        ======================================
        PENGUJIAN KEBENARAN
        ======================================
        */
        {
            id:
                "kebenaran",
            title:
                "Pengujian Kebenaran",
            type:
                "table",
            generator:
                "KEBENARAN_JEMBATAN",
            calculation:
                "BKD",
            columns: [
                {
                    key:
                        "nomor",
                    label:
                        "No",
                    type:
                        "number",
                    readonly:
                        true
                },
                {
                    key:
                        "standar",
                    label:
                        "Standar (kg)",
                    type:
                        "number",
                    max:
                        (row: any) =>
                            Number(row.kapasitasMaksimum)
                },
                {
                    key:
                        "ballast",
                    label:
                        "Ballast (kg)",
                    type:
                        "number"
                },
                {
                    key:
                        "standarBallast",
                    label:
                        "L (Standar + Ballast) (kg)",
                    type:
                        "number",
                    readonly:
                        true
                },
                {
                    key:
                        "penunjukan",

                    label:
                        "Penunjukan IL (kg)",

                    type:
                        "number",
                },
                {
                    key:
                        "imbuh",

                    label:
                        "ΔL (kg)",

                    type:
                        "number",
                },
                {
                    key:
                        "penunjukanSebenarnya",

                    label:
                        "P = IL + 0,5e - ΔL (kg)",

                    type:
                        "number"
                },
                {
                    key:
                        "kesalahan",

                    label:
                        "Kesalahan Timbangan (kg)",

                    type:
                        "number",
                    readonly:
                        true
                },
                {
                    key:
                        "bkd",
                    label:
                        "BKD (g)",
                    type:
                        "number",
                    readonly:
                        true
                },
                {
                    key:
                        "hasil",
                    label:
                        "Hasil",
                    type:
                        "text",
                    readonly:
                        true
                }
            ]
        },
        /*
       ======================================
       EKSENTRISITAS
       ======================================
       */


        {
            id:
                "eksentrisitas",
            title:
                "Pengujian Eksentrisitas",
            description:
                "Muatan sekitar 1/3 Kapasitas Maksimum",
            type:
                "table",
            generator:
                "EKSENTRISITAS_JEMBATAN",
            calculation:
                "BKD",
            columns: [
                {
                    key:
                        "posisiUji",
                    label:
                        "Posisi Uji",
                    type:
                        "number",
                    readonly:
                        true
                },
                {
                    key:
                        "muatanUji",
                    label:
                        "Muatan Uji L (kg)",
                    type:
                        "number",
                    max:
                        (row: any) =>
                            Number(row.kapasitasMaksimum)
                },
                {
                    key:
                        "penunjukan",
                    label:
                        "Penunjukan IL (kg)",
                    type:
                        "number"
                },
                {
                    key:
                        "imbuh",

                    label:
                        "ΔL (kg)",

                    type:
                        "number",
                },
                {
                    key:
                        "kesalahanPenunjukan",

                    label:
                        "Kesalahan Penunjukan (kg) E = IL + 0,5e - ΔL - L",

                    type:
                        "number"
                },
                {
                    key:
                        "bkd",
                    label:
                        "BKD (g)",
                    type:
                        "number",
                    readonly:
                        true
                },
                {
                    key:
                        "hasil",
                    label:
                        "Hasil",
                    type:
                        "text",
                    readonly:
                        true
                }
            ]
        },
        /*
       ======================================
       Penyetelan Nol
       ======================================
       */


        {
            id:
                "penyetelan_nol",
            title:
                "Pengujian Penyetelan Nol",
            type:
                "table",
            generator:
                "PENYETELAN_NOL_JEMBATAN",
            additionalComponent:
                CerapanPenyetelanNolTambahan,
            columns: [
                {
                    key:
                        "langkah",
                    label:
                        "Langkah",
                    type:
                        "text",
                    readonly:
                        true
                },
                {
                    key:
                        "pemeriksaan",
                    label:
                        "Periksa Penunjukan",
                    type:
                        "select",
                    options: [
                        {
                            "value": "BERUBAH",
                            "label": "Dalam 5-15 s penunjukan berubah menjadi nol"
                        },
                        {
                            "value": "TIDAK_BERUBAH",
                            "label": "Setelah 15 s penunjukan tidak berubah menjadi nol"
                        }
                    ]
                },
                {
                    key:
                        "jenisPenyetelNol",
                    label:
                        "Jenis Penyetelan Nol",
                    type:
                        "text",
                    readonly:
                        true
                },
            ]
        },
        /*
        ======================================
        Penyetelan Tara
        ======================================
        */


        {
            id:
                "penyetel_tara",
            title:
                "Pengujian Penyetel Tara",
            type:
                "table",
            generator:
                "PENYETELAN_TARA_JEMBATAN",
            columns: [
                {
                    key:
                        "langkah",
                    label:
                        "ATS sekitar 20% Max (g)",
                    type:
                        "text",
                    readonly:
                        true
                },
                {
                    key:
                        "tekanTara",
                    label:
                        "Tekan TARA",
                    type:
                        "number",
                    readonly:
                        true

                },
                {
                    key:
                        "imbuh10e",
                    label:
                        "+ Imbuh 10e (g)",
                    type:
                        "number"
                },
                {
                    key:
                        "imbuh025e",
                    label:
                        "+ Imbuh 0,25e (g)",
                    type:
                        "number"
                },
                {
                    key:
                        "imbuh05e",
                    label:
                        "+ Imbuh 0,5e (g)",
                    type:
                        "number"
                },
                {
                    key:
                        "hasil",
                    label:
                        "Hasil",
                    type:
                        "text",
                    readonly:
                        true
                }
            ]
        },

    ],





    kesimpulan: [


        {

            name:
                "statusAkhir",


            label:
                "Kesimpulan Pengujian",


            type:
                "select"

        },


        {

            name:
                "catatanPenguji",


            label:
                "Catatan Penguji",


            type:
                "text"

        }


    ]


};