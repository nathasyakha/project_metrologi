import type { CerapanTemplate } from "../types";


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
       KEPEKAAN
       ======================================
       */


        {
            id:
                "kepekaan",
            title:
                "Pengujian Diskriminasi",
            type:
                "table",
            generator:
                "KEPEKAAN",
            calculation:
                "BKD",
            columns: [
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
                        "imbuh",
                    label:
                        "Imbuh",
                    type:
                        "text",
                    readonly:
                        true
                },
                {
                    key:
                        "pengamatan",
                    label:
                        "Pengamatan Penunjukan",
                    type:
                        "select",
                    options: [
                        {
                            "value": "BERGERAK",
                            "label": "Berubah minimal 0,7 BKD"
                        },
                        {
                            "value": "TIDAK_BERGERAK",
                            "label": "Tidak bergerak"
                        },
                        {
                            "value": "KURANG",
                            "label": "Bergerak kurang dari 0,7 BKD"
                        }
                    ]
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
                "REPEATABILITY_PEGAS",


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
            type:
                "table",
            generator:
                "EKSENTRISITAS_PEGAS",
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
                        "select",
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