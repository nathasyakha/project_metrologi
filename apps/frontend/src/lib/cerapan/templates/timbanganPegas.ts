import type { CerapanTemplate } from "../types";
import { CerapanKebenaranTambahan } from "@/components/cerapan/KebenaranTambahan";
import { CerapanRepeatTambahan } from "@/components/cerapan/repeatTambahan";


export const timbanganPegas: CerapanTemplate = {
    jenisAlat:
        "TIMBANGAN_PEGAS",
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
                    parameter: "Bersih, Kering, dan Tidak Berkarat",
                    kondisi: "YA"
                },
                {
                    parameter: "Tidak ada alat tambahan",
                    kondisi: "TIDAK"
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
                        "bkd",
                    label:
                        "BKD (g)",
                    type:
                        "number",
                    readonly:
                        true
                },
                {
                    key: "pengamatan",
                    label: "Pengamatan Jarum Penunjuk",
                    type: "select",
                    options: [
                        {
                            "value": "SAH",
                            "label": "Kesalahan penunjukkan tidak melebihi BKD"
                        },
                        {
                            "value": "BATAL",
                            "label": "Kesalahan penunjukkan melebihi BKD"
                        }
                    ]
                },


                {
                    key: "hasil",
                    label: "Hasil",
                    type: "text",
                    readonly: true
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