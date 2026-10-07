import type { CerapanTemplate } from "../types";
import { CerapanKebenaranTambahan } from "@/components/cerapan/KebenaranTambahan";
import { CerapanRepeatTambahan } from "@/components/cerapan/repeatTambahan";
import { CerapanPenyetelanNolTambahan } from "@/components/cerapan/PenyetelanNolTambahan";


export const timbanganElektronik: CerapanTemplate = {
    jenisAlat:
        "TIMBANGAN_ELEKTRONIK",
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
                "KEBENARAN",
            additionalComponent:
                CerapanKebenaranTambahan,
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
                        "muatanUji",
                    label:
                        "Muatan Uji (g)",
                    type:
                        "number",
                },
                {
                    key:
                        "penunjukan",
                    label:
                        "Penunjukan (g)",
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
                        "pengamatan",
                    label:
                        "Pengamatan Penunjukan",
                    type:
                        "text",
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
                "Muatan minimal (1/3 Maks)",
            type:
                "table",
            generator:
                "EKSENTRISITAS",
            additionalComponent:
                CerapanKebenaranTambahan,
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
                        "Muatan Uji (g)",
                    type:
                        "number"
                },
                {
                    key:
                        "penunjukan",
                    label:
                        "Penunjukan (g)",
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
                        "pengamatan",
                    label:
                        "Pengamatan Penunjukan",
                    type:
                        "text",
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
                "PENYETELAN_NOL",
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
                "PENYETEL_TARA",
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
                        "number",
                    readonly:
                        true
                },
                {
                    key:
                        "penunjukan10e",
                    label:
                        "Penunjukan (g)",
                    type:
                        "number"
                },
                {
                    key:
                        "imbuh025e",
                    label:
                        "+ Imbuh 0,25e (g)",
                    type:
                        "number",
                    readonly:
                        true
                },
                {
                    key:
                        "penunjukan025e",
                    label:
                        "Penunjukan (g)",
                    type:
                        "number"
                },
                {
                    key:
                        "pengamatan025e",
                    label:
                        "Pengamatan",
                    type:
                        "text",
                    readonly:
                        true
                },
                {
                    key:
                        "imbuh05e",
                    label:
                        "+ Imbuh 0,5e (g)",
                    type:
                        "number",
                    readonly:
                        true
                },
                {
                    key:
                        "penunjukan05e",
                    label:
                        "Penunjukan (g)",
                    type:
                        "number"
                },
                {
                    key:
                        "pengamatan05e",
                    label:
                        "Pengamatan",
                    type:
                        "text",
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
        KETIDAKTETAPAN / REPEATABILITY
        ======================================
        */


        {
            id:
                "repeatability",
            title:
                "Pengujian Kemampuan Ulang",
            type:
                "table",
            generator:
                "REPEATABILITY",
            summaryComponent:
                CerapanRepeatTambahan,
            columns: [
                {
                    key: "muatanUji",
                    label: "Muatan Uji (g)",
                    type: "number",
                },
                {
                    key:
                        "penunjukan",

                    label:
                        "Penunjukan (g)",

                    type:
                        "number",
                },
                {
                    key:
                        "penunjukanSetelahImbuh",

                    label:
                        "+ Imbuh 0,5e (g)",

                    type:
                        "number",
                },
                {
                    key:
                        "pengamatan05e",

                    label:
                        "Pengamatan",

                    type:
                        "text",

                    readonly:
                        true
                },
                {
                    key:
                        "penunjukan2",

                    label:
                        "Penunjukan (g)",

                    type:
                        "number"
                },
            ],

            summaryRows: [
                {
                    key:
                        "repeat",

                    label:
                        "R = Pmax - Pmin",

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