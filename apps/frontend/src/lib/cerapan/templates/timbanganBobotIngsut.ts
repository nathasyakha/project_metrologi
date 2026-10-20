import type { CerapanTemplate } from "../types";


export const timbanganBobotIngsut: CerapanTemplate = {
    jenisAlat:
        "TIMBANGAN_BOBOT_INGSUT",
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
                "KEBENARAN_BOBOT_INGSUT",
            columns: [
                {
                    key:
                        "lantaiAT",
                    label:
                        "Lantai AT (g)",
                    type:
                        "number",
                    max:
                        (row: any) =>
                            Number(row.kapasitasMaksimum)
                },
                {
                    key:
                        "maksGandar",
                    label:
                        "Maksimal Gandar Besar (g)",
                    type:
                        "number",
                    max:
                        (row: any) =>
                            Number(row.kapasitasMaksimum)
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
                "KEPEKAAN_BOBOT_INGSUT",
            columns: [
                {
                    key:
                        "lantaiAT",
                    label:
                        "Lantai AT (g)",
                    type:
                        "number",
                    max:
                        (row: any) =>
                            Number(row.kapasitasMaksimum)
                },
                {
                    key:
                        "maksGandar",
                    label:
                        "Maksimal Gandar Besar (g)",
                    type:
                        "number",
                    max:
                        (row: any) =>
                            Number(row.kapasitasMaksimum)
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
                "REPEATABILITY_BOBOT_INGSUT",
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
                    max:
                        (row: any) =>
                            Number(row.kapasitasMaksimum)
                },
                {
                    key:
                        "maksGandar",
                    label:
                        "Maksimal Gandar Besar (g)",
                    type:
                        "number",
                    max:
                        (row: any) =>
                            Number(row.kapasitasMaksimum)
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
                "EKSENTRISITAS_BOBOT_INGSUT",
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
                    max:
                        (row: any) =>
                            Number(row.kapasitasMaksimum)
                },
                {
                    key:
                        "maksGandar",
                    label:
                        "Gandar (g)",
                    type:
                        "number",
                    max:
                        (row: any) =>
                            Number(row.kapasitasMaksimum)
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
                "KEMIRINGAN_BOBOT_INGSUT",


            columns: [


                {
                    key:
                        "lantaiAT",
                    label:
                        "Lantai AT (g)",
                    type:
                        "number",
                    max:
                        (row: any) =>
                            Number(row.kapasitasMaksimum)
                },
                {
                    key:
                        "maksGandar",
                    label:
                        "Gandar (g)",
                    type:
                        "number",
                    max:
                        (row: any) =>
                            Number(row.kapasitasMaksimum)
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
        PENGUJIAN KEBENARAN GANDAR KECIL
        ======================================
        */
        {
            id:
                "kebenaran_gandar",
            title:
                "Pengujian Kebenaran Gandar Kecil",
            type:
                "table",
            generator:
                "KEBENARAN_GANDAR_BOBOT_INGSUT",
            columns: [
                {
                    key:
                        "lantaiAT",
                    label:
                        "Lantai AT (g)",
                    type:
                        "number",
                    max:
                        (row: any) =>
                            Number(row.kapasitasMaksimum)
                },
                {
                    key:
                        "gandarKecil",
                    label:
                        "Maks Gandar Kecil - 5e (g)",
                    type:
                        "number",
                    max:
                        (row: any) =>
                            Number(row.kapasitasMaksimum)
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