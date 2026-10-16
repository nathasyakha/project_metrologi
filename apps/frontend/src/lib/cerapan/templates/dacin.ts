import type { CerapanTemplate } from "../types";

export const dacin: CerapanTemplate = {
    jenisAlat: "DACIN",
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
        {
            id: "kebenaran",
            title: "Pengujian Kebenaran",
            type: "table",
            generator: "KEBENARAN_DACIN",
            columns: [
                {
                    key: "muatanUji",
                    label: "Muatan Uji (kg)",
                    type: "number",
                },
                {
                    key: "bkd",
                    label: "BKD (g)",
                    type: "number",
                    readonly: true
                },
                {
                    key: "pengamatan",
                    label: "Pengamatan Awal",
                    type: "select",
                    options: [
                        { "value": "SAH", "label": "Setimbang" },
                        { "value": "CEK_BAWAH", "label": "Batang skala ke bawah" },
                        { "value": "CEK_ATAS", "label": "Batang skala ke atas" }
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
                        { "value": "SAH_1", "label": "Setimbang" },
                        { "value": "SAH_2", "label": "Melewati Titik Setimbang" },
                        { "value": "BATAL", "label": "Tidak setimbang / Tidak melewati tolok" }
                    ],
                    disabledWhen: (row: any) =>
                        !row.pengamatan || row.pengamatan === "SAH"
                },
                {
                    key: "imbuh2",
                    label: "Imbuh",
                    type: "text",
                    readonly: true
                },
                {
                    key: "pengamatanSetelahImbuh2",
                    label: "Pengamatan",
                    type: "select",
                    options: [
                        { "value": "SAH_1", "label": "Jarum setimbang" },
                        { "value": "SAH_2", "label": "Jarum bergerak melewati tolok" },
                        { "value": "SAH_3", "label": "Jarum bergerak tidak melewati tolok" }
                    ],
                    disabledWhen: (row: any) =>
                        row.pengamatan !== "CEK_ATAS" || row.pengamatanSetelahImbuh !== "SAH_2"
                },
                {
                    key: "hasil",
                    label: "Hasil",
                    type: "text",
                    readonly: true
                },
            ]
        },
        {
            id: "kepekaan",
            title: "Pengujian Kepekaan",
            type: "table",
            generator: "KEPEKAAN_DACIN",
            columns: [
                {
                    key: "muatanUji",
                    label: "Muatan Uji (kg)",
                    type: "number",
                },
                {
                    key: "bkd",
                    label: "BKD (g)",
                    type: "number",
                    readonly: true
                },
                {
                    key: "imbuh",
                    label: "Imbuh",
                    type: "text",
                    readonly: true
                },
                {
                    key: "pengamatan",
                    label: "Pengamatan Awal",
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
                },
            ]
        },
        {
            id: "repeatability",
            title: "Pengujian Repeatability",
            type: "table",
            generator: "REPEATABILITY_DACIN",
            columns: [
                {
                    key: "nomor",
                    label: "Penimbangan ke-",
                    type: "number",
                    readonly: true
                },
                {
                    key: "muatanUji",
                    label: "Muatan Uji (kg)",
                    type: "number",
                },
                {
                    key: "bkd",
                    label: "BKD (g)",
                    type: "number",
                    readonly: true
                },
                {
                    key: "pengamatan",
                    label: "Pengamatan Awal",
                    type: "select",
                    options: [
                        { "value": "SAH", "label": "Setimbang" },
                        { "value": "CEK_BAWAH", "label": "Batang skala ke bawah" },
                        { "value": "CEK_ATAS", "label": "Batang skala ke atas" }
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
                        { "value": "SAH_1", "label": "Setimbang" },
                        { "value": "SAH_2", "label": "Melewati Titik Setimbang" },
                        { "value": "BATAL", "label": "Tidak setimbang / Tidak melewati tolok" }
                    ],
                    disabledWhen: (row: any) =>
                        !row.pengamatan || row.pengamatan === "SAH"
                },
                {
                    key: "imbuh2",
                    label: "Imbuh",
                    type: "text",
                    readonly: true
                },
                {
                    key: "pengamatanSetelahImbuh2",
                    label: "Pengamatan",
                    type: "select",
                    options: [
                        { "value": "SAH_1", "label": "Jarum setimbang" },
                        { "value": "SAH_2", "label": "Jarum bergerak melewati tolok" },
                        { "value": "SAH_3", "label": "Jarum bergerak tidak melewati tolok" }
                    ],
                    disabledWhen: (row: any) =>
                        row.pengamatan !== "CEK_ATAS" || row.pengamatanSetelahImbuh !== "SAH_2"
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
            name: "statusAkhir",
            label: "Kesimpulan Pengujian",
            type: "select"
        },
        {
            name: "catatanPenguji",
            label: "Catatan Penguji",
            type: "text"
        }
    ]
};