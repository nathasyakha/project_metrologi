import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowLeft, Trash2, Eye } from "lucide-react";
import { fetchExpiredQualityDocuments, categoryLabel, openDocumentFile, formatVersionLabel } from "@/lib/dokumen-mutu";
import { api, getErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";
import { RoleGuard } from "@/components/RoleGuard";
import Swal from "sweetalert2";

export function DokumenMutuKedaluwarsa() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["quality-documents-expired"],
    queryFn: fetchExpiredQualityDocuments,
  });

  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: `"${name}" akan dihapus.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya",
      cancelButtonText: "Batal",
      reverseButtons: true,
      focusCancel: true,
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/quality-documents/${id}`);

        Swal.fire({
          title: "Berhasil!",
          text: "Dokumen berhasil dihapus.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        queryClient.invalidateQueries({ queryKey: ["quality-documents"] });
        queryClient.invalidateQueries({ queryKey: ["quality-documents-expired"] });
      } catch (error) {
        Swal.fire("Gagal!", getErrorMessage(error, "Terjadi kesalahan saat menghapus dokumen."), "error");
      }
    }
  };

  return (
    <div>
      <Link to="/dokumen-mutu" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Dokumen Mutu
      </Link>

      <h1 className="text-2xl font-semibold text-slate-900">Dokumen Kedaluwarsa</h1>
      <p className="mt-1 text-sm text-slate-500">Versi lama dokumen yang sudah digantikan oleh revisi terbaru.</p>

      <Card className="mt-6">
        <CardHeader>
          <h2 className="font-semibold text-slate-900">Riwayat Dokumen</h2>
        </CardHeader>
        <CardBody className="p-0">
          <Table>
            <Thead>
              <tr>
                <Th>Kode</Th>
                <Th>Nama Dokumen</Th>
                <Th>Kategori</Th>
                <Th>Versi</Th>
                <Th>Tanggal Berlaku</Th>
                <Th className="text-right">Aksi</Th>
              </tr>
            </Thead>
            <tbody>
              {isLoading && <EmptyState colSpan={6} message="Memuat data..." />}
              {!isLoading && data?.length === 0 && (
                <EmptyState colSpan={6} message="Belum ada dokumen kedaluwarsa." />
              )}
              {data?.map((doc) => (
                <Tr key={doc.id}>
                  <Td className="font-mono text-xs text-slate-600">{doc.code}</Td>
                  <Td className="font-medium text-slate-800">{doc.name}</Td>
                  <Td>
                    <Badge tone="slate">{categoryLabel[doc.category]}</Badge>
                  </Td>
                  <Td>{formatVersionLabel(doc.version)}</Td>
                  <Td>{formatDate(doc.effectiveDate)}</Td>
                  <Td>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="secondary" onClick={() => openDocumentFile(doc.id)} title="Buka File">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <RoleGuard allow={["admin"]}>
                        <Button size="sm" variant="secondary" onClick={() => handleDelete(doc.id, doc.name)} title="Hapus Dokumen">
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </Button>
                      </RoleGuard>
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}