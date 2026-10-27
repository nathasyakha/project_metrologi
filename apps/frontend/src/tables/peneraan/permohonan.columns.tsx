import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Pencil, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { statusPermohonanLabel, jenisAlatLabel, layananLabel, lokasiLabel, type PermohonanPeneraan } from "@/lib/peneraan";

interface Props {
    isAdmin: boolean;
    isInspector: boolean;
    canDelete: boolean;

    handleOpenReview:
    (item: PermohonanPeneraan) => void;

    handleOpenCerapan:
    (item: PermohonanPeneraan) => void;

    handleOpenSertifikat:
    (item: PermohonanPeneraan) => void;

    handleOpenViewCertificate:
    (item: PermohonanPeneraan) => void;

    setEditingPermohonan:
    (item: PermohonanPeneraan) => void;

    handleDeletePermohonan:
    (id: string, no: string) => void;

    setIsEditPermohonanOpen:
    (value: boolean) => void;
}

export function getPermohonanColumns(
    props: Props
): ColumnDef<PermohonanPeneraan>[] {

    return [
        {
            header: "No. Permohonan",
            accessorKey: "applicationNumber",
            cell: ({ row }) => (
                <span className="font-mono text-xs font-semibold text-slate-800">
                    {row.original.applicationNumber}
                </span>
            )
        },
        {
            header: "Nama Perusahaan / Pemilik",
            accessorKey: "companyName",
            cell: ({ row }) => (
                row.original.companyName
            )
        },
        {
            header: "Spesifikasi Alat Ukur",
            id: "alatUkur",
            accessorFn: (row) =>
                row.instrumentJenisAlat ?? "",
            filterFn: (
                row,
                columnId,
                filterValue
            ) => {
                if (!filterValue) return true;
                return (
                    row.getValue(columnId)
                    === filterValue
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

                const alatList = item.instruments?.length
                    ? item.instruments
                    : [{
                        instrumentId: item.instrumentId,
                        jenisAlat: item.instrumentJenisAlat,
                        brand: item.instrumentBrand,
                        type: item.instrumentType,
                        serialNumber: item.instrumentSerial,
                    }];

                return (
                    <div className="space-y-2 min-w-[180px]">
                        {alatList.map((alat, index) => (
                            <div
                                key={alat.id ?? alat.instrumentId ?? index}
                                className="rounded-md border border-slate-200 px-2.5 py-2"
                            >
                                <div className="font-medium text-slate-900">
                                    {alat.jenisAlat
                                        ? jenisAlatLabel[
                                        alat.jenisAlat as keyof typeof jenisAlatLabel
                                        ]
                                        : "Jenis alat tidak tersedia"}
                                </div>

                                <div className="text-[11px] text-slate-500">
                                    Merek: {alat.brand || "-"}
                                    {alat.type ? ` / Tipe: ${alat.type}` : ""}
                                </div>

                                <div className="text-[11px] text-slate-400 font-mono">
                                    SN: {alat.serialNumber || "-"}
                                </div>

                                {alatList.length > 1 && (
                                    <div className="mt-1 text-[10px] text-slate-500">
                                        Alat {index + 1}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                );
            },

        },
        {
            header: "Layanan / Lokasi",
            accessorKey: "layanan",
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
                    layananLabel
                ).map(([value, label]) => ({
                    value,
                    label,
                })),
            },
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <div>
                        <div className="text-xs font-medium text-slate-700">
                            {layananLabel[item.layanan] ?? item.layanan}
                        </div>
                        <div className="text-[11px] text-slate-400">
                            {lokasiLabel[item.lokasi] ?? item.lokasi}
                        </div>
                    </div>
                );
            },
        },
        {
            header: "Jadwal Tera",
            accessorKey: "jadwalTanggal",
            cell: ({ row }) => {
                const item = row.original;
                return item.jadwalTanggal ?
                    <span className="text-xs">
                        {formatDate(item.jadwalTanggal)}
                    </span>
                    :
                    <span className="text-xs italic text-slate-400">
                        Belum dijadwalkan
                    </span>
            }
        },
        {
            header: "Petugas",
            accessorKey: "petugasName",
            cell: ({ row }) =>
                <span className="text-xs">
                    {row.original.petugasName || "-"}
                </span>
        },
        {
            header: "Status",
            accessorKey: "status",
            filterFn: (
                row,
                columnId,
                filterValue
            ) => {
                if (!filterValue) return true;
                return (
                    row.getValue(columnId)
                    === filterValue
                );
            },
            meta: {
                filterType: "select",
                options: Object.entries(statusPermohonanLabel).map(([value, label]) => ({
                    value,
                    label,
                })),
            },
            cell: ({ row }) => (
                <Badge>
                    {
                        statusPermohonanLabel[
                        row.original.status
                        ]
                    }
                </Badge>
            ),
        },
        {
            header: "Aksi",
            meta: {
                headerClassName: "text-center",
            },
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <div className="flex justify-center gap-2">
                        {
                            props.isAdmin &&
                            item.status === "MENUNGGU_VERIFIKASI"
                            &&
                            <Button
                                size="sm"
                                onClick={() =>
                                    props.handleOpenReview(item)
                                }
                            >
                                Ajukan Tera
                            </Button>
                        }
                        {
                            props.isInspector &&
                            [
                                "DIJADWALKAN",
                                "DIPROSES"
                            ]
                                .includes(item.status)

                            &&
                            <Button size="sm" className="bg-emerald-700 text-white"
                                onClick={() =>
                                    props.handleOpenCerapan(item)
                                }
                            >
                                Input Cerapan
                            </Button>
                        }
                        {
                            props.canDelete &&
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                    props.setEditingPermohonan(item);
                                    props.setIsEditPermohonanOpen(true);
                                }}
                            >
                                <Pencil size={14} />
                            </Button>
                        }
                        {
                            props.canDelete &&
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() =>
                                    props.handleDeletePermohonan(
                                        item.id,
                                        item.applicationNumber
                                    )
                                }
                            >
                                <Trash2 size={14} className="text-red-600" />
                            </Button>
                        }
                    </div>
                )
            }
        }
    ]
}