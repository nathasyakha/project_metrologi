interface Props {

    rows: any[];

    updateValue: (
        index: number,
        key: string,
        value: any
    ) => void;

}


export function CerapanRepeatTambahan({
    rows,
    updateValue

}: Props) {
    return (
        <div className="mt-4">
            <h4 className="font-semibold text-slate-800 text-base mb-2">
                Jika Selisih P1 dan P2 adalah sebesar BKD Muatan Uji, gunakan cerapan ini.
            </h4>

            <table className="w-full table-fixed border-collapse border border-slate-200 text-sm">
                <colgroup>
                    <col className="w-[25%]" /> {/* Muatan Uji */}
                    <col className="w-[25%]" /> {/* Penunjukan (I) */}
                    <col className="w-[25%]" /> {/* Imbuh (ΔL) */}
                    <col className="w-16" />    {/* Label P1, P2, P3 */}
                    <col />                     {/* Penunjukan Sebenarnya */}
                </colgroup>

                <thead>
                    <tr className="bg-slate-50 text-slate-700">
                        <th className="border p-3 text-center font-semibold text-slate-700">
                            Muatan Uji (g)
                        </th>
                        <th className="border p-3 text-center font-semibold text-slate-700">
                            Penunjukan (I) (g)
                        </th>
                        <th className="border p-3 text-center font-semibold text-slate-700">
                            Imbuh (ΔL) (g)
                        </th>
                        <th colSpan={2} className="border p-3 text-center font-semibold text-slate-700">
                            Penunjukan Sebenarnya.    (P = I + 0,5e - ΔL) (g)
                        </th>
                    </tr>
                </thead>

                <tbody className="text-slate-800">
                    {/* BARIS 1 (P1) */}
                    <tr>
                        <td className="p-2 border">
                            <input
                                type="number"
                                className="w-full border rounded p-1 text-sm text-slate-800 focus:outline-none"
                                value={rows[2]?.muatanUjiTambahan ?? ""}
                                onChange={(e) => updateValue(2, "muatanUjiTambahan", e.target.value)}
                            />
                        </td>
                        <td className="p-2 border">
                            <input
                                type="number"
                                className="w-full border rounded p-1 text-sm text-slate-800 focus:outline-none"
                                value={rows[2]?.penunjukanTambahan1 ?? ""}
                                onChange={(e) => updateValue(2, "penunjukanTambahan1", e.target.value)}
                            />
                        </td>
                        <td className="p-2 border">
                            <input
                                type="number"
                                className="w-full border rounded p-1 text-sm text-slate-800 focus:outline-none"
                                value={rows[2]?.imbuh1 ?? ""}
                                onChange={(e) => updateValue(2, "imbuh1", e.target.value)}
                            />
                        </td>
                        <td className="bg-slate-100 p-2 text-center border font-medium text-slate-700 text-sm">
                            P1
                        </td>
                        <td className="p-2 border">
                            <div className="w-full bg-slate-100/80 border border-slate-200 rounded p-1 text-sm text-slate-800 text-left min-h-[30px] flex items-center px-2">
                                {rows[2]?.penunjukanSebenarnya1 ?? ""}
                            </div>
                        </td>
                    </tr>

                    {/* BARIS 2 (P2) */}
                    <tr>
                        <td className="p-2 border">
                            <input
                                type="number"
                                className="w-full border rounded p-1 text-sm text-slate-800 focus:outline-none"
                                value={rows[2]?.muatanUjiTambahan ?? ""}
                                onChange={(e) => updateValue(2, "muatanUjiTambahan", e.target.value)}
                            />
                        </td>
                        <td className="p-2 border">
                            <input
                                type="number"
                                className="w-full border rounded p-1 text-sm text-slate-800 focus:outline-none"
                                value={rows[2]?.penunjukanTambahan2 ?? ""}
                                onChange={(e) => updateValue(2, "penunjukanTambahan2", e.target.value)}
                            />
                        </td>
                        <td className="p-2 border">
                            <input
                                type="number"
                                className="w-full border rounded p-1 text-sm text-slate-800 focus:outline-none"
                                value={rows[2]?.imbuh2 ?? ""}
                                onChange={(e) => updateValue(2, "imbuh2", e.target.value)}
                            />
                        </td>
                        <td className="bg-slate-100 p-2 text-center border font-medium text-slate-700 text-sm">
                            P2
                        </td>
                        <td className="p-2 border">
                            <div className="w-full bg-slate-100/80 border border-slate-200 rounded p-1 text-sm text-slate-800 text-left min-h-[30px] flex items-center px-2">
                                {rows[2]?.penunjukanSebenarnya2 ?? ""}
                            </div>
                        </td>
                    </tr>

                    {/* BARIS 3 (P3) */}
                    <tr>
                        <td className="p-2 border">
                            <input
                                type="number"
                                className="w-full border rounded p-1 text-sm text-slate-800 focus:outline-none"
                                value={rows[2]?.muatanUjiTambahan ?? ""}
                                onChange={(e) => updateValue(2, "muatanUjiTambahan", e.target.value)}
                            />
                        </td>
                        <td className="p-2 border">
                            <input
                                type="number"
                                className="w-full border rounded p-1 text-sm text-slate-800 focus:outline-none"
                                value={rows[2]?.penunjukanTambahan3 ?? ""}
                                onChange={(e) => updateValue(2, "penunjukanTambahan3", e.target.value)}
                            />
                        </td>
                        <td className="p-2 border">
                            <input
                                type="number"
                                className="w-full border rounded p-1 text-sm text-slate-800 focus:outline-none"
                                value={rows[2]?.imbuh3 ?? ""}
                                onChange={(e) => updateValue(2, "imbuh3", e.target.value)}
                            />
                        </td>
                        <td className="bg-slate-100 p-2 text-center border font-medium text-slate-700 text-sm">
                            P3
                        </td>
                        <td className="p-2 border">
                            <div className="w-full bg-slate-100/80 border border-slate-200 rounded p-1 text-sm text-slate-800 text-left min-h-[30px] flex items-center px-2">
                                {rows[2]?.penunjukanSebenarnya3 ?? ""}
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={4} className="bg-slate-50 p-2.5 border font-semibold text-slate-700 text-left px-4">
                            R = Pmax - Pmin
                        </td>
                        <td className="p-2.5 border text-center font-medium text-slate-800">
                            {rows[2]?.repeatTambahan ?? "-"}
                        </td>
                    </tr>

                    {/* ==================================================== */}
                    {/* BARIS TAMBAHAN: HASIL                                */}
                    {/* ==================================================== */}
                    <tr>
                        <td colSpan={4} className="bg-slate-50 p-2.5 border font-semibold text-slate-700 text-left px-4">
                            Hasil
                        </td>
                        <td className={`p-2.5 border text-center font-bold 
                                ${rows[2]?.hasilTambahan === "SAH" ?
                                "text-green-600"
                                :
                                rows[2]?.hasilTambahan === "BATAL" ?
                                    "text-red-600" : "text-slate-800"
                            }
    `}
                        >
                            {
                                rows[2]?.hasilTambahan ?? "-"
                            }
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}