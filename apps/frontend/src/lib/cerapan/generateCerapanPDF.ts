import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { TestObservation } from "@/lib/peneraan";

type Observation = TestObservation;

const fmt = (value: any, suffix = "") => {
    if (value === null || value === undefined || value === "") {
        return "-";
    }

    if (typeof value === "number") {
        return value.toLocaleString("id-ID") + suffix;
    }

    return String(value) + suffix;
};

const resultColor = (value: string) => {
    return value === "SAH" ? [0, 110, 65] :
        value === "BATAL" ? [190, 30, 30] :
            [50, 50, 50];
};

async function imageUrlToDataUrl(url: string): Promise<string> {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Gagal memuat gambar: ${url}`);
    }

    const blob = await response.blob();

    return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();

        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;

        reader.readAsDataURL(blob);
    });
}

export async function generateCerapanPDF(observation: Observation) {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
    });
    const data = observation.observationData;
    console.log(
        "STRUKTUR OBSERVATION DATA:",
        JSON.stringify(data, null, 2)
    );
    const [logoPemkot, watermarkMetrologi] = await Promise.all([
        imageUrlToDataUrl("/images/logo-pemkot-banjar.png"),
        imageUrlToDataUrl("/images/watermark-metrologi-legal.png"),
    ]);

    if (
        !data ||
        !data.identitas ||
        !data.pengujian ||
        !data.kesimpulan
    ) {
        throw new Error(
            "Struktur data cerapan tidak lengkap"
        );
    }
    const identitas = observation.observationData.identitas;
    const pengujian = observation.observationData.pengujian;
    const pemeriksaan = observation.observationData.pemeriksaan;
    console.log(
        "DEBUG DATA MASUK GENERATE PDF:",
        JSON.stringify(
            pengujian.repeatability,
            null,
            2
        )
    );
    let currentY = 51;

    drawWatermark();

    doc.internal.events.subscribe(
        "addPage",
        (event: { pageNumber: number }) => {
            const currentPage = doc.getCurrentPageInfo().pageNumber;

            doc.setPage(event.pageNumber);
            drawWatermark();
            doc.setPage(currentPage);
        }
    );

    const margin = {
        top: 51,
        bottom: 15,
        left: 14,
        right: 14
    };

    // =========================
    // WATERMARK BACKGROUND
    // =========================

    function drawWatermark() {
        doc.saveGraphicsState();

        doc.setGState(
            new (doc as any).GState({
                opacity: 0.04
            })
        );

        doc.addImage(
            watermarkMetrologi,
            "PNG",
            57.5,
            101,
            95,
            95
        );

        doc.restoreGraphicsState();
    }


    // =========================
    // KOP SURAT RESMI
    // =========================

    function drawHeader() {
        // Logo Pemerintah Kota Banjar
        doc.addImage(
            logoPemkot,
            "PNG",
            14,
            7,
            23,
            23
        );

        // Identitas instansi
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);

        doc.text("PEMERINTAH KOTA BANJAR", 96, 11, {
            align: "center"
        });

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);

        doc.text(
            "DINAS KOPERASI USAHA KECIL MENENGAH",
            96,
            16,
            { align: "center" }
        );

        doc.text(
            "DAN PERDAGANGAN",
            96,
            20,
            { align: "center" }
        );

        doc.setFontSize(9);

        doc.text(
            "UPTD METROLOGI LEGAL",
            96,
            25,
            { align: "center" }
        );

        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.5);

        doc.text(
            "JL. Brigjen M. Isa, SH Komplek Perkantoran Purwaharja,",
            96,
            29,
            { align: "center" }
        );

        doc.text(
            "Telp/Fax (0265) 745272 Banjar",
            96,
            32,
            { align: "center" }
        );

        // Informasi dokumen sebelah kanan
        const metadata = [
            ["Kode", "C-UPTDMET-07"],
            ["Revisi", "01"],
            ["Tanggal", "04-08-2026"],
            ["Bagian", "5.1"]
        ];

        doc.setFontSize(7);

        metadata.forEach((item, index) => {
            const y = 10 + index * 5;

            doc.text(item[0], 158, y);
            doc.text(":", 174, y);
            doc.text(item[1], 177, y);
        });

        // Judul dokumen
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);

        doc.text(
            "CERAPAN : C. TE",
            105,
            38,
            { align: "center" }
        );

        doc.text(
            "JUDUL BAGIAN : TIMBANGAN ELEKTRONIK",
            105,
            42,
            { align: "center" }
        );

        // Garis pembatas kop surat
        doc.setLineWidth(0.7);
        doc.line(14, 45, 196, 45);
    }


    // =========================
    // JUDUL
    // =========================

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);

    doc.text(
        "CERAPAN PENGUJIAN TIMBANGAN ELEKTRONIK",
        105,
        currentY,
        { align: "center" }
    );

    currentY += 10;

    // =========================
    // INFORMASI LAYANAN
    // =========================

    doc.setFontSize(9);

    autoTable(doc, {
        startY: currentY,
        head: [],
        body: [
            ["Pengujian untuk", ":", identitas.layanan === "TERA"
                ? "Tera"
                : "Tera Ulang"]
        ],
        theme: "plain",
        styles: {
            fontSize: 9,
            cellPadding: 1.5
        },
        columnStyles: {
            0: { cellWidth: 45 },
            1: { cellWidth: 5 },
            2: { cellWidth: 100 }
        },
        margin
    });

    currentY = (doc as any).lastAutoTable.finalY + 3;

    // =========================
    // IDENTITAS
    // =========================

    doc.setFont("helvetica", "bold");
    doc.text("I. PEMERIKSAAN", 14, currentY);

    currentY += 3;

    autoTable(doc, {
        startY: currentY,
        head: [],
        body: [
            ["Pemilik", ":", fmt(identitas.namaPemilik)],
            ["Tanggal Pengujian", ":", new Date(
                observation.testedAt
            ).toLocaleDateString("id-ID")],
            ["Pegawai Berhak", ":", fmt(identitas.pegawaiBerhak)],
            ["Kelas Keakurasian", ":", fmt(identitas.kelas)],
            ["Kapasitas Maksimum (Max)", ":", fmt(
                identitas.kapasitasMaksimum, " g"
            )],
            ["Kapasitas Minimum (Min)", ":", fmt(
                identitas.kapasitasMinimum, " g"
            )],
            ["Interval skala verifikasi (e)", ":", fmt(
                identitas.nilaiE, " g"
            )],
            ["Merek, Type, No. Seri", ":", [
                identitas.merek,
                identitas.model,
                identitas.nomorSeri
            ].filter(Boolean).join(" / ")]
        ],
        theme: "grid",
        styles: {
            fontSize: 8,
            cellPadding: 2
        },
        columnStyles: {
            0: { cellWidth: 55 },
            1: { cellWidth: 5 },
            2: { cellWidth: 90 }
        },
        margin
    });

    currentY = (doc as any).lastAutoTable.finalY + 5;

    // =========================
    // PEMERIKSAAN VISUAL
    // =========================

    doc.setFont("helvetica", "bold");
    doc.text("Pemeriksaan Visual", 14, currentY);

    currentY += 2;

    console.log("DEBUG PEMERIKSAAN:", pemeriksaan);
    console.log("DEBUG VISUAL:", pemeriksaan?.visual);

    const visual = pemeriksaan?.visual ?? [];

    console.log("JUMLAH DATA VISUAL:", visual.length);

    autoTable(doc, {
        startY: currentY,
        head: [[
            "No.",
            "Uraian",
            "Ya/Ada",
            "Tidak/Tidak Ada",
            "Keterangan"
        ]],
        body: visual.map((row: any, index: number) => [
            index + 1,
            fmt(row.parameter),
            row.kondisi === "YA" || row.kondisi === "ADA" ? "CHECK" : "-",
            row.kondisi === "TIDAK" || row.kondisi === "TIDAK ADA" ? "CHECK" : "-",
            fmt(row.keterangan)
        ]),
        theme: "grid",

        styles: {
            fontSize: 7.5,
            cellPadding: 2,
            valign: "middle",
            lineWidth: 0.15,
            overflow: "linebreak"
        },

        headStyles: {
            fillColor: [235, 235, 235],
            textColor: [30, 30, 30],
            fontStyle: "bold",
            halign: "center"
        },
        didParseCell(data) {
            if (
                data.section === "body" &&
                (data.column.index === 2 || data.column.index === 3) &&
                data.cell.raw === "CHECK"
            ) {
                data.cell.text = [""];
                data.cell.styles.halign = "center";
                data.cell.styles.valign = "middle";
            }
        },

        didDrawCell(data) {
            if (
                data.section === "body" &&
                (data.column.index === 2 || data.column.index === 3) &&
                data.cell.raw === "CHECK"
            ) {
                const x = data.cell.x + data.cell.width / 2;
                const y = data.cell.y + data.cell.height / 2;

                doc.setDrawColor(0, 0, 0);
                doc.setLineWidth(0.35);

                // Garis pertama
                doc.line(
                    x - 1.5,
                    y,
                    x - 0.4,
                    y + 1
                );

                // Garis kedua
                doc.line(
                    x - 0.4,
                    y + 1,
                    x + 1.6,
                    y - 1.2
                );

                doc.setLineWidth(0.15);
            }
        },
        margin
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;

    // =========================
    // II. PENGUJIAN
    // =========================

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("II. PENGUJIAN", 14, currentY);

    currentY += 5;

    function sectionTitle(title: string) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text(title, 14, currentY);
        currentY += 2;
    }

    function drawTable(
        head: string[][],
        body: any[][],
        widths?: number[]
    ) {
        autoTable(doc, {
            startY: currentY,
            head,
            body,

            rowPageBreak: "avoid",
            pageBreak: "auto",

            styles: {
                fontSize: 7.5,
                cellPadding: 2,
                valign: "middle",
                lineWidth: 0.15,
                overflow: "linebreak"
            },

            theme: "grid",
            headStyles: {
                fillColor: [235, 235, 235],
                textColor: [30, 30, 30],
                fontStyle: "bold",
                halign: "center"
            },
            columnStyles: widths
                ? Object.fromEntries(
                    widths.map((width, index) => [
                        index,
                        { cellWidth: width }
                    ])
                )
                : {},
            margin,
            didParseCell(data) {
                if (
                    data.section === "body" &&
                    data.column.index === data.table.columns.length - 1
                ) {
                    const value = String(data.cell.raw ?? "");
                    if (value === "SAH" || value === "BATAL") {
                        data.cell.styles.textColor = resultColor(value) as any;
                        data.cell.styles.fontStyle = "bold";
                    }
                }
            }
        });

        currentY = (doc as any).lastAutoTable.finalY + 5;
    }

    // =========================
    // A. KEBENARAN
    // =========================

    sectionTitle(
        "A. Pengujian Kebenaran"
    );

    const kebenaran = pengujian.kebenaran ?? [];

    drawTable(
        [[
            "Muatan (g)",
            "Penunjukan (g)",
            "BKD (g)",
            "Pengamatan",
            "Hasil"
        ]],
        [
            ...kebenaran.map((row: any) => [
                fmt(row.muatanUji),
                fmt(row.penunjukan),
                fmt(row.bkd),
                fmt(row.pengamatan),
                fmt(row.hasil)
            ]),
            [
                {
                    content: "Kesimpulan",
                    colSpan: 4,
                    styles: {
                        halign: "left",
                        fontStyle: "bold",
                    }
                },
                {
                    content: fmt(
                        kebenaran.length > 0 &&
                            kebenaran.every(
                                (row: any) => row.hasil === "SAH"
                            )
                            ? "SAH"
                            : "BATAL"
                    ),
                    styles: {
                        fontStyle: "bold",
                        textColor: [0, 110, 65]
                    }
                }
            ]
        ]
    );

    // =========================
    // B. EKSENTRISITAS
    // =========================

    sectionTitle("B. Pengujian Eksentrisitas");

    const eksentrisitas = pengujian.eksentrisitas ?? [];

    drawTable(
        [[
            "Posisi Uji",
            "Muatan (g)",
            "Penunjukan (g)",
            "BKD (g)",
            "Pengamatan",
            "Hasil"
        ]],
        [
            ...eksentrisitas.map((row: any) => [
                fmt(row.posisiUji),
                fmt(row.muatanUji),
                fmt(row.penunjukan),
                fmt(row.bkd),
                fmt(row.pengamatan),
                fmt(row.hasil)
            ]),
            [
                {
                    content: "Kesimpulan",
                    colSpan: 5,
                    styles: {
                        halign: "left",
                        fontStyle: "bold"
                    }
                },
                {
                    content: fmt(
                        eksentrisitas.length > 0 &&
                            eksentrisitas.every(
                                (row: any) => row.hasil === "SAH"
                            )
                            ? "SAH"
                            : "BATAL"
                    ),
                    styles: {
                        fontStyle: "bold",
                        textColor: [0, 110, 65]
                    }
                }
            ]
        ]
    );

    // =========================
    // C. PENYETELAN NOL
    // =========================

    const nol = pengujian.penyetelan_nol ?? [];

    if (nol.length > 0) {
        if (currentY + 65 > 270) {
            doc.addPage();
            currentY = 51;
        }
        sectionTitle("C. Pengujian Penyetelan Nol");

        drawTable(
            [[
                "Jenis Penyetel Nol",
                "Penunjukan 10e",
                "Penunjukan 0,25e",
                "Penunjukan 0,5e",
                "Kesimpulan"
            ]],
            nol.map((row: any) => [
                fmt(row.jenisPenyetelNol),
                fmt(
                    row.jenisPenyetelNol === "Otomatis"
                        ? row.penunjukanOtomatis10e
                        : row.penunjukanSM10e
                ),
                fmt(
                    row.jenisPenyetelNol === "Otomatis"
                        ? row.penunjukanOtomatis025e
                        : row.penunjukanSM025e
                ),
                fmt(
                    row.jenisPenyetelNol === "Otomatis"
                        ? row.penunjukanOtomatis05e
                        : row.penunjukanSM05e
                ),
                fmt(row.hasil)
            ])
        );
    }

    // =========================
    // D. PENYETEL TARA
    // =========================

    const tara = pengujian.penyetel_tara ?? [];

    if (identitas.layanan === "TERA" && tara.length > 0) {
        sectionTitle("D. Pengujian Tara");

        drawTable(
            [[
                "ATS 20% Max",
                "Tekan Tara",
                "Penunjukan 10e",
                "Penunjukan 0,25e",
                "Penunjukan 0,5e",
                "Kesimpulan"
            ]],
            tara.map((row: any) => [
                fmt(row.langkah),
                fmt(row.tekanTara),
                fmt(row.penunjukan10e),
                fmt(row.penunjukan025e),
                fmt(row.penunjukan05e),
                fmt(row.hasil)
            ])
        );
    }

    // =========================
    // E. REPEATABILITY
    // =========================

    const repeatability = pengujian.repeatability ?? [];
    console.log(
        "DEBUG BKD SIAP CETAK:",
        repeatability.map((row: any) => row.bkd)
    );
    if (repeatability.length > 0) {

        // Pastikan judul dan tabel tidak terpisah halaman.
        // Sisakan ruang untuk judul, header, dan seluruh baris.
        if (currentY + 65 > 270) {
            doc.addPage();
            currentY = 51;
        }

        sectionTitle(
            "E. Pengujian Kemampuan Ulang (Repeatability)"
        );

        const repeatValue = [...repeatability]
            .reverse()
            .find((row: any) =>
                row.repeat !== null &&
                row.repeat !== undefined &&
                row.repeat !== ""
            );

        const bkdValue = [...repeatability]
            .reverse()
            .find((row: any) =>
                row.bkd !== null &&
                row.bkd !== undefined &&
                row.bkd !== ""
            );

        const hasilValue = [...repeatability]
            .reverse()
            .find((row: any) =>
                row.hasil !== null &&
                row.hasil !== undefined &&
                row.hasil !== ""
            );

        console.log(
            "DEBUG PDF REPEATABILITY:",
            repeatability.map((row: any) => ({
                muatanUji: row.muatanUji,
                repeat: row.repeat,
                bkd: row.bkd,
                hasil: row.hasil
            }))
        );
        drawTable(
            [[
                "No.",
                "Muatan (g)",
                "Penunjukan (g)",
                "Pengamatan",
                "Penunjukan Setelah Imbuh (g)",
            ]],
            [
                ...repeatability.map((row: any, index: number) => [
                    index + 1,
                    fmt(row.muatanUji),
                    fmt(row.penunjukan2),
                    String(row.pengamatan05e ?? "").replace(
                        /\s*→\s*/g,
                        "; "
                    ),
                    fmt(row.penunjukanSetelahImbuh),
                ]),
                [
                    {
                        content: "Repeat (g)",
                        colSpan: 4,
                        styles: {
                            halign: "left",
                            fontStyle: "bold",
                        }
                    },
                    {
                        content: fmt(repeatValue?.repeat),
                        styles: {
                            fontStyle: "bold",
                        }
                    }
                ],
                [
                    {
                        content: "BKD (g)",
                        colSpan: 4,
                        styles: {
                            halign: "left",
                            fontStyle: "bold",
                        }
                    },
                    {
                        content: fmt(bkdValue?.bkd),
                        styles: {
                            fontStyle: "bold",
                        }
                    }
                ],
                [
                    {
                        content: "Hasil",
                        colSpan: 4,
                        styles: {
                            halign: "left",
                            fontStyle: "bold",
                        }
                    },
                    {
                        content: fmt(hasilValue?.hasil),
                        styles: {
                            fontStyle: "bold",
                            textColor: [0, 110, 65],
                        }
                    }
                ]
            ]
        );


        const tambahan = repeatability.find(
            (row: any) => row.hasilTambahan
        );

        if (tambahan) {
            sectionTitle("Pengujian Repeatability Tambahan");

            drawTable(
                [[
                    "Penunjukan 1",
                    "Penunjukan 2",
                    "Penunjukan 3",
                    "Repeat Tambahan",
                    "Kesimpulan"
                ]],
                [[
                    fmt(tambahan.penunjukanSebenarnya1),
                    fmt(tambahan.penunjukanSebenarnya2),
                    fmt(tambahan.penunjukanSebenarnya3),
                    fmt(tambahan.repeatTambahan),
                    fmt(tambahan.hasilTambahan)
                ]]
            );
        }
    }

    // =========================
    // KESIMPULAN
    // =========================

    if (currentY > 245) {
        doc.addPage();
        currentY = 51;
    }

    currentY += 3;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("KESIMPULAN PENGUJIAN", 14, currentY);

    currentY += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    const status = observation.observationData.kesimpulan;

    const conclusion = status === "SAH"
        ? "Berdasarkan hasil pemeriksaan dan pengujian terhadap Timbangan Elektronik, diperoleh hasil SAH. Dengan demikian, Timbangan Elektronik tersebut dinyatakan SAH."
        : status === "BATAL"
            ? "Berdasarkan hasil pemeriksaan dan pengujian terhadap Timbangan Elektronik, diperoleh hasil BATAL. Dengan demikian, Timbangan Elektronik tersebut dinyatakan BATAL."
            : "Kesimpulan pengujian belum tersedia.";

    const lines = doc.splitTextToSize(conclusion, 180);

    doc.text(lines, 14, currentY);

    currentY += lines.length * 5 + 12;

    doc.setFont("helvetica", "normal");
    doc.text("Pegawai Berhak,", 145, currentY, {
        align: "center"
    });

    currentY += 25;

    doc.setFont("helvetica", "bold");
    doc.text(
        fmt(identitas.pegawaiBerhak),
        145,
        currentY,
        { align: "center" }
    );

    doc.setFont("helvetica", "normal");
    doc.text(
        `NIP. ${fmt(identitas.nip)}`,
        145,
        currentY + 5,
        { align: "center" }
    );

    // =========================
    // NOMOR HALAMAN
    // =========================

    const totalPages = doc.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);

        drawHeader()

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");

        doc.text(
            `Halaman ${i} dari ${totalPages}`,
            196,
            287,
            { align: "right" }
        );
    }

    const nomor = identitas.applicationNumber ?? observation.id;

    doc.save(`Cerapan-${nomor}.pdf`);
}
