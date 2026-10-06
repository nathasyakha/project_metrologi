import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Eye, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { jenisAlatLabel, certificateStatusLabel, type Certificate } from "@/lib/peneraan";

interface Props {
    canDelete: boolean;
    onView: (cert: Certificate) => void;
    onDelete: (id: string, no: string) => void;
}

export function getSertifikatColumns(props: Props): ColumnDef<Certificate>[] {
    return [
        {
            header: "No. Sertifikat",
            accessorKey: "certificateNumber",
            cell: ({ row }) => (
                <span className="font-mono text-xs font-semibold text-navy-950">
                    {row.original.certificateNumber}
                </span>
            ),
        },
        {
            header: "Nama Perusahaan / Pemilik",
            accessorKey: "companyName",
            cell: ({ row }) => (
                <span className="font-medium text-slate-900">{row.original.companyName || "-"}</span>
            ),
        },
        {
            header: "Alat Ukur",

            id: "alatUkur",


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


            enableSorting: false,


            cell: ({ row }) => {

                const item = row.original;


                const jenis =
                    item.instrumentJenisAlat;


                return (

                    <div className="text-xs">


                        {/* Jenis Alat */}

                        <div className="font-semibold text-slate-900">

                            {
                                jenis
                                    ?
                                    jenisAlatLabel[
                                    jenis as keyof typeof jenisAlatLabel
                                    ] ?? jenis
                                    :
                                    "-"
                            }

                        </div>



                        {/* Spesifikasi */}

                        <div className="text-slate-500">

                            {item.instrumentBrand || "-"}


                            {
                                item.instrumentType
                                    ?
                                    ` / ${item.instrumentType}`
                                    :
                                    ""
                            }


                            {
                                item.instrumentSerial
                                    ?
                                    ` / SN ${item.instrumentSerial}`
                                    :
                                    ""
                            }


                        </div>


                    </div>

                );

            },

        },
        {
            header: "Tanggal Terbit",
            accessorKey: "issueDate",
            cell: ({ row }) => (
                <span className="text-xs text-slate-600">{formatDate(row.original.issueDate)}</span>
            ),
        },
        {
            header: "Masa Berlaku Hingga",
            accessorKey: "expiryDate",
            cell: ({ row }) => (
                <span className="text-xs font-medium text-slate-900">{formatDate(row.original.expiryDate)}</span>
            ),
        },
        {
            header: "Status",
            accessorKey: "status",
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
                    certificateStatusLabel
                ).map(([value, label]) => ({
                    value,
                    label,
                })),
            },
            cell: ({ row }) => {
                const status = row.original.status;
                return (
                    <Badge>
                        {certificateStatusLabel[status]}
                    </Badge>
                );
            },
        },
        {
            header: "Aksi",
            id: "aksi",
            meta: {
                headerClassName: "text-center",
            },
            enableSorting: false,
            cell: ({ row }) => {
                const cert = row.original;
                return (
                    <div className="flex justify-center gap-1.5">
                        <Button
                            size="sm"
                            variant="secondary"
                            className="text-xs h-7 px-2.5 gap-1"
                            onClick={() => props.onView(cert)}
                        >
                            <Eye className="h-3.5 w-3.5" /> Lihat / Cetak
                        </Button>
                        {props.canDelete && (
                            <Button
                                size="sm"
                                variant="secondary"
                                className="text-xs h-7 px-2"
                                onClick={() => props.onDelete(cert.id, cert.certificateNumber)}
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