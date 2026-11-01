
"use client";

import { useEffect, useState } from "react";

interface ChecklistItem {
    parameter: string;
    kondisi?: string;
    keterangan?: string;
}

interface Props {
    items: ChecklistItem[];
    onChange: (rows: ChecklistItem[]) => void;
}

export function CerapanChecklist({ items, onChange }: Props) {
    const [rows, setRows] = useState<ChecklistItem[]>(items);

    useEffect(() => {
        setRows(items);
    }, [items]);

    function updateValue(
        index: number,
        key: string,
        value: string
    ) {
        const updated = rows.map((row, i) =>
            i === index
                ? { ...row, [key]: value }
                : row
        );

        setRows(updated);
        onChange(updated);
    }

    return (
        <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-slate-100">
                    <tr>
                        <th className="border px-3 py-2">No</th>
                        <th className="border px-3 py-2">
                            Parameter Pemeriksaan
                        </th>
                        <th className="border px-3 py-2">Kondisi</th>
                        <th className="border px-3 py-2">Keterangan</th>
                    </tr>
                </thead>

                <tbody>
                    {rows.map((row, index) => (
                        <tr key={index} className="border-t">
                            <td className="border px-3 py-2 text-center">
                                {index + 1}
                            </td>

                            <td className="border px-3 py-2">
                                {row.parameter}
                            </td>

                            <td className="border px-3 py-2">
                                <select
                                    className="border rounded px-2 py-1"
                                    value={row.kondisi ?? ""}
                                    onChange={(e) =>
                                        updateValue(
                                            index,
                                            "kondisi",
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="">Pilih</option>
                                    <option value="YA">Ya</option>
                                    <option value="ADA">Ada</option>
                                    <option value="TIDAK">Tidak</option>
                                    <option value="TIDAK ADA">Tidak Ada</option>
                                </select>
                            </td>

                            <td className="border px-3 py-2">
                                <input
                                    className="border rounded px-2 py-1 w-full"
                                    value={row.keterangan ?? ""}
                                    onChange={(e) =>
                                        updateValue(
                                            index,
                                            "keterangan",
                                            e.target.value
                                        )
                                    }
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
