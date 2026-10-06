// src/tables/peneraan/pemilik.columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/Button";
import { Pencil, Trash2, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { type InstrumentOwner } from "@/lib/peneraan";

interface Props {
    canDelete: boolean;
    onAddInstrument: (ownerId: string) => void;
    onEdit: (owner: InstrumentOwner) => void;
    onDelete: (id: string, name: string) => void;
}

export function getPemilikColumns(props: Props): ColumnDef<InstrumentOwner>[] {
    return [
        {
            header: "Nama Perusahaan / Pemilik",
            accessorKey: "companyName",
            cell: ({ row }) => (
                <span className="font-semibold text-slate-900">{row.original.companyName}</span>
            ),
        },
        {
            header: "Telepon / Kontak",
            accessorKey: "phone",
            cell: ({ row }) => (
                <span className="font-mono text-xs text-slate-700">{row.original.phone}</span>
            ),
        },
        {
            header: "Alamat",
            accessorKey: "address",
            cell: ({ row }) => (
                <span className="text-xs text-slate-600 max-w-xs truncate block">{row.original.address}</span>
            ),
        },
        {
            header: "Tanggal Terdaftar",
            accessorKey: "createdAt",
            cell: ({ row }) => (
                <span className="text-xs text-slate-500">{formatDate(row.original.createdAt)}</span>
            ),
        },
        {
            header: "Aksi",
            id: "aksi",
            meta: {
                headerClassName: "text-center",
            },
            enableSorting: false,
            cell: ({ row }) => {
                const owner = row.original;
                return (
                    <div className="flex justify-center gap-1.5">
                        <Button
                            size="sm"
                            variant="secondary"
                            className="text-xs h-7 px-2 gap-1"
                            onClick={() => props.onAddInstrument(owner.id)}
                        >
                            <Plus className="h-3.5 w-3.5" /> Tambah Alat
                        </Button>
                        {props.canDelete && (
                            <Button size="sm" variant="secondary" className="text-xs h-7 px-2" onClick={() => props.onEdit(owner)}>
                                <Pencil className="h-3.5 w-3.5" />
                            </Button>
                        )}
                        {props.canDelete && (
                            <Button
                                size="sm"
                                variant="secondary"
                                className="text-xs h-7 px-2"
                                onClick={() => props.onDelete(owner.id, owner.companyName)}
                            >
                                <Trash2 className="h-3.5 w-3.5 text-red-600" />
                            </Button>
                        )}
                    </div>
                );
            },
        },
    ];
}