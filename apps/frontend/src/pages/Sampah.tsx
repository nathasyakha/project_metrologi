// src/pages/Sampah.tsx
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2, RotateCcw, FileOutput } from "lucide-react";
import {
    fetchDeletedQualityDocuments,
    restoreQualityDocument,
    permanentlyDeleteQualityDocument,
    categoryLabel,
    openDocumentFile,
    formatVersionLabel,
} from "@/lib/dokumen-mutu";
import { getErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";
import Swal from "sweetalert2";

// ─── Section: Dokumen Mutu ──────────────────────────────────────────────
// Modul lain (Peneraan, Pengawasan, dst) yang nanti punya soft-delete
// tinggal ditambah sebagai section terpisah di bawah, dengan pola yang sama.
function DokumenMutuTrashSection() {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["quality-documents-trash"],
        queryFn: fetchDeletedQualityDocuments,
    });

    const refreshAll = () => {
        queryClient.invalidateQueries({ queryKey: ["quality-documents-trash"] });
        queryClient.invalidateQueries({ queryKey: ["quality-documents"] });
        queryClient.invalidateQueries({ queryKey: ["quality-documents-expired"] });
    };

    const handleRestore = async (id: string, name: string) => {
        const result = await Swal.fire({
            title: "Pulihkan dokumen ini?",
            text: `"${name}" akan dikembalikan ke daftar aktif/kedaluwarsa seperti sebelum dihapus.`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#0f172a",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Ya, Pulihkan",
            cancelButtonText: "Batal",
        });

        if (result.isConfirmed) {
            try {
                await restoreQualityDocument(id);
                Swal.fire({ title: "Berhasil!", text: "Dokumen sudah dipulihkan.", icon: "success", timer: 1500, showConfirmButton: false });
                refreshAll();
            } catch (error) {
                Swal.fire("Gagal!", getErrorMessage(error, "Gagal memulihkan dokumen."), "error");
            }
        }
    };

    const handlePermanentDelete = async (id: string, name: string) => {
        const result = await Swal.fire({
            title: "Hapus permanen?",
            text: `"${name}" akan dihapus SELAMANYA dari database, termasuk file-nya. Tindakan ini TIDAK BISA dibatalkan.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Ya, Hapus Permanen",
            cancelButtonText: "Batal",
            reverseButtons: true,
            focusCancel: true,
        });

        if (result.isConfirmed) {
            try {
                await permanentlyDeleteQualityDocument(id);
                Swal.fire({ title: "Berhasil!", text: "Dokumen sudah dihapus permanen.", icon: "success", timer: 1500, showConfirmButton: false });
                refreshAll();
            } catch (error) {
                Swal.fire("Gagal!", getErrorMessage(error, "Gagal menghapus dokumen."), "error");
            }
        }
    };

    return (
        <Card>
            <CardHeader>
                <div>
                    <h2 className="font-semibold text-slate-900">Dokumen Mutu</h2>
                    <p className="mt-1 text-sm text-slate-500">Dokumen mutu yang sudah dihapus.</p>
                </div>
            </CardHeader>
            <CardBody className="p-0">
                <Table>
                    <Thead>
                        <tr>
                            <Th>Kode</Th>
                            <Th>Nama Dokumen</Th>
                            <Th>Kategori</Th>
                            <Th>Versi</Th>
                            <Th>Dihapus Pada</Th>
                            <Th className="text-right">Aksi</Th>
                        </tr>
                    </Thead>
                    <tbody>
                        {isLoading && <EmptyState colSpan={6} message="Memuat data..." />}
                        {!isLoading && data?.length === 0 && (
                            <EmptyState colSpan={6} message="Tidak ada dokumen mutu di sampah." />
                        )}
                        {data?.map((doc) => (
                            <Tr key={doc.id}>
                                <Td className="font-mono text-xs text-slate-600">{doc.code}</Td>
                                <Td className="font-medium text-slate-800">{doc.name}</Td>
                                <Td>
                                    <Badge tone="slate">{categoryLabel[doc.category]}</Badge>
                                </Td>
                                <Td>{formatVersionLabel(doc.version)}</Td>
                                <Td>{formatDate(doc.deletedAt)}</Td>
                                <Td>
                                    <div className="flex justify-end gap-2">
                                        <Button size="sm" variant="secondary" onClick={() => openDocumentFile(doc.id)} title="Buka File">
                                            <FileOutput className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button size="sm" variant="secondary" onClick={() => handleRestore(doc.id, doc.name)} title="Pulihkan">
                                            <RotateCcw className="h-3.5 w-3.5 text-emerald-600" />
                                        </Button>
                                        <Button size="sm" variant="secondary" onClick={() => handlePermanentDelete(doc.id, doc.name)} title="Hapus Permanen">
                                            <Trash2 className="h-3.5 w-3.5 text-red-600" />
                                        </Button>
                                    </div>
                                </Td>
                            </Tr>
                        ))}
                    </tbody>
                </Table>
            </CardBody>
        </Card>
    );
}

// ─── Halaman utama Sampah ───────────────────────────────────────────────
export function Sampah() {
    return (
        <div>
            <h1 className="text-2xl font-semibold text-slate-900">Sampah</h1>
            <p className="mt-1 text-sm text-slate-500">
                Item yang sudah dihapus dari berbagai modul. Bisa dipulihkan atau dihapus permanen.
            </p>

            <div className="mt-6 space-y-6">
                <DokumenMutuTrashSection />

                {/* Modul lain menyusul di sini, contoh pola:
        <PeneraaTrashSection />
        <PengawasanTrashSection />
        */}
            </div>
        </div>
    );
}