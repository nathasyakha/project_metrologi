import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import Swal from "sweetalert2";
import {
  createQualityDocument,
  reviseQualityDocument,
  fetchQualityDocument,
  categoryLabel,
  documentCategories,
} from "@/lib/dokumen-mutu";
import { getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Input";
import { formatVersionLabel } from "@/lib/dokumen-mutu";
import { computeNextDocumentCode } from "@/lib/dokumen-mutu";
import { editQualityDocument } from "@/lib/dokumen-mutu";

const createSchema = z.object({
  code: z.string().min(1, "Kode wajib diisi"),
  name: z.string().min(1, "Nama dokumen wajib diisi"),
  category: z.enum(documentCategories),
  effectiveDate: z.string().min(1, "Tanggal berlaku wajib diisi"),
});

const reviseSchema = z.object({
  code: z.string().min(1, "Kode dokumen wajib diisi"),
  name: z.string().optional(),
  effectiveDate: z.string().min(1, "Tanggal berlaku wajib diisi"),
});

interface DokumenMutuFormProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "revise" | "edit";
  targetId?: string | null; // dipakai untuk mode "revise" dan "edit"
}

const editSchema = z.object({
  code: z.string().min(1, "Kode wajib diisi"),
  name: z.string().min(1, "Nama wajib diisi"),
  category: z.enum(documentCategories),
  effectiveDate: z.string().min(1, "Tanggal berlaku wajib diisi"),
});

export function DokumenMutuForm({ isOpen, onClose, mode, targetId }: DokumenMutuFormProps) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const { data: existing } = useQuery({
    queryKey: ["quality-document", targetId],
    queryFn: () => fetchQualityDocument(targetId as string),
    enabled: mode !== "create" && Boolean(targetId),
  });

  const schema = mode === "create" ? createSchema : mode === "revise" ? reviseSchema : editSchema;
  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setFileError(null);
      reset();
    }
  }, [isOpen, reset]);

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      if (mode === "edit") {
        // file OPSIONAL di mode edit — beda dari create/revise yang wajib
        return editQualityDocument({ id: targetId as string, ...values, file: file ?? undefined });
      }
      if (!file) {
        setFileError("File dokumen wajib diunggah");
        throw new Error("File wajib diunggah");
      }
      if (mode === "revise") {
        return reviseQualityDocument({ id: targetId as string, ...values, file });
      }
      return createQualityDocument({ ...values, file });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quality-documents"] });
      queryClient.invalidateQueries({ queryKey: ["quality-documents-expired"] });
      const messages = {
        create: "Dokumen baru berhasil ditambahkan.",
        revise: "Revisi dokumen berhasil disimpan.",
        edit: "Dokumen berhasil diperbarui.",
      };
      Swal.fire({ title: "Berhasil!", text: messages[mode], icon: "success", timer: 1500, showConfirmButton: false });
      onClose();
    },
    onError: (error) => {
      Swal.fire({ title: "Gagal!", text: getErrorMessage(error, "Gagal menyimpan dokumen"), icon: "error", confirmButtonColor: "#ef4444" });
    }
  });

  if (!isOpen) return null;

  const titles = { create: "Tambah Dokumen Baru", revise: "Revisi Dokumen", edit: "Edit Dokumen" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{titles[mode]}</h2>
            {mode !== "create" && existing && (
              <p className="text-xs text-slate-500">
                {existing.data.code} — Versi saat ini {formatVersionLabel(existing.data.version)}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit((values) => {
            if (mode !== "edit" && !file) setFileError("File dokumen wajib diunggah");
            mutation.mutate(values);
          })}
          className="p-6 space-y-4 max-h-[80vh] overflow-y-auto"
        >
          {/* Kode Dokumen: wajib tampil di create & edit; di revise pakai auto-suggest revisi berikutnya */}
          {mode === "create" && (
            <div>
              <Label htmlFor="code">Kode Dokumen</Label>
              <Input id="code" placeholder="SOP/01/DISKUKMP-UML-2024/01" {...register("code" as any)} />
              <FieldError message={(errors as any).code?.message} />
            </div>
          )}

          {mode === "revise" && existing && (
            <div>
              <Label htmlFor="code">No. Dokumen</Label>
              <Input
                id="code"
                defaultValue={computeNextDocumentCode(existing.data.code, existing.data.version)}
                {...register("code" as any)}
              />
              <FieldError message={(errors as any).code?.message} />
            </div>
          )}

          {mode === "edit" && existing && (
            <div>
              <Label htmlFor="code">Kode Dokumen</Label>
              <Input id="code" defaultValue={existing.data.code} {...register("code" as any)} />
              <FieldError message={(errors as any).code?.message} />
            </div>
          )}

          <div>
            <Label htmlFor="name">
              Nama Dokumen {mode === "revise" && <span className="font-normal text-slate-400">(opsional)</span>}
            </Label>
            <Input
              id="name"
              defaultValue={mode === "edit" ? existing?.data.name : undefined}
              placeholder={mode !== "create" ? existing?.data.name : "Pelayanan Tera dan Tera Ulang UTTP di Kantor"}
              {...register("name" as any)}
            />
            <FieldError message={(errors as any).name?.message} />
          </div>

          {(mode === "create" || mode === "edit") && (
            <div>
              <Label htmlFor="category">Kategori</Label>
              <select
                id="category"
                defaultValue={mode === "edit" ? existing?.data.category : undefined}
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-700/20"
                {...register("category" as any)}
              >
                <option value="">Pilih kategori</option>
                {documentCategories.map((c) => (
                  <option key={c} value={c}>{categoryLabel[c]}</option>
                ))}
              </select>
              <FieldError message={(errors as any).category?.message} />
            </div>
          )}

          <div>
            <Label htmlFor="effectiveDate">Tanggal Berlaku</Label>
            <Input
              id="effectiveDate"
              type="date"
              defaultValue={mode === "edit" && existing ? existing.data.effectiveDate.slice(0, 10) : undefined}
              {...register("effectiveDate" as any)}
            />
            <FieldError message={(errors as any).effectiveDate?.message} />
          </div>

          <div>
            <Label htmlFor="file">
              File Dokumen (PDF, maks. 10MB) {mode === "edit" && <span className="font-normal text-slate-400">(opsional, kosongkan jika tidak perlu diganti)</span>}
            </Label>
            <input
              id="file"
              type="file"
              accept="application/pdf"
              onChange={(e) => { setFile(e.target.files?.[0] ?? null); setFileError(null); }}
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-slate-200"
            />
            <FieldError message={fileError ?? undefined} />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={onClose}>Batal</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Menyimpan..." : mode === "revise" ? "Simpan Revisi" : mode === "edit" ? "Simpan Perubahan" : "Simpan Dokumen"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
