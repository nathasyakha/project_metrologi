"use client";

import { Fragment, useEffect, useState } from "react";
import type { CerapanSection, CerapanTemplate } from "@/lib/cerapan/types";
import { CerapanCell } from "./CerapanCell";
import { runCerapanHandler } from "@/handlers/registry";
import { evaluasiKesimpulan } from "@/lib/cerapan/calculator/evaluasiKesimpulan";

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

    if (
        rows.length === 0
    ) {
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
        section.columns?.length ?? 1;

    /*
     * ==========================================
     * RENDER
     * ==========================================
     */

    return (


        <div
            className="
                border
                rounded-lg
                overflow-hidden
                bg-white
            "
        >

            <table
                className="
                    w-full
                    text-sm
                    border-collapse
                "
            >

                {/* ================================= */}
                {/* HEADER */}
                {/* ================================= */}

                <thead
                    className="
                        bg-slate-100
                        border-b
                    "
                >

                    <tr>

                        {section.columns?.map(
                            (
                                column
                            ) => (

                                <th
                                    key={
                                        column.key
                                    }

                                    className={`
                                        px-3
                                        py-2.5
                                        text-left
                                        font-semibold
                                        text-slate-700 text-center

                                        ${getColumnWidthClass(
                                        column.key
                                    )}
                                    `}
                                >

                                    {
                                        column.label
                                    }

                                </th>

                            )
                        )}
                    </tr>


                </thead>


                {/* ================================= */}
                {/* BODY */}
                {/* ================================= */}

                <tbody
                    className="
                        divide-y
                        divide-slate-200
                    "
                >

                    {
                        rows.map(
                            (
                                row,
                                index
                            ) => (

                                <Fragment
                                    key={index}
                                >

                                    <tr>

                                        {
                                            section.columns?.map(
                                                (
                                                    column
                                                ) => (

                                                    <CerapanCell

                                                        key={
                                                            column.key
                                                        }

                                                        column={
                                                            column
                                                        }

                                                        row={
                                                            row
                                                        }

                                                        index={
                                                            index
                                                        }

                                                        section={
                                                            section
                                                        }

                                                        updateValue={
                                                            updateValue
                                                        }

                                                    />

                                                )
                                            )
                                        }

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