"use client";

import { Fragment, useEffect, useState } from "react";
import type { CerapanSection } from "@/lib/cerapan/types";
import { hitungBKD } from "@/lib/cerapan/calculator/hitungBKD";
import { findBKDRule } from "@/lib/cerapan/rules/findBKDRules";
import { evaluasiKebenaran } from "@/lib/cerapan/calculator/evaluasiKebenaran";
import { CerapanCell } from "./CerapanCell";
import { CerapanRepeatTambahan } from "./repeatTambahan";
import { CerapanPenyetelanNolTambahan } from "./PenyetelanNolTambahan";
import { CerapanKebenaranTambahan } from "./KebenaranTambahan";
import { handleRepeatability } from "@/handlers/handleRepeatability";
import { handleRepeatabilityTambahan } from "@/handlers/handleRepeatabilityTambahan";
import { handlePenyetelanNol } from "@/handlers/handlePenyetelanNol";
import { handlePenyetelTara } from "@/handlers/handlePenyetelTara";

interface Props {
    section: CerapanSection;
    data: any[];
}

export function CerapanTable({
    section,
    data
}: Props) {
    const [
        rows,
        setRows
    ] = useState<any[]>(data);


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
     * EVALUASI UJI TAMBAHAN 0,5e
     * ==========================================
     *
     * Digunakan khusus apabila pengujian
     * kebenaran berada pada kondisi 1e
     * yang membutuhkan pengamatan tambahan.
     *
     * PLUS:
     * ATS + 1e
     *
     * setelah tambah 0,5e:
     * berubah -> BATAL
     * tetap   -> SAH
     *
     * MINUS:
     * ATS - 1e
     *
     * setelah tambah 0,5e:
     * berubah -> SAH
     * tetap   -> BATAL
     */

    function evaluasiUjiTambahan(
        row: any
    ) {

        /*
         * Input belum diisi
         */
        if (
            row.penunjukanSetelahImbuh === null ||
            row.penunjukanSetelahImbuh === undefined ||
            row.penunjukanSetelahImbuh === ""
        ) {
            row.hasil =
                null;
            return;
        }

        const penunjukanAwal =
            Number(
                row.penunjukan
            );
        const penunjukanSetelah =
            Number(
                row.penunjukanSetelahImbuh
            );

        if (
            !Number.isFinite(
                penunjukanAwal
            ) ||
            !Number.isFinite(
                penunjukanSetelah
            )
        ) {

            row.hasil =
                null;

            return;

        }


        /*
         * Apakah penunjukan berubah
         */
        const berubah =
            penunjukanSetelah !==
            penunjukanAwal;


        /*
         * ==========================================
         * ATS + 1e
         * ==========================================
         */

        if (
            row.arahUjiTambahan ===
            "PLUS"
        ) {

            row.pengamatan =
                berubah

                    ? "ATS + 1e → tambah 0,5e → penunjukan berubah"

                    : "ATS + 1e → tambah 0,5e → penunjukan tetap";


            row.hasil =
                berubah

                    ? "BATAL"

                    : "SAH";


            return;

        }


        /*
         * ==========================================
         * ATS - 1e
         * ==========================================
         */

        if (
            row.arahUjiTambahan ===
            "MINUS"
        ) {

            row.pengamatan =
                berubah

                    ? "ATS - 1e → tambah 0,5e → penunjukan berubah"

                    : "ATS - 1e → tambah 0,5e → penunjukan tetap";


            row.hasil =
                berubah

                    ? "SAH"

                    : "BATAL";


            return;

        }


        row.hasil =
            null;

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

        const updated =
            [...rows];


        updated[index] = {

            ...updated[index],

            [key]:
                value

        };

        handlePenyetelanNol({

            key,

            value,

            updated,

            index

        });
        let row =
            updated[index];
        /*
        ==========================================
        PENYETEL TARA
        ==========================================
        */
        handlePenyetelTara({

            key,

            updated,

            index

        });
        /*
        ==========================================
        REPEATABILITY
        ==========================================
        */

        handleRepeatability({
            key,
            updated
        });

        handleRepeatabilityTambahan({
            key,
            updated
        });

        /*
         * ==========================================
         * INPUT UJI TAMBAHAN 0,5e
         * ==========================================
         */

        if (
            (section.generator ===
                "KEBENARAN" ||
                section.generator ===
                "EKSENTRISITAS") &&

            key ===
            "penunjukanSetelahImbuh"
        ) {

            evaluasiUjiTambahan(
                updated[index]
            );


            setRows(
                updated
            );


            return;

        }


        /*
         * ==========================================
         * PENGUJIAN KEBENARAN
         * ==========================================
         */

        if (
            section.generator ===
            "KEBENARAN" ||
            section.generator ===
            "EKSENTRISITAS"
        ) {


            /*
             * ==========================================
             * 1. MUATAN UJI BERUBAH
             *
             * Hitung ulang BKD berdasarkan
             * muatan uji aktual.
             * ==========================================
             */

            if (
                key ===
                "muatanUji"
            ) {

                const muatanKosong =

                    row.muatanUji === null ||

                    row.muatanUji === undefined ||

                    row.muatanUji === "";


                if (
                    muatanKosong
                ) {

                    updated[index].bkd =
                        null;

                    updated[index].pengamatan =
                        null;

                    updated[index].hasil =
                        null;

                    updated[index].perluUjiTambahan =
                        false;

                    updated[index].arahUjiTambahan =
                        null;

                    updated[index].penunjukanSetelahImbuh =
                        null;

                }

                else {

                    const rule =
                        findBKDRule({

                            jenisAlat:
                                row.jenisAlat,

                            kelas:
                                row.kelas,

                            pengujian:
                                "KEBENARAN"

                        });


                    if (
                        rule
                    ) {

                        const bkdBaru =
                            hitungBKD({

                                rule,

                                titikUji:
                                    Number(
                                        row.muatanUji
                                    ),

                                nilaiE:
                                    Number(
                                        row.nilaiE
                                    ),

                                layanan:
                                    row.layanan

                            });


                        updated[index].bkd =
                            bkdBaru !== null

                                ? Number(
                                    bkdBaru.toFixed(3)
                                )

                                : null;

                    }

                    else {

                        updated[index].bkd =
                            null;

                    }


                    /*
                     * Muatan berubah:
                     * reset hasil evaluasi lama
                     */
                    updated[index].pengamatan =
                        null;

                    updated[index].hasil =
                        null;

                    updated[index].perluUjiTambahan =
                        false;

                    updated[index].arahUjiTambahan =
                        null;

                    updated[index].penunjukanSetelahImbuh =
                        null;

                }

            }


            /*
             * ==========================================
             * 2. AMBIL ROW TERBARU
             * ==========================================
             */

            row =
                updated[index];


            /*
             * ==========================================
             * 3. CEK DATA
             * ==========================================
             */

            const muatanKosong =

                row.muatanUji === null ||

                row.muatanUji === undefined ||

                row.muatanUji === "";


            const penunjukanKosong =

                row.penunjukan === null ||

                row.penunjukan === undefined ||

                row.penunjukan === "";


            const bkdKosong =

                row.bkd === null ||

                row.bkd === undefined ||

                row.bkd === "";


            /*
             * ==========================================
             * DATA BELUM LENGKAP
             * ==========================================
             */

            if (
                muatanKosong ||
                penunjukanKosong ||
                bkdKosong
            ) {

                updated[index].pengamatan =
                    null;

                updated[index].hasil =
                    null;

                updated[index].perluUjiTambahan =
                    false;

                updated[index].arahUjiTambahan =
                    null;

                updated[index].penunjukanSetelahImbuh =
                    null;

            }

            else {

                /*
                 * ==========================================
                 * 4. KONVERSI NUMBER
                 * ==========================================
                 */

                const muatanUji =
                    Number(
                        row.muatanUji
                    );


                const penunjukan =
                    Number(
                        row.penunjukan
                    );


                const nilaiE =
                    Number(
                        row.nilaiE
                    );


                const bkd =
                    Number(
                        row.bkd
                    );


                const dataValid =

                    Number.isFinite(
                        muatanUji
                    ) &&

                    Number.isFinite(
                        penunjukan
                    ) &&

                    Number.isFinite(
                        nilaiE
                    ) &&

                    nilaiE > 0 &&

                    Number.isFinite(
                        bkd
                    );


                /*
                 * ==========================================
                 * 5. EVALUASI KEBENARAN
                 * ==========================================
                 */

                if (
                    dataValid
                ) {

                    const evaluasi =
                        evaluasiKebenaran({

                            muatanUji,

                            penunjukan,

                            nilaiE,

                            bkd,

                            layanan:
                                row.layanan

                        });


                    updated[index].pengamatan =
                        evaluasi.pengamatan;


                    updated[index].hasil =
                        evaluasi.hasil;


                    updated[index].perluUjiTambahan =
                        evaluasi.perluUjiTambahan;
                    updated[index].arahUjiTambahan =
                        evaluasi.arahUjiTambahan;


                    /*
                     * ==========================================
                     * 6. KONDISI 1e
                     * ==========================================
                     */

                    if (
                        evaluasi.perluUjiTambahan
                    ) {

                        /*
                         * ATS + 1e
                         */
                        if (
                            penunjukan >
                            muatanUji
                        ) {

                            updated[index].arahUjiTambahan =
                                "PLUS";

                        }


                        /*
                         * ATS - 1e
                         */
                        else if (
                            penunjukan <
                            muatanUji
                        ) {

                            updated[index].arahUjiTambahan =
                                "MINUS";

                        }


                        /*
                         * Reset input tambahan jika
                         * penunjukan / muatan berubah.
                         */
                        if (
                            key === "penunjukan" ||
                            key === "muatanUji"
                        ) {

                            updated[index].penunjukanSetelahImbuh =
                                null;

                        }

                    }

                    else {

                        updated[index].arahUjiTambahan =
                            null;

                        updated[index].penunjukanSetelahImbuh =
                            null;

                    }

                }

                else {

                    updated[index].pengamatan =
                        null;

                    updated[index].hasil =
                        null;

                    updated[index].perluUjiTambahan =
                        false;

                    updated[index].arahUjiTambahan =
                        null;

                    updated[index].penunjukanSetelahImbuh =
                        null;

                }

            }

        }


        setRows(
            updated
        );

    }


    /*
     * ==========================================
     * READONLY VALUE
     * ==========================================
     */

    function renderReadonlyValue(
        value: any
    ) {

        if (
            value === null ||
            value === undefined ||
            value === "" ||
            Number.isNaN(value)
        ) {

            return "";

        }


        return value;

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

                                    <CerapanKebenaranTambahan

                                        section={section}

                                        row={row}

                                        index={index}

                                        jumlahKolom={
                                            section.columns?.length ?? 1
                                        }

                                        updateValue={updateValue}

                                    />


                                    {/* ================================= */}
                                    {/* UI PENYETELAN NOL LANJUTAN */}
                                    {/* ================================= */}

                                    <CerapanPenyetelanNolTambahan

                                        section={
                                            section
                                        }

                                        row={
                                            row
                                        }

                                        index={
                                            index
                                        }

                                        jumlahKolom={
                                            jumlahKolom
                                        }

                                        updateValue={
                                            updateValue
                                        }

                                    />

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
                rows[rows.length - 1]?.tampilTambahan &&
                (
                    <CerapanRepeatTambahan
                        rows={rows}
                        updateValue={updateValue}
                    />
                )
            }

        </div>

    );

}