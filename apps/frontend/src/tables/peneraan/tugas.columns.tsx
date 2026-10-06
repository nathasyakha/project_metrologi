import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FileSpreadsheet } from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
    layananLabel,
    lokasiLabel,
    jenisAlatLabel,
    statusPermohonanLabel,
    statusPermohonanTone,
    type PermohonanPeneraan,
} from "@/lib/peneraan";
import { formatKg } from "@/lib/utils/formatSatuan";

interface Props {
    onInputCerapan: (item: PermohonanPeneraan) => void;
}

export function getTugasColumns(props: Props): ColumnDef<PermohonanPeneraan>[] {
    return [
        {
            header: "No. Permohonan",
            accessorKey: "applicationNumber",
            cell: ({ row }) => (
                <span className="font-mono text-xs font-semibold text-slate-800">
                    {row.original.applicationNumber}
                </span>
            ),
        },
        {
            header: "Jadwal Pelaksanaan",
            accessorKey: "jadwalTanggal",
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <div className="text-xs">
                        <div className="font-semibold text-navy-950 flex items-center gap-1">
                            {item.jadwalTanggal ? formatDate(item.jadwalTanggal) : "-"}
                        </div>
                        <div className="text-[11px] text-slate-500">{layananLabel[item.layanan]}</div>
                    </div>
                );
            },
        },
        {
            header: "Nama Perusahaan / Pemilik",
            accessorKey: "companyName",
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <div className="text-xs text-slate-600">
                        <div>{item.companyName}</div>
                        <div className="text-[11px] text-slate-400">{item.companyPhone}</div>
                    </div>
                );
            },
        },
        {
            header: "Lokasi",
            id: "lokasi",
            accessorFn: (row) =>
                row.lokasi ?? "",
            filterFn: (
                row,
                columnId,
                filterValue
            ) => {
                if (!filterValue) {
                    return true;
                }
                return (
                    row.getValue(columnId)
                    === filterValue
                );
            },
            meta: {
                filterType: "select",
                options: Object.entries(
                    lokasiLabel
                ).map(([value, label]) => ({
                    value,
                    label,
                })),
            },
            cell: ({ row }) => {
                const lokasi = row.original.lokasi;
                return (
                    <span className="text-xs text-slate-700">
                        {lokasi ? lokasiLabel[lokasi] : "-"}
                    </span>
                );
            },
        },
        {
            header: "Spesifikasi Alat",
            id: "spesifikasiAlat",
            accessorFn: (row) =>
                row.instrumentJenisAlat ?? "",
            filterFn: (
                row,
                columnId,
                filterValue
            ) => {
                if (!filterValue) {
                    return true;
                }
                return (
                    row.getValue(columnId) === filterValue
                );
            },
            meta: {
                filterType: "select",
                options: Object.entries(
                    jenisAlatLabel
                ).map(([value, label]) => ({
                    value,
                    label,
                })),
            },
            cell: ({ row }) => {
                const item = row.original;
                const jenisAlat = item.instrumentJenisAlat;
                return (
                    <div className="text-xs">
                        {/* Jenis Alat */}
                        <div className="font-semibold text-slate-900">
                            {
                                jenisAlat
                                    ? jenisAlatLabel[
                                    jenisAlat as keyof typeof jenisAlatLabel
                                    ] ?? jenisAlat
                                    : "-"
                            }
                        </div>
                        {/* Detail Spesifikasi */}
                        <div className="text-slate-500">
                            {item.instrumentBrand || "-"}
                            {item.instrumentType ? ` / ${item.instrumentType}` : ""}
                            {item.capacityValue ? ` / ${formatKg(item.capacityValue, item.capacityUnit)}` : ""}
                            {item.class ? ` / Kelas ${item.class}` : ""}
                        </div>
                    </div>
                );
            },
        },
        {
            header: "Status",
            accessorKey: "status",
            filterFn: (
                row,
                columnId,
                value
            ) => {
                if (!value)
                    return true;
                return (
                    row.getValue(columnId)
                    === value
                );
            },
            meta: {
                filterType: "select",
                options: Object.entries(
                    statusPermohonanLabel
                ).map(([value, label]) => ({
                    value,
                    label
                }))
            },
            cell: ({ row }) => (
                <Badge
                    tone={statusPermohonanTone[row.original.status]}
                >
                    {
                        statusPermohonanLabel[row.original.status]
                    }
                </Badge>
            ),
        },
        {
            header: "Aksi",
            id: "aksi",
            meta: {
                headerClassName: "text-center",
            },
            enableSorting: false,
            cell: ({ row }) => (
                <div className="flex justify-center gap-1.5">
                    <Button
                        size="sm"
                        className="text-xs h-7 px-2.5 bg-emerald-700 hover:bg-emerald-800 text-white gap-1"
                        onClick={() => props.onInputCerapan(row.original)}
                    >
                        <FileSpreadsheet className="h-3.5 w-3.5" />
                        Input Cerapan
                    </Button>
                </div>
            ),
        },
    ];
}