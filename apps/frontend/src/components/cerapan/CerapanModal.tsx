"use client";

import { useMemo, useState } from "react";
import { cerapanTemplates } from "@/lib/cerapan/templates";
import { CerapanSection } from "./CerapanSection";
import { CerapanIdentity } from "./CerapanIdentity";
import { mapInstrument } from "@/lib/cerapan/mapInstrument";
import { formatJenisAlat } from "@/lib/utils/formatText";

interface Props {
    open: boolean;
    onClose: () => void;
    instrument: any;
}

export function CerapanModal({
    open,
    onClose,
    instrument }: Props) {

    const [saving, setSaving] =
        useState(false);

    console.log("CERAPAN MODAL OPEN", open);
    console.log("INSTRUMENT MASUK", instrument);

    const mappedInstrument =
        instrument
            ?
            mapInstrument(instrument)
            :
            null;

    console.log(
        "DATA CERAPAN MAPPED:",
        mappedInstrument
    );

    const template =
        useMemo(() => {

            if (!mappedInstrument?.jenisAlat) {
                return undefined;
            }


            return cerapanTemplates[
                mappedInstrument.jenisAlat as keyof typeof cerapanTemplates
            ];

        }, [mappedInstrument]);



    if (!open || !mappedInstrument) {
        return null;
    }
    if (!template) {
        return (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
                <div className="bg-white rounded-lg p-6">
                    Template cerapan tidak ditemukan
                    <button className=" ml-4 px-3 py-1 border rounded " onClick={onClose}>
                        Tutup
                    </button>
                </div>
            </div>
        );
    }

    function handleSave() {
        setSaving(true);
        /*
            sementara

            nanti:
            POST API
            simpan hasil cerapan
        */
        setTimeout(() => {
            setSaving(false);
            onClose();
        }, 500);
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                {/* HEADER */}
                <div className="flex justify-between items-center border-b px-6 py-4">
                    <div>
                        <h2 className="font-bold text-lg">Cerapan Pengujian</h2>
                        <p className="text-sm text-slate-500">
                            {formatJenisAlat(instrument.instrumentJenisAlat)}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-red-600">✕</button>
                </div>
                {/* BODY */}
                <div className="p-6 space-y-6">


                    <CerapanIdentity
                        instrument={mappedInstrument}
                        application={instrument}
                    />


                    {
                        template.pemeriksaan.map(section => (
                            <CerapanSection
                                key={section.id}
                                section={section}
                                instrument={mappedInstrument}
                            />
                        ))
                    }

                    {/* II. PENGUJIAN */}
                    <div className="space-y-2">

                        <h3 className="font-semibold text-slate-900 text-base">
                            II. PENGUJIAN
                        </h3>
                        {
                            template.pengujian.map(section => (
                                <CerapanSection
                                    key={section.id}
                                    section={section}
                                    instrument={mappedInstrument}
                                />
                            ))
                        }
                    </div>

                </div>
                {/* FOOTER */}
                <div className="border-t px-6 py-4 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 border rounded-md">
                        Batal
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 bg-emerald-700 text-white rounded-md">
                        {
                            saving
                                ?
                                "Menyimpan..."
                                :
                                "Simpan Cerapan"
                        }
                    </button>
                </div>
            </div>
        </div>
    );

}