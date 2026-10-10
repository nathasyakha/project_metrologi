export interface BKDLimit {
    minE: number;
    maxE: number;
    faktorBKD: number;
}

export interface BKDRule {
    jenisAlat: string[];
    kelas: string,
    pengujian: string[];
    limits: BKDLimit[];
}

export const bkdRules: BKDRule[] = [
    {
        jenisAlat: [
            "TIMBANGAN_ELEKTRONIK",
            "TIMBANGAN_SENTISIMAL",
            "TIMBANGAN_PEGAS",
            "TIMBANGAN_BOBOT_INGSUT",
            "TIMBANGAN_JEMBATAN"
        ],
        kelas: "I",
        pengujian: ["KEBENARAN", "EKSENTRISITAS", "REPEATABILITY", "KEPEKAAN"],
        limits: [
            {
                minE: 0,
                maxE: 50000,
                faktorBKD: 0.5
            },
            {
                minE: 50000,
                maxE: 200000,
                faktorBKD: 1
            },
            {
                minE: 200000,
                maxE: 1000000,
                faktorBKD: 1.5
            }
        ]
    },
    {
        jenisAlat: [
            "TIMBANGAN_ELEKTRONIK",
            "TIMBANGAN_SENTISIMAL",
            "TIMBANGAN_PEGAS",
            "TIMBANGAN_BOBOT_INGSUT",
            "TIMBANGAN_JEMBATAN"
        ],
        kelas: "II",
        pengujian: ["KEBENARAN", "EKSENTRISITAS", "REPEATABILITY", "KEPEKAAN"],
        limits: [
            {
                minE: 0,
                maxE: 5000,
                faktorBKD: 0.5
            },
            {
                minE: 5000,
                maxE: 20000,
                faktorBKD: 1
            },
            {
                minE: 20000,
                maxE: 100000,
                faktorBKD: 1.5
            }
        ]
    },
    {
        jenisAlat: [
            "TIMBANGAN_ELEKTRONIK",
            "TIMBANGAN_SENTISIMAL",
            "TIMBANGAN_PEGAS",
            "TIMBANGAN_BOBOT_INGSUT",
            "TIMBANGAN_JEMBATAN"
        ],
        kelas: "III",
        pengujian: ["KEBENARAN", "EKSENTRISITAS", "REPEATABILITY", "KEPEKAAN"],
        limits: [
            {
                minE: 0,
                maxE: 500,
                faktorBKD: 0.5
            },
            {
                minE: 501,
                maxE: 2000,
                faktorBKD: 1
            },
            {
                minE: 2001,
                maxE: 10000,
                faktorBKD: 1.5
            }
        ]
    },
    {
        jenisAlat: [
            "TIMBANGAN_ELEKTRONIK",
            "TIMBANGAN_SENTISIMAL",
            "TIMBANGAN_PEGAS",
            "TIMBANGAN_BOBOT_INGSUT",
            "TIMBANGAN_JEMBATAN"
        ],
        kelas: "IIII",
        pengujian: ["KEBENARAN", "EKSENTRISITAS", "REPEATABILITY", "KEPEKAAN"],
        limits: [
            {
                minE: 0,
                maxE: 50,
                faktorBKD: 0.5
            },
            {
                minE: 51,
                maxE: 200,
                faktorBKD: 1
            },
            {
                minE: 201,
                maxE: 1000,
                faktorBKD: 1.5
            }
        ]
    },
    {
        jenisAlat: [
            "TIMBANGAN_ELEKTRONIK",
            "TIMBANGAN_JEMBATAN"
        ],
        kelas: "I",
        pengujian: ["PENYETEL_NOL", "PENYETEL_TARA"],
        limits: [
            {
                minE: 0,
                maxE: 50000,
                faktorBKD: 0.5
            },
            {
                minE: 50001,
                maxE: 200000,
                faktorBKD: 1
            },
            {
                minE: 200001,
                maxE: 1000000,
                faktorBKD: 1.5
            }
        ]
    },
    {
        jenisAlat: [
            "TIMBANGAN_ELEKTRONIK",
            "TIMBANGAN_JEMBATAN"
        ],
        kelas: "II",
        pengujian: ["PENYETEL_NOL", "PENYETEL_TARA"],
        limits: [
            {
                minE: 0,
                maxE: 5000,
                faktorBKD: 0.5
            },
            {
                minE: 5001,
                maxE: 20000,
                faktorBKD: 1
            },
            {
                minE: 20001,
                maxE: 100000,
                faktorBKD: 1.5
            }
        ]
    },
    {
        jenisAlat: [
            "TIMBANGAN_ELEKTRONIK",
            "TIMBANGAN_JEMBATAN"
        ],
        kelas: "III",
        pengujian: ["PENYETEL_NOL", "PENYETEL_TARA"],
        limits: [
            {
                minE: 0,
                maxE: 500,
                faktorBKD: 0.5
            },
            {
                minE: 501,
                maxE: 2000,
                faktorBKD: 1
            },
            {
                minE: 2001,
                maxE: 10000,
                faktorBKD: 1.5
            }
        ]
    },
    {
        jenisAlat: [
            "TIMBANGAN_ELEKTRONIK",
            "TIMBANGAN_JEMBATAN"
        ],
        kelas: "IIII",
        pengujian: ["PENYETEL_NOL", "PENYETEL_TARA"],
        limits: [
            {
                minE: 0,
                maxE: 50,
                faktorBKD: 0.5
            },
            {
                minE: 51,
                maxE: 200,
                faktorBKD: 1
            },
            {
                minE: 201,
                maxE: 1000,
                faktorBKD: 1.5
            }
        ]
    },
    {
        jenisAlat: [
            "TIMBANGAN_SENTISIMAL",
            "TIMBANGAN_PEGAS",
            "TIMBANGAN_BOBOT_INGSUT"
        ],
        kelas: "I",
        pengujian: ["KEPEKAAN"],
        limits: [
            {
                minE: 0,
                maxE: 50000,
                faktorBKD: 0.5
            },
            {
                minE: 50001,
                maxE: 200000,
                faktorBKD: 1
            },
            {
                minE: 200001,
                maxE: 1000000,
                faktorBKD: 1.5
            }
        ]
    },
];

