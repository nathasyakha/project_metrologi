interface Props {

    section: any;

    row: any;

    index: number;

    jumlahKolom: number;

    updateValue:
    (
        index: number,
        key: string,
        value: any
    ) => void;

}


export function CerapanPenyetelanNolTambahan({

    section,

    row,

    index,

    jumlahKolom,

    updateValue

}: Props) {


    return (

        <>
            {/* ================================= */}
            {/* UI PENYETELAN NOL LANJUTAN */}
            {/* ================================= */}

            {
                section.generator === "PENYETELAN_NOL" &&
                row.jenisPenyetelNol === "Otomatis" && (

                    <tr>

                        <td colSpan={jumlahKolom}>


                            <table className="w-full border-collapse border text-sm table-fixed">

                                <thead className="bg-slate-100">

                                    <tr >
                                        <th className="border px-3 py-2 w-[12%]">
                                            ATS Sekitar 2% Max (g)
                                        </th>
                                        <th className="border px-3 py-2 w-[12%]">
                                            Penyetel Bekerja
                                        </th>
                                        <th className="border px-3 py-2 w-[15%]">
                                            + imbuh 10e (g)
                                        </th>

                                        <th className="border px-3 py-2 w-[15%]">
                                            Penunjukan (g)
                                        </th>

                                        <th className="border px-3 py-2 w-[15%]">
                                            + imbuh 0,25e (g)
                                        </th>

                                        <th className="border px-3 py-2 w-[15%]">
                                            Penunjukan (g)
                                        </th>

                                        <th className="border px-3 py-2 w-[20%]">
                                            Pengamatan
                                        </th>

                                        <th className="border px-3 py-2 w-[15%]">
                                            + imbuh 0,5e (g)
                                        </th>

                                        <th className="border px-3 py-2 w-[15%]">
                                            Penunjukan (g)
                                        </th>

                                        <th className="border px-3 py-2 w-[20%]">
                                            Pengamatan
                                        </th>

                                        <th className="border px-3 py-2 w-[12%]">
                                            Hasil
                                        </th>


                                    </tr>

                                </thead>


                                <tbody>

                                    <tr>

                                        <td className="border px-3 py-2 text-center">
                                            {row.langkahOtomatis}
                                        </td>
                                        <td className="border px-3 py-2 text-center">
                                            {row.penyetelBekerja}
                                        </td>

                                        <td className="border px-3 py-2 text-center">
                                            {row.imbuhOtomatis10e}
                                        </td>


                                        <td className="border px-3 py-2 text-center">

                                            <input
                                                type="number" className="w-full border border-slate-300 rounded px-2 py-1.5 text-center focus:ring-2 focus:ring-blue-500"
                                                value={
                                                    row.penunjukanOtomatis10e ?? ""
                                                }

                                                onChange={(e) =>
                                                    updateValue(
                                                        index,
                                                        "penunjukanOtomatis10e",
                                                        Number(e.target.value)
                                                    )
                                                }

                                            />

                                        </td>


                                        <td className="border px-3 py-2 text-center">
                                            {row.imbuhOtomatis025e}
                                        </td>


                                        <td className="border px-3 py-2 text-center">

                                            <input
                                                type="number" className="w-full border border-slate-300 rounded px-2 py-1.5 text-center focus:ring-2 focus:ring-blue-500"
                                                value={
                                                    row.penunjukanOtomatis025e ?? ""
                                                }

                                                onChange={(e) =>
                                                    updateValue(
                                                        index,
                                                        "penunjukanOtomatis025e",
                                                        Number(e.target.value)
                                                    )
                                                }

                                            />

                                        </td>


                                        <td className="border px-3 py-2 text-center">
                                            <div className="text-center text-sm leading-relaxed">

                                                {
                                                    row.pengamatanOtomatis025e ?? "-"
                                                }

                                            </div>
                                        </td>


                                        <td className="border px-3 py-2 text-center">
                                            {row.imbuhOtomatis05e}
                                        </td>


                                        <td className="border px-3 py-2 text-center">

                                            <input
                                                type="number" className="w-full border border-slate-300 rounded px-2 py-1.5 text-center focus:ring-2 focus:ring-blue-500"
                                                value={
                                                    row.penunjukanOtomatis05e ?? ""
                                                }

                                                onChange={(e) =>
                                                    updateValue(
                                                        index,
                                                        "penunjukanOtomatis05e",
                                                        Number(e.target.value)
                                                    )
                                                }

                                            />

                                        </td>


                                        <td className="border px-3 py-2 text-center">
                                            <div className="text-center text-sm leading-relaxed">

                                                {
                                                    row.pengamatanOtomatis05e ?? "-"
                                                }

                                            </div>
                                        </td>


                                        <td className="border px-3 py-2 text-center">
                                            <div className={`text-center font-semibold ${row.hasil === "SAH"
                                                ? "text-green-600"
                                                : row.hasil === "BATAL"
                                                    ? "text-red-600"
                                                    : ""
                                                }
`}
                                            >

                                                {
                                                    row.hasil ?? "-"
                                                }

                                            </div>
                                        </td>


                                    </tr>


                                </tbody>

                            </table>


                        </td>

                    </tr>

                )
            }
            {
                section.generator === "PENYETELAN_NOL" &&
                row.jenisPenyetelNol === "Semi otomatis" && (

                    <tr>

                        <td colSpan={jumlahKolom}>

                            <table className="w-full border-collapse border text-sm table-fixed">

                                <thead className="bg-slate-100">

                                    <tr >

                                        <th className="border px-3 py-2 w-[15%]">
                                            + imbuh 10e (g)
                                        </th>
                                        <th className="border px-3 py-2 w-[15%]">
                                            Penunjukan (g)
                                        </th>
                                        <th className="border px-3 py-2 w-[15%]">
                                            + imbuh 0,25e (g)
                                        </th>
                                        <th className="border px-3 py-2 w-[15%]">
                                            Penunjukan (g)
                                        </th>
                                        <th className="border px-3 py-2 w-[20%]">
                                            Pengamatan
                                        </th>
                                        <th className="border px-3 py-2 w-[15%]">
                                            + imbuh 0,5e (g)
                                        </th>
                                        <th className="border px-3 py-2 w-[15%]">
                                            Penunjukan (g)
                                        </th>
                                        <th className="border px-3 py-2 w-[20%]">
                                            Pengamatan
                                        </th>

                                        <th className="border px-3 py-2 w-[12%]">
                                            Hasil
                                        </th>
                                    </tr>

                                </thead>


                                <tbody>

                                    <tr>
                                        <td className="border px-3 py-2 text-center">
                                            {row.tambah10e}
                                        </td>


                                        <td className="border px-3 py-2 text-center">

                                            <input type="number" className="w-full border border-slate-300 rounded px-2 py-1.5 text-center focus:ring-2 focus:ring-blue-500"
                                                value={
                                                    row.penunjukanSM10e ?? ""
                                                }

                                                onChange={(e) =>
                                                    updateValue(
                                                        index,
                                                        "penunjukanSM10e",
                                                        Number(e.target.value)
                                                    )
                                                }

                                            />

                                        </td>


                                        <td className="border px-3 py-2 text-center">
                                            {row.tambah025e}
                                        </td>


                                        <td className="border px-3 py-2 text-center">

                                            <input
                                                type="number"
                                                className="w-full border border-slate-300 rounded px-2 py-1.5 text-center focus:ring-2 focus:ring-blue-500"
                                                value={
                                                    row.penunjukanSM025e ?? ""
                                                }

                                                onChange={(e) =>
                                                    updateValue(
                                                        index,
                                                        "penunjukanSM025e",
                                                        Number(e.target.value)
                                                    )
                                                }

                                            />

                                        </td>


                                        <td className="border px-3 py-2 text-center">
                                            <div className="text-center text-sm leading-relaxed">

                                                {
                                                    row.pengamatanSM025e ?? "-"
                                                }

                                            </div>
                                        </td>


                                        <td className="border px-3 py-2 text-center">
                                            {row.tambah05e}
                                        </td>


                                        <td className="border px-3 py-2 text-center">

                                            <input
                                                type="number"
                                                className="w-full border border-slate-300 rounded px-2 py-1.5 text-center focus:ring-2 focus:ring-blue-500"
                                                value={
                                                    row.penunjukanSM05e ?? ""
                                                }

                                                onChange={(e) =>
                                                    updateValue(
                                                        index,
                                                        "penunjukanSM05e",
                                                        Number(e.target.value)
                                                    )
                                                }

                                            />

                                        </td>


                                        <td className="border px-3 py-2 text-center">
                                            <div className="text-center text-sm leading-relaxed">

                                                {
                                                    row.pengamatanSM05e ?? "-"
                                                }

                                            </div>
                                        </td>


                                        <td className="border px-3 py-2 text-center">
                                            <div
                                                className={`text-center font-semibold 
                                                                        ${row.hasil === "SAH"
                                                        ? "text-green-600" : row.hasil === "BATAL"
                                                            ? "text-red-600" : ""
                                                    }
`}
                                            >

                                                {
                                                    row.hasil ?? "-"
                                                }

                                            </div>
                                        </td>


                                    </tr>

                                </tbody>

                            </table>


                        </td>

                    </tr>

                )
            }

        </>
    );
}