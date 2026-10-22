"use client";

import { Fragment, useEffect, useState } from "react";
import type { CerapanSection, CerapanTemplate } from "@/lib/cerapan/types";
import { CerapanCell } from "./CerapanCell";
import { runCerapanHandler } from "@/handlers/registry";
import { evaluasiKesimpulan } from "@/lib/cerapan/calculator/global/evaluasiKesimpulan";
import { Trash2 } from "lucide-react";

interface Props {
    template: CerapanTemplate;
    section: CerapanSection;
    data: any[];
}

export function CerapanTable({
    template,
    section,
    data
}: Props) {
    const [
        rows,
        setRows
    ] = useState<any[]>(data);

    const kesimpulan =
        evaluasiKesimpulan(rows);

    /*
     * ==========================================
     * SINKRONISASI DATA GENERATOR
     * ==========================================
     */

    useEffect(() => {
        setRows(data);
    }, [data]);

    if (rows.length === 0) {
        return null;
    }

    /*
     * ==========================================
     * UPDATE VALUE
     * ==========================================
     */

    function updateValue(
        index: number,
        key: string,
        value: any
    ) {
        console.log(
            "INPUT CHANGE",
            key,
            value
        );
        const updated = [...rows];
        updated[index] = {
            ...updated[index],
            [key]: value
        };

        const handled =
            runCerapanHandler({
                template,
                section,
                key,
                value,
                updated,
                index
            });

        if (handled) {
            setRows(updated);
            return;
        }

        setRows(updated);
    }


    const isKebenaranJembatan = section.generator === "KEBENARAN_JEMBATAN";

    function tambahBaris() {
        if (!isKebenaranJembatan) return;

        const identitas = rows[0] ?? {};

        const barisBaru = {
            nomor: rows.length + 1,
            standar: null,
            ballast: null,
            standarBallast: null,
            penunjukan: null,
            imbuh: null,
            penunjukanSebenarnya: null,
            kesalahan: null,
            bkd: null,
            hasil: null,

            // Pertahankan identitas alat.
            jenisAlat: identitas.jenisAlat,
            kelas: identitas.kelas,
            kapasitasMaksimum: identitas.kapasitasMaksimum,
            nilaiE: identitas.nilaiE,
            layanan: identitas.layanan
        };

        setRows((prev) => [
            ...prev,
            barisBaru
        ]);
    }

    function hapusBaris(index: number) {
        if (!isKebenaranJembatan) return;

        setRows((prev) =>
            prev
                .filter((_, i) => i !== index)
                .map((row, i) => ({
                    ...row,
                    nomor: i + 1
                }))
        );
    }

    /*
     * ==========================================
     * COLUMN WIDTH
     * ==========================================
     */

    function getColumnWidthClass(
        key: string
    ) {

        switch (
        key
        ) {
            case "nomor":
                return "w-14 text-center";
            case "posisiUji":
                return "w-14 text-center";
            case "pengamatan025e":
                return "w-14"
            case "pengamatan05e":
                return "w-14"
            case "bkd":
                return "w-28";
            case "hasil":
                return "w-28";
            case "pengamatan":
                return "w-60";
            default:
                return "w-auto";
        }
    }
    const jumlahKolom =
        (section.columns?.length ?? 1) +
        (isKebenaranJembatan ? 1 : 0);

    /*
     * ==========================================
     * RENDER
     * ==========================================
     */

    return (
        <div className="border rounded-lg overflow-hidden bg-white">
            {isKebenaranJembatan && (
                <div className="flex justify-end p-3 border-b">
                    <button
                        type="button"
                        onClick={tambahBaris}
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        + Tambah Baris
                    </button>
                </div>
            )}

            <table className="w-full text-sm border-collapse">

                {/* ================================= */}
                {/* HEADER */}
                {/* ================================= */}

                <thead className="bg-slate-100 border-b">
                    <tr>
                        {section.columns?.map(
                            (column) => (
                                <th key={column.key} className={`px-3 py-2.5 text-left font-semibold text-slate-700 text-center
                                 ${getColumnWidthClass(column.key)}`}>
                                    {column.label}
                                </th>
                            )
                        )}
                        {isKebenaranJembatan && (
                            <th className="px-3 py-2.5 text-center font-semibold text-slate-700">
                                Aksi
                            </th>
                        )}
                    </tr>
                </thead>


                {/* ================================= */}
                {/* BODY */}
                {/* ================================= */}

                <tbody className="divide-y divide-slate-200">
                    {rows.map(
                        (
                            row,
                            index
                        ) => (
                            <Fragment key={index}>
                                <tr>
                                    {section.columns?.map(
                                        (column) => (
                                            <CerapanCell
                                                key={column.key}
                                                column={column}
                                                row={row}
                                                index={index}
                                                section={section}
                                                updateValue={updateValue}
                                            />
                                        )
                                    )}

                                    {isKebenaranJembatan && (
                                        <td className="px-3 py-2 text-center">
                                            <button
                                                type="button"
                                                onClick={() => hapusBaris(index)}
                                                disabled={rows.length <= 1}
                                                className="rounded-md border border-red-300 p-1 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40">
                                                <Trash2 size={20} />
                                            </button>
                                        </td>
                                    )}

                                </tr>

                                {/* ======================================= */}
                                {/* UI KEBENARAN DAN EKSENTRISITAS TAMBAHAN */}
                                {/* ======================================= */}
                                {
                                    section.additionalComponent &&
                                    (() => {

                                        const AdditionalComponent =
                                            section.additionalComponent;


                                        return (

                                            <AdditionalComponent

                                                section={section}

                                                row={row}

                                                index={index}

                                                jumlahKolom={jumlahKolom}

                                                updateValue={updateValue}

                                            />

                                        );


                                    })()
                                }


                            </Fragment>

                        )
                    )}

                </tbody>

            </table>
            {/* ================================= */}
            {/* SUMMARY RESULT */}
            {/* ================================= */}

            {
                section.summaryRows &&
                section.summaryRows.length > 0 &&
                (
                    <div className="mt-3 border rounded-lg overflow-hidden">

                        {
                            section.summaryRows.map(
                                (item) => (

                                    <div
                                        key={item.key}
                                        className="
                                            flex
                                            border-b
                                            last:border-b-0
                                            text-sm
                                        "
                                    >

                                        <div
                                            className="
                                                w-1/2
                                                px-3
                                                py-2
                                                bg-slate-100
                                                font-semibold
                                            "
                                        >
                                            {item.label}
                                        </div>


                                        <div
                                            className={`
        w-1/2
        px-3
        py-2
        text-center

        ${item.key === "hasil" &&
                                                    rows[rows.length - 1]?.[item.key] === "SAH"

                                                    ?

                                                    "text-green-600 font-semibold"

                                                    :

                                                    ""
                                                }

        ${item.key === "hasil" &&
                                                    rows[rows.length - 1]?.[item.key] === "BATAL"

                                                    ?

                                                    "text-red-600 font-semibold"

                                                    :

                                                    ""
                                                }
    `}
                                        >
                                            {
                                                rows[rows.length - 1]?.[
                                                item.key
                                                ] ?? "-"
                                            }
                                        </div>


                                    </div>

                                )
                            )
                        }

                    </div>
                )
            }

            {
                section.summaryComponent &&
                rows.some(
                    row => row.tampilTambahan === true
                ) &&
                (() => {

                    const SummaryComponent =
                        section.summaryComponent;


                    return (
                        <SummaryComponent
                            rows={rows}
                            updateValue={updateValue}
                            section={section}
                        />
                    );

                })()
            }

            <div className="
    mt-4
    border
    rounded-lg
    overflow-hidden
">


                <div className="
        flex
        text-sm
    ">


                    <div className="
            w-1/2
            px-3
            py-2
            bg-slate-100
            font-semibold
        ">
                        Kesimpulan
                    </div>


                    <div
                        className={`
                w-1/2
                px-3
                py-2
                text-center
                font-semibold

                ${kesimpulan === "SAH"
                                ?
                                "text-green-600"
                                :
                                "text-red-600"
                            }
            `}
                    >

                        {kesimpulan}

                    </div>


                </div>


            </div>
        </div>

    );

}