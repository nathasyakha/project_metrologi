"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { cerapanTemplates } from "@/lib/cerapan/templates";
import { CerapanSection } from "./CerapanSection";
import { CerapanIdentity } from "./CerapanIdentity";
import { mapInstrument } from "@/lib/cerapan/mapInstrument";
import { formatJenisAlat } from "@/lib/utils/formatText";
import { createApplicationResult } from "@/lib/peneraan";
import { evaluasiKesimpulan } from "@/lib/cerapan/calculator/global/evaluasiKesimpulan";
import Swal from "sweetalert2";
import { getErrorMessage } from "@/lib/api";

interface Props {
    open: boolean;
    onClose: () => void;
    instrument: any;
    onSuccess?: () => void;
}

export function CerapanModal({
    open,
    onClose,
    instrument,
    onSuccess
}: Props) {

    // Pusat penyimpanan sementara seluruh hasil cerapan
    const [observationData, setObservationData] =
        useState<Record<string, any[]>>({});

    // Mapping instrumen
    const mappedInstrument = useMemo(() => {
        if (!instrument) return null;

        return mapInstrument(instrument);
    }, [instrument]);

    // DEBUG IDENTITAS INSTRUMEN
    useEffect(() => {
        if (!instrument) return;

        console.log(
            "DATA INSTRUMENT LENGKAP:",
            instrument
        );

        console.log(
            "MAPPED INSTRUMENT:",
            mappedInstrument
        );
    }, [instrument, mappedInstrument]);
    // Template sesuai jenis alat
    const template = useMemo(() => {
        if (!mappedInstrument?.jenisAlat) {
            return undefined;
        }

        return cerapanTemplates[
            mappedInstrument.jenisAlat as keyof typeof cerapanTemplates
        ];
    }, [mappedInstrument?.jenisAlat]);

    // Menerima perubahan dari setiap section
    const handleSectionChange = useCallback(
        (sectionId: string, rows: any[]) => {
            setObservationData((prev) => ({
                ...prev,
                [sectionId]: rows
            }));
        },
        []
    );

    // Reset ketika modal dibuka untuk alat berbeda
    useEffect(() => {
        if (open && instrument) {
            setObservationData({});
        }
    }, [
        open,
        instrument?.applicationInstrumentId
    ]);

    // Simpan sementara untuk pemeriksaan Console
    const [saving, setSaving] = useState(false);
    console.log("DATA OBSERVATION:", observationData);

    async function handleSave() {
        if (saving) return;

        // Validasi identitas permohonan dan alat
        if (!instrument || !mappedInstrument || !template) {
            Swal.fire(
                "Data tidak lengkap",
                "Data instrumen atau template cerapan tidak ditemukan.",
                "error"
            );
            return;
        }

        // Validasi ID permohonan dan detail alat
        if (
            !instrument.id ||
            !instrument.applicationInstrumentId
        ) {
            Swal.fire(
                "Identitas alat tidak lengkap",
                "ID permohonan atau ID detail alat tidak ditemukan. Silakan muat ulang data.",
                "error"
            );
            return;
        }

        // Evaluasi hasil seluruh pengujian
        const kesimpulan = evaluasiKesimpulan(observationData);

        if (!kesimpulan) {
            Swal.fire(
                "Pengujian belum selesai",
                "Belum terdapat hasil pengujian yang cukup untuk menentukan kesimpulan.",
                "warning"
            );
            return;
        }

        // Susun seluruh data berdasarkan kelompoknya
        const payload = {
            identitas: {
                applicationId: instrument.id,
                applicationInstrumentId:
                    instrument.applicationInstrumentId,
                instrumentId: instrument.instrumentId,
                applicationNumber: instrument.applicationNumber,
                jenisAlat: mappedInstrument.jenisAlat,
                merek: mappedInstrument.merek,
                model: mappedInstrument.model,
                nomorSeri: mappedInstrument.nomorSeri,
                namaPemilik: mappedInstrument.namaPemilik,
                pegawaiBerhak: mappedInstrument.pegawaiBerhak,
                nip: mappedInstrument.nip,
                kelas: mappedInstrument.kelas,
                kapasitasMinimum: mappedInstrument.kapasitasMinimum,
                kapasitasMaksimum: mappedInstrument.kapasitasMaksimum,
                nilaiE: mappedInstrument.nilaiE,
                kapasitasUnit: mappedInstrument.kapasitasUnit,
                layanan: mappedInstrument.layanan,
            },

            pemeriksaan: Object.fromEntries(
                template!.pemeriksaan.map((section) => [
                    section.id,
                    observationData[section.id] ??
                    (section.type === "checklist" ? section.items ?? [] : [])
                ])
            ),

            pengujian: Object.fromEntries(
                template!.pengujian.map((section) => [
                    section.id,
                    observationData[section.id] ?? []
                ])
            ),

            kesimpulan,
        };
        console.log(
            "PAYLOAD REPEATABILITY SEBELUM SIMPAN:",
            JSON.stringify(
                payload.pengujian?.repeatability,
                null,
                2
            )
        );
        console.log(
            "PAYLOAD PEMERIKSAAN SEBELUM SIMPAN:",
            JSON.stringify(payload.pemeriksaan, null, 2)
        );

        console.log(
            "PAYLOAD VISUAL:",
            payload.pemeriksaan?.visual
        );

        setSaving(true);

        try {
            const result = await createApplicationResult(
                instrument.id,
                {
                    applicationInstrumentId:
                        instrument.applicationInstrumentId,
                    status: kesimpulan,
                    observationData: payload,
                }
            );

            await Swal.fire({
                title: "Cerapan Berhasil Disimpan",
                text:
                    kesimpulan === "SAH"
                        ? "Hasil pengujian memenuhi syarat."
                        : "Hasil pengujian tidak memenuhi syarat.",
                icon: kesimpulan === "SAH" ? "success" : "warning",
            });

            console.log("HASIL BACKEND:", result);

            onSuccess?.();
            onClose();

        } catch (error) {
            Swal.fire(
                "Gagal Menyimpan Cerapan",
                getErrorMessage(
                    error,
                    "Terjadi kesalahan saat menyimpan hasil pengujian."
                ),
                "error"
            );
        } finally {
            setSaving(false);
        }
    }

    if (!open || !mappedInstrument) {
        return null;
    }

    if (!template) {
        return (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
                <div className="bg-white rounded-lg p-6">
                    Template cerapan tidak ditemukan.

                    <button
                        className="ml-4 px-3 py-1 border rounded"
                        onClick={onClose}
                    >
                        Tutup
                    </button>
                </div>
            </div>
        );
    }
    console.log("DEBUG EVALUASI KESIMPULAN:");

    Object.entries(observationData).forEach(
        ([sectionId, rows]) => {
            console.log(`SECTION: ${sectionId}`);

            console.table(
                (rows ?? []).map((row: any) => ({
                    hasil: row.hasil,
                    hasilTambahan: row.hasilTambahan,
                    perluUjiTambahan: row.perluUjiTambahan,
                    checked: row.checked,
                    seluruhData: JSON.stringify(row)
                }))
            );
        }
    );
    const kesimpulanKeseluruhan =
        evaluasiKesimpulan(observationData);

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

            <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">

                {/* HEADER */}
                <div className="flex justify-between items-center border-b px-6 py-4">

                    <div>
                        <h2 className="font-bold text-lg">
                            Cerapan Pengujian
                        </h2>

                        <p className="text-sm text-slate-500">
                            {formatJenisAlat(instrument.instrumentJenisAlat)}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-red-600"
                    >
                        ✕
                    </button>

                </div>

                {/* BODY */}
                <div className="p-6 space-y-6">

                    {/* IDENTITAS ALAT */}
                    <CerapanIdentity
                        instrument={mappedInstrument}
                        application={instrument}
                    />

                    {/* I. PEMERIKSAAN */}
                    <div className="space-y-4">

                        <h3 className="font-semibold text-slate-900 text-base">
                            I. PEMERIKSAAN
                        </h3>

                        {template.pemeriksaan.map((section) => (
                            <CerapanSection
                                template={template}
                                key={section.id}
                                section={section}
                                instrument={mappedInstrument}
                                onChange={(rows) =>
                                    handleSectionChange(
                                        section.id,
                                        rows
                                    )
                                }
                            />
                        ))}

                    </div>

                    {/* II. PENGUJIAN */}
                    <div className="space-y-4">

                        <h3 className="font-semibold text-slate-900 text-base">
                            II. PENGUJIAN
                        </h3>

                        {template.pengujian.map((section) => (
                            <CerapanSection
                                template={template}
                                key={section.id}
                                section={section}
                                instrument={mappedInstrument}
                                onChange={(rows) =>
                                    handleSectionChange(
                                        section.id,
                                        rows
                                    )
                                }
                            />
                        ))}

                    </div>

                </div>

                {/* KESIMPULAN KESELURUHAN */}
                <div className="border rounded-lg p-5 bg-slate-50">

                    <h3 className="font-bold text-base mb-3">
                        III. KESIMPULAN PENGUJIAN
                    </h3>

                    {kesimpulanKeseluruhan === "SAH" && (
                        <div className="p-4 rounded-lg bg-green-100 text-green-800 font-bold">
                            HASIL PENGUJIAN: SAH
                        </div>
                    )}

                    {kesimpulanKeseluruhan === "BATAL" && (
                        <div className="p-4 rounded-lg bg-red-100 text-red-800 font-bold">
                            HASIL PENGUJIAN: BATAL
                        </div>
                    )}

                    {!kesimpulanKeseluruhan && (
                        <div className="p-4 rounded-lg bg-amber-100 text-amber-800">
                            Pengujian belum selesai. Belum terdapat hasil
                            pengujian yang cukup untuk menentukan kesimpulan.
                        </div>
                    )}

                </div>

                {/* FOOTER */}
                <div className="border-t px-6 py-4 flex justify-end gap-3">

                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded-md"
                    >
                        Batal
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 bg-emerald-700 text-white rounded-md disabled:opacity-50"
                    >
                        {saving ? "Menyimpan..." : "Simpan Cerapan"}
                    </button>

                </div>

            </div>
        </div>
    );
}
