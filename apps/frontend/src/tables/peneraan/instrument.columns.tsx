import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Pencil, Trash2 } from "lucide-react";
import { jenisAlatLabel, type Instrument } from "@/lib/peneraan";
import { formatKg } from "@/lib/utils/formatSatuan";

interface Props {
    isAdmin: boolean;
    canDelete: boolean;
    onEdit: (inst: Instrument) => void;
    onDelete: (id: string, name: string) => void;
}

export function getInstrumenColumns(props: Props): ColumnDef<Instrument>[] {
    const columns: ColumnDef<Instrument>[] = [];

    // Kolom "Nama Pemilik" cuma untuk admin (pemilik_alat cuma lihat alat miliknya sendiri, jadi kolom ini redundan buat mereka)
    if (props.isAdmin) {
        columns.push({
            header: "Nama Perusahaan / Pemilik ",
            accessorKey: "ownerName",
            meta: {
                filterType: "text",
            },
            cell: ({ row }) => (
                <span className="font-medium text-slate-900">{row.original.ownerName || "-"}</span>
            ),
        });
    }

    columns.push(
        {
            header: "Jenis Alat",
            accessorKey: "jenisAlat",
            meta: {
                filterType: "select",
                options: Object.entries(jenisAlatLabel).map(([value, label]) => ({
                    value,
                    label
                }))
            },
            cell: ({ row }) => (
                <span className="text-slate-700">{jenisAlatLabel[row.original.jenisAlat] || row.original.jenisAlat}</span>
            ),
        },
        {
            header: "Merek",
            accessorKey: "brand",
            meta: {
                filterType: "text",
            },
            cell: ({ row }) => <span className="font-semibold text-slate-900">{row.original.brand}</span>,
        },
        {
            header: "Tipe / Model",
            accessorKey: "type",
            meta: {
                filterType: "text",
            },
            cell: ({ row }) => <span className="text-slate-700">{row.original.type || "-"}</span>,
        },
        {
            header: "Nomor Seri",
            accessorKey: "serialNumber",
            meta: {
                filterType: "text",
            },
            cell: ({ row }) => (
                <span className="font-mono text-xs text-slate-600">{row.original.serialNumber || "-"}</span>
            ),
        },
        {
            header: "Kapasitas Maksimum",
            accessorKey: "capacityValue",
            meta: {
                filterType: "text",
            },
            cell: ({ row }) => (
                <span className="font-medium text-slate-900">
                    {formatKg(
                        row.original.capacityValue,
                        row.original.capacityUnit
                    )}
                </span>
            ),
        },
        {
            header: "Daya Baca",
            accessorKey: "dayabaca",
            meta: {
                filterType: "text",
            },
            cell: ({ row }) => (
                <span className="text-slate-700">
                    {formatKg(
                        row.original.dayabaca,
                        row.original.dayabacaUnit
                    )}
                </span>
            ),
        },
        {
            header: "Kelas",
            accessorKey: "class",
            meta: {
                filterType: "select",
                options: [
                    {
                        label: "Kelas I",
                        value: "I"
                    },
                    {
                        label: "Kelas II",
                        value: "II"
                    },
                    {
                        label: "Kelas III",
                        value: "III"
                    },
                    {
                        label: "Kelas IV",
                        value: "IV"
                    },
                ]
            },
            cell: ({ row }) => <Badge tone="blue">Kelas {row.original.class}</Badge>,
        },
        {
            header: "Aksi",
            id: "aksi",
            meta: {
                headerClassName: "text-center",
                cellClassName: "text-center",
            },
            enableSorting: false,
            cell: ({ row }) => {
                const inst = row.original;
                return (
                    <div className="flex justify-center gap-1.5">
                        {props.canDelete && (
                            <Button size="sm" variant="secondary" className="text-xs h-7 px-2" onClick={() => props.onEdit(inst)}>
                                <Pencil className="h-3.5 w-3.5" />
                            </Button>
                        )}
                        {props.canDelete && (
                            <Button
                                size="sm"
                                variant="secondary"
                                className="text-xs h-7 px-2"
                                onClick={() => props.onDelete(inst.id, inst.brand)}
                            >
                                <Trash2 className="h-3.5 w-3.5 text-red-600" />
                            </Button>
                        )}
                    </div>
                );
            },
        }
    );
    return columns;
}