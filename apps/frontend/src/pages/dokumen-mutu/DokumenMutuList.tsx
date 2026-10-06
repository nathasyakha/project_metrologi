import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Pencil, History, Trash2, Plus, RefreshCw } from "lucide-react";
import {
  fetchQualityDocuments,
  categoryLabel,
  documentCategories,
  openDocumentFile,
  type DocumentCategory,
} from "@/lib/dokumen-mutu";
import { api, getErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";
import { RoleGuard } from "@/components/RoleGuard";
import { DokumenMutuForm } from "./DokumenMutuForm";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import { formatVersionLabel } from "@/lib/dokumen-mutu";

const canManage = ["admin", "petugas_penera"] as const;

export function DokumenMutuList() {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState<DocumentCategory | "">("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "revise" | "edit">("create");
  const [targetId, setTargetId] = useState<string | null>(null);

  function openModal(mode: "create" | "revise" | "edit", id: string | null = null) {
    setModalMode(mode);
    setTargetId(id);
    setIsModalOpen(true);
  }
  const { data, isLoading } = useQuery({
    queryKey: ["quality-documents", category],
    queryFn: () => fetchQualityDocuments(category || undefined),
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
        // pakai instance `api` (axios) supaya Bearer token ikut terkirim otomatis
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Modul Dokumen Mutu</h1>
          <p className="mt-1 text-sm text-slate-500">
            Kelola dokumen mutu, revisi otomatis, dan pengarsipan versi lama.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/dokumen-mutu/kedaluwarsa">
            <Button variant="secondary">
              <History className="h-4 w-4" />
              Dokumen Kedaluwarsa
            </Button>
          </Link>
          <RoleGuard allow={[...canManage]}>
            <Button onClick={() => openModal("create")}>
              <Plus className="h-4 w-4 mr-1" /> Tambah Dokumen
            </Button>
          </RoleGuard>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div>
            <h2 className="font-semibold text-slate-900">Daftar Dokumen Mutu</h2>
            <p className="mt-1 text-sm text-slate-500">Dokumen yang sedang berlaku.</p>
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as DocumentCategory | "")}
            className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm"
          >
            <option value="">Semua kategori</option>
            {documentCategories.map((c) => (
              <option key={c} value={c}>
                {categoryLabel[c]}
              </option>
            ))}
          </select>
        </CardHeader>
        <CardBody className="p-0">
          <Table>
            <Thead>
              <tr>
                <Th>No. Dokumen</Th>
                <Th>Nama Dokumen</Th>
                <Th>Kategori</Th>
                <Th>Versi</Th>
                <Th>Tanggal Berlaku</Th>
                <Th className="text-center">Aksi</Th>
              </tr>
            </Thead>
            <tbody>
              {isLoading && <EmptyState colSpan={6} message="Memuat data..." />}
              {!isLoading && data?.length === 0 && (
                <EmptyState colSpan={6} message="Belum ada dokumen pada kategori ini." />
              )}
              {data?.map((doc) => (
                <Tr key={doc.id}>
                  <Td className="font-mono text-xs text-slate-600">{doc.code}</Td>
                  <Td className="font-medium text-slate-800">{doc.name}</Td>
                  <Td>
                    <Badge tone="blue">{categoryLabel[doc.category]}</Badge>
                  </Td>
                  <Td>{formatVersionLabel(doc.version)}</Td>
                  <Td>{formatDate(doc.effectiveDate)}</Td>
                  <Td>
                    <div className="flex justify-center gap-2">
                      <Button size="sm" variant="secondary" onClick={() => openDocumentFile(doc.id)} title="Buka File">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>

                      <RoleGuard allow={[...canManage]}>
                        <Button size="sm" variant="secondary" onClick={() => openModal("revise", doc.id)} title="Revisi Dokumen (naik versi)">
                          <RefreshCw className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => openModal("edit", doc.id)} title="Edit (perbaiki tanpa revisi)">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </RoleGuard>

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

      <DokumenMutuForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        targetId={targetId}
      />
    </div>
  );
}