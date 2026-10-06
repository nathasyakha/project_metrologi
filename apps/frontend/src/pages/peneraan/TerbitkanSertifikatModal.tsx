import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createCertificate, type PermohonanPeneraan } from "@/lib/peneraan";
import { getErrorMessage } from "@/lib/api";
import { Award, Calendar, ShieldCheck } from "lucide-react";
import Swal from "sweetalert2";

interface TerbitkanSertifikatModalProps {
  isOpen: boolean;
  onClose: () => void;
  permohonan: PermohonanPeneraan | null;
  onSuccess: () => void;
}

type FormValues = {
  expiryDate: string;
  certificateNumber?: string;
};

export function TerbitkanSertifikatModal({
  isOpen,
  onClose,
  permohonan,
  onSuccess,
}: TerbitkanSertifikatModalProps) {
  const [loading, setLoading] = useState(false);

  // Default tanggal kedaluwarsa: 1 tahun dari hari ini (YYYY-MM-DD)
  const defaultExpiry = new Date();
  defaultExpiry.setFullYear(defaultExpiry.getFullYear() + 1);
  const defaultExpiryStr = defaultExpiry.toISOString().slice(0, 10);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      expiryDate: defaultExpiryStr,
      certificateNumber: "",
    },
  });

  if (!isOpen || !permohonan || !permohonan.testObservationId) return null;

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const created = await createCertificate({
        observationId: permohonan.testObservationId!,
        expiryDate: new Date(values.expiryDate).toISOString(),
        certificateNumber: values.certificateNumber?.trim() || undefined,
      });

      Swal.fire({
        title: "Sertifikat Berhasil Diterbitkan!",
        text: `Nomor Sertifikat: ${created.certificateNumber}. Pemilik alat kini dapat mengunduh dan mencetak dokumen sertifikat.`,
        icon: "success",
      });

      onSuccess();
      onClose();
    } catch (error) {
      Swal.fire(
        "Gagal Menerbitkan Sertifikat!",
        getErrorMessage(error, "Terjadi kesalahan saat menerbitkan sertifikat."),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl my-8">
        <div className="border-b border-slate-100 px-6 py-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brass-400/10 text-brass-600">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Penerbitan Sertifikat Tera / SKHP</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Surat Keterangan Hasil Pengujian untuk alat yang telah dinyatakan SAH.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3.5 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-semibold text-emerald-900">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Hasil Pengujian: SAH (Memenuhi Syarat Teknis)
            </div>
            <div className="text-slate-700 grid grid-cols-2 gap-1 pt-1">
              <div>
                <span className="text-slate-500">Perusahaan: </span>
                <span className="font-semibold">{permohonan.companyName}</span>
              </div>
              <div>
                <span className="text-slate-500">Alat: </span>
                <span className="font-semibold">{permohonan.instrumentBrand}</span>
              </div>
              <div>
                <span className="text-slate-500">Kapasitas: </span>
                <span>{permohonan.capacityValue} {permohonan.capacityUnit}</span>
              </div>
              <div>
                <span className="text-slate-500">No. Seri: </span>
                <span>{permohonan.instrumentSerial || "-"}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              Masa Berlaku Hingga (Tanggal Kedaluwarsa) <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register("expiryDate", { required: "Tanggal kedaluwarsa wajib diisi" })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700"
            />
            {errors.expiryDate && (
              <p className="text-xs text-red-500 mt-1">{errors.expiryDate.message}</p>
            )}
            <p className="text-[11px] text-slate-500 mt-1">
              Standar masa berlaku tera adalah 1 tahun terhitung sejak tanggal pengujian.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nomor Sertifikat (Opsional)
            </label>
            <Input
              {...register("certificateNumber")}
              placeholder="Kosongkan untuk nomor otomatis (misal: CERT-2026-A1B2C3D4)"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="bg-emerald-700 hover:bg-emerald-800 text-white">
              {loading ? "Menerbitkan..." : "Terbitkan Sertifikat Resmi"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
