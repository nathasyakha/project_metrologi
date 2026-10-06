import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createOwner, updateOwner, type InstrumentOwner } from "@/lib/peneraan";
import { getErrorMessage } from "@/lib/api";
import Swal from "sweetalert2";

interface OwnerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingOwner: InstrumentOwner | null;
  onSuccess: () => void;
}

type FormValues = {
  companyName: string;
  address: string;
  phone: string;
};

export function OwnerProfileModal({
  isOpen,
  onClose,
  existingOwner,
  onSuccess,
}: OwnerProfileModalProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      companyName: existingOwner?.companyName ?? "",
      address: existingOwner?.address ?? "",
      phone: existingOwner?.phone ?? "",
    },
  });

  if (!isOpen) return null;

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      if (existingOwner) {
        await updateOwner(existingOwner.id, values);
        Swal.fire({
          title: "Berhasil!",
          text: "Profil perusahaan berhasil diperbarui.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await createOwner(values);
        Swal.fire({
          title: "Berhasil!",
          text: "Profil perusahaan berhasil didaftarkan.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      Swal.fire("Gagal!", getErrorMessage(error, "Terjadi kesalahan saat menyimpan profil."), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {existingOwner ? "Edit Profil Pemilik / Perusahaan" : "Lengkapi Profil Pemilik Alat"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Identitas perusahaan/pemilik yang tercantum pada permohonan dan sertifikat tera.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Perusahaan / Pemilik <span className="text-red-500">*</span>
            </label>
            <Input
              {...register("companyName", { required: "Nama perusahaan wajib diisi" })}
              placeholder="Contoh: PT. Sumber Makmur Sejahtera"
            />
            {errors.companyName && (
              <p className="text-xs text-red-500 mt-1">{errors.companyName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nomor Telepon / WhatsApp <span className="text-red-500">*</span>
            </label>
            <Input
              {...register("phone", { required: "Nomor telepon wajib diisi" })}
              placeholder="Contoh: 08123456789"
            />
            {errors.phone && (
              <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alamat Lengkap Perusahaan <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register("address", { required: "Alamat wajib diisi" })}
              rows={3}
              placeholder="Contoh: Jl. Industri Raya No. 45, Kawasan Industri, Kota Cilegon"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700"
            />
            {errors.address && (
              <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Profil"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
