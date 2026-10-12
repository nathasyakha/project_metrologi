import type { CerapanTemplate } from "../types";


export const timbanganSentisimal: CerapanTemplate = {
    jenisAlat:
        "TIMBANGAN_SENTISIMAL",
    pemeriksaan: [
        {
            id: "visual",
            title: "Pemeriksaan Visual",
            type: "checklist",
            items: [
                {
                    parameter: "Timbangan Bersih, Kering, Tidak Berkarat",
                    kondisi: "YA"
                },
                {
                    parameter: "Tanda skala dan nilai penunjukan skala dapat terlihat dengan jelas",
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
                "KEBENARAN_SENTISIMAL",
            columns: [
                {
                    key:
                        "lantaiAT",
                    label:
                        "Lantai AT (g)",
                    type:
                        "number",
                },
                {
                    key:
                        "piringAT",
                    label:
                        "Piring AT (g)",
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
                    label: "Pengamatan",
                    type: "select",
                    options: [
                        {
                            "value": "SAH",
                            "label": "Setimbang"
                        },
                        {
                            "value": "CEK_BAWAH",
                            "label": "Jarum penunjuk menjungkit ke bawah"
                        },
                        {
                            "value": "CEK_ATAS",
                            "label": "Jarum penunjuk menjungkit ke atas"
                        }
                    ]
                },
                {
                    key: "imbuh",
                    label: "Imbuh",
                    type: "text",
                    readonly: true

                },
                {
                    key: "pengamatanSetelahImbuh",
                    label: "Pengamatan",
                    type: "select",
                    options: [
                        {
                            "value": "SAH",
                            "label": "Setimbang/Melewati titik setimbang"
                        },
                        {
                            "value": "BATAL",
                            "label": "Tidak lewat titik setimbang"
                        }
                    ],
                    disabledWhen: (row: any) =>
                        row.pengamatan === "SAH"
                },

                {
                    key: "hasil",
                    label: "Hasil",
                    type: "text",
                    readonly: true
                },
            ]
        },
        /*
        ======================================
        PENGUJIAN KEPEKAAN
        ======================================
        */
        {
            id:
                "kepekaan",
            title:
                "Pengujian Kepekaan",
            type:
                "table",
            generator:
                "KEPEKAAN_SENTISIMAL",
            columns: [
                {
                    key:
                        "lantaiAT",
                    label:
                        "Lantai AT (g)",
                    type:
                        "number",
                },
                {
                    key:
                        "piringAT",
                    label:
                        "Piring AT (g)",
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
                    key: "imbuh",
                    label: "Imbuh",
                    type: "text",
                    readonly: true

                },
                {
                    key: "pengamatan",
                    label: "Pengamatan",
                    type: "select",
                    options: [
                        {
                            "value": "SAH",
                            "label": "Berubah 2 mm atau lebih dari posisi awal"
                        },
                        {
                            "value": "BATAL",
                            "label": "Berubah kurang dari 2 mm dari posisi awal"
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
        PENGUJIAN REPEATABILITY
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
                "REPEATABILITY_SENTISIMAL",
            columns: [
                {
                    key:
                        "nomor",
                    label:
                        "Penimbangan ke-",
                    type:
                        "number",
                    readonly:
                        true
                },
                {
                    key:
                        "lantaiAT",
                    label:
                        "Lantai AT (g)",
                    type:
                        "number",
                },
                {
                    key:
                        "piringAT",
                    label:
                        "Piring AT (g)",
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
                    label: "Pengamatan",
                    type: "select",
                    options: [
                        {
                            "value": "SAH",
                            "label": "Setimbang"
                        },
                        {
                            "value": "CEK_ATAS",
                            "label": "Tolok Menjungkit ke atas"
                        },
                        {
                            "value": "CEK_BAWAH",
                            "label": "Tolok Menjungkit ke bawah"
                        }
                    ],
                },
                {
                    key: "imbuh",
                    label: "Imbuh",
                    type: "text",
                    readonly: true

                },
                {
                    key: "pengamatanSetelahImbuh",
                    label: "Pengamatan",
                    type: "select",
                    options: [
                        {
                            "value": "SAH",
                            "label": "Setimbang/Melewati titik Setimbang"
                        },
                        {
                            "value": "BATAL",
                            "label": "Kurang dari titik setimbang"
                        }
                    ],
                    disabledWhen: (row: any) =>
                        row.pengamatan === "SAH"
                },

                {
                    key: "hasil",
                    label: "Hasil",
                    type: "text",
                    readonly: true
                },
            ]
        },

        /*
        ======================================
        PENGUJIAN EKSENTRISITAS
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
                "EKSENTRISITAS_SENTISIMAL",
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
                        "maksGandar",
                    label:
                        "Maksimum Gandar Utama (g)",
                    type:
                        "number",
                },
                {
                    key:
                        "lantaiAT",
                    label:
                        "Lantai AT (g)",
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
                    label: "Pengamatan",
                    type: "select",
                    options: [
                        {
                            "value": "SAH",
                            "label": "Setimbang"
                        },
                        {
                            "value": "CEK_ATAS",
                            "label": "Tolok Menjungkit ke atas"
                        },
                        {
                            "value": "CEK_BAWAH",
                            "label": "Tolok Menjungkit ke bawah"
                        }
                    ]
                },
                {
                    key: "imbuh",
                    label: "Imbuh",
                    type: "text",
                    readonly: true

                },
                {
                    key: "pengamatanSetelahImbuh",
                    label: "Pengamatan",
                    type: "select",
                    options: [
                        {
                            "value": "SAH",
                            "label": "Setimbang/Lewat titik setimbang"
                        },
                        {
                            "value": "BATAL",
                            "label": "Tidak lewat titik setimbang"
                        }
                    ],
                    disabledWhen: (row: any) =>
                        row.pengamatan === "SAH"
                },

                {
                    key: "hasil",
                    label: "Hasil",
                    type: "text",
                    readonly: true
                },
            ]
        },
        /*
        ======================================
        PENGUJIAN KEMIRINGAN
        ======================================
        */
        {
            id:
                "kemiringan",

            title:
                "Pengujian Kemiringan",

            type:
                "table",

            generator:
                "KEMIRINGAN_SENTISIMAL",


            columns: [


                {
                    key:
                        "lantaiAT",
                    label:
                        "Lantai AT (g)",
                    type:
                        "number",
                },
                {
                    key:
                        "piringAT",
                    label:
                        "Piring AT (g)",
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
                    label: "Pengamatan",
                    type: "select",
                    options: [
                        {
                            "value": "SAH",
                            "label": "Setimbang"
                        },
                        {
                            "value": "CEK_ATAS",
                            "label": "Tolok Menjungkit ke atas"
                        },
                        {
                            "value": "CEK_BAWAH",
                            "label": "Tolok Menjungkit ke bawah"
                        }
                    ]
                },
                {
                    key: "imbuh",
                    label: "Imbuh",
                    type: "text",
                    readonly: true

                },
                {
                    key: "pengamatanSetelahImbuh",
                    label: "Pengamatan",
                    type: "select",
                    options: [
                        {
                            "value": "SAH",
                            "label": "Setimbang/Lewat titik setimbang"
                        },
                        {
                            "value": "BATAL",
                            "label": "Tidak lewat titik setimbang"
                        }
                    ],
                    disabledWhen: (row: any) =>
                        row.pengamatan === "SAH"
                },

                {
                    key: "hasil",
                    label: "Hasil",
                    type: "text",
                    readonly: true
                },
            ]
        },
        /*
        ======================================
        PENGUJIAN KEBENARAN GANDAR
        ======================================
        */
        {
            id:
                "kebenaran_gandar",
            title:
                "Pengujian Kebenaran Gandar",
            type:
                "table",
            generator:
                "KEBENARAN_GANDAR_SENTISIMAL",
            columns: [
                {
                    key:
                        "maksGandar",
                    label:
                        "Maksimum Gandar Utama (g)",
                    type:
                        "number",
                },
                {
                    key:
                        "lantaiAT",
                    label:
                        "Lantai AT (g)",
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
                    label: "Pengamatan",
                    type: "select",
                    options: [
                        {
                            "value": "SAH",
                            "label": "Setimbang"
                        },
                        {
                            "value": "CEK_ATAS",
                            "label": "Tolok Menjungkit ke atas"
                        },
                        {
                            "value": "CEK_BAWAH",
                            "label": "Tolok Menjungkit ke bawah"
                        }
                    ]
                },
                {
                    key: "imbuh",
                    label: "Imbuh",
                    type: "text",
                    readonly: true

                },
                {
                    key: "pengamatanSetelahImbuh",
                    label: "Pengamatan",
                    type: "select",
                    options: [
                        {
                            "value": "SAH",
                            "label": "Setimbang/Lewat titik setimbang"
                        },
                        {
                            "value": "BATAL",
                            "label": "Tidak lewat titik setimbang"
                        }
                    ],
                    disabledWhen: (row: any) =>
                        row.pengamatan === "SAH"
                },

                {
                    key: "hasil",
                    label: "Hasil",
                    type: "text",
                    readonly: true
                },
            ]
        },
        /*
        ======================================
        PENGUJIAN ANAK TIMBANGAN
        ======================================
        */

        {
            id:
                "anak_timbangan_perlengkapan",

            title:
                "Pengujian Anak Timbangan Perlengkapan",

            type:
                "table",

            generator:
                "ANAK_TIMBANGAN_PERLENGKAPAN",

            columns: [

                {
                    key:
                        "kelasAT",

                    label:
                        "Kelas",

                    type:
                        "text",

                    readonly:
                        true
                },


                {
                    key:
                        "nominal",

                    label:
                        "Nominal (g)",

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
                        "kesalahan",

                    label:
                        "Kesalahan (g)",

                    type:
                        "number",
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
        }

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