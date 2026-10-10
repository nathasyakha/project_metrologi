import type { CerapanTemplate } from "../types";


export const timbanganMeja: CerapanTemplate = {
    jenisAlat:
        "TIMBANGAN_MEJA",
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
                "KEBENARAN_MEJA",
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
                        "tembor",
                    label:
                        "Tembor (g)",
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
                            "value": "CEK",
                            "label": "Tolok Menjungkit ke atas"
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
                }
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
                "EKSENTRISITAS_MEJA",
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
                        "lantaiAT",
                    label:
                        "Lantai AT (g)",
                    type:
                        "number",
                },
                {
                    key:
                        "tembor",
                    label:
                        "Tembor (g)",
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
                            "value": "CEK",
                            "label": "Tolok Menjungkit ke atas"
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
                "KEPEKAAN_MEJA",
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
                        "tembor",
                    label:
                        "Tembor (g)",
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
                "REPEATABILITY_MEJA",
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
                        "tembor",
                    label:
                        "Tembor (g)",
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
                            "label": "Setimbang"
                        },
                        {
                            "value": "SAH2",
                            "label": "Melewati titik setimbang"
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