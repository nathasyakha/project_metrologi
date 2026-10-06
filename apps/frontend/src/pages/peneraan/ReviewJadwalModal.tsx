import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  reviewPermohonanJadwal,
  statusPermohonanLabel,
  statusPermohonanTone,
  layananLabel,
  lokasiLabel,
  type PermohonanPeneraan,
} from "@/lib/peneraan";
import { getErrorMessage } from "@/lib/api";
import { Calendar, UserCheck, XCircle, CheckCircle2 } from "lucide-react";
import Swal from "sweetalert2";

interface ReviewJadwalModalProps {
  isOpen: boolean;
  onClose: () => void;
  permohonan: PermohonanPeneraan | null;
  inspectors: { id: string; name: string; email?: string }[];
  onSuccess: () => void;
}

type FormValues = {
  status: "DIJADWALKAN" | "DITOLAK" | "MENUNGGU_VERIFIKASI";
  jadwalTanggal?: string;
  petugasId?: string;
  catatan?: string;
};

export function ReviewJadwalModal({
  isOpen,
  onClose,
  permohonan,
  inspectors,
  onSuccess,
}: ReviewJadwalModalProps) {
  const [loading, setLoading] = useState(false);

  // Format tanggal existing ke format input datetime-local (YYYY-MM-DDTHH:mm)
  const defaultJadwal = permohonan?.jadwalTanggal
    ? new Date(permohonan.jadwalTanggal).toISOString().slice(0, 16)
    : "";

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      status: "DIJADWALKAN",
      jadwalTanggal: defaultJadwal,
      petugasId: permohonan?.petugasId ?? "",
      catatan: permohonan?.catatan ?? "",
    },
  });

  const selectedStatus = watch("status");

  if (!isOpen || !permohonan) return null;

  const onSubmit = async (values: FormValues) => {
    if (values.status === "DIJADWALKAN" && (!values.jadwalTanggal || !values.petugasId)) {
      Swal.fire(
        "Perhatian",
        "Harap tentukan tanggal pelaksanaan tera dan petugas penera yang ditugaskan",
        "warning"
      );
      return;
    }

    setLoading(true);
    try {
      await reviewPermohonanJadwal(permohonan.id, {
        status: values.status,
        jadwalTanggal: values.jadwalTanggal ? new Date(values.jadwalTanggal).toISOString() : undefined,
        petugasId: values.petugasId || undefined,
        catatan: values.catatan || undefined,
      });

      Swal.fire({
        title: "Berhasil!",
        text:
          values.status === "DIJADWALKAN"
            ? "Permohonan telah dijadwalkan & petugas berhasil ditugaskan."
            : "Status permohonan berhasil diperbarui.",
        icon: "success",
        timer: 1600,
        showConfirmButton: false,
      });

      onSuccess();
      onClose();
    } catch (error) {
      Swal.fire("Gagal!", getErrorMessage(error, "Terjadi kesalahan saat memproses permohonan."), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl my-8">
        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Peninjauan & Penjadwalan Tera</h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{permohonan.applicationNumber}</p>
          </div>
          <Badge tone={statusPermohonanTone[permohonan.status]}>
            {statusPermohonanLabel[permohonan.status]}
          </Badge>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* RINGKASAN PERMOHONAN */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Pemilik / Perusahaan:</span>
              <span className="font-semibold text-slate-900">{permohonan.companyName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Alat Ukur:</span>
              <span className="font-semibold text-slate-900">
                {permohonan.instrumentBrand} {permohonan.instrumentType ? `(${permohonan.instrumentType})` : ""}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Kapasitas / Kelas:</span>
              <span className="font-medium text-slate-800">
                {permohonan.capacityValue} {permohonan.capacityUnit} (Kelas {permohonan.class})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Layanan & Lokasi:</span>
              <span className="font-medium text-slate-800">
                {layananLabel[permohonan.layanan]} • {lokasiLabel[permohonan.lokasi]}
              </span>
            </div>
            {permohonan.catatan && (
              <div className="pt-2 border-t border-slate-200 text-slate-600 italic">
                "{permohonan.catatan}"
              </div>
            )}
          </div>

          {/* KEPUTUSAN STATUS */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Keputusan Peninjauan <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedStatus === "DIJADWALKAN"
                    ? "border-navy-900 bg-navy-50/50 text-navy-900 font-semibold"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  value="DIJADWALKAN"
                  {...register("status")}
                  className="text-navy-900 focus:ring-navy-900"
                />
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <span className="text-xs">Setujui & Jadwalkan</span>
              </label>

              <label
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedStatus === "DITOLAK"
                    ? "border-red-600 bg-red-50/50 text-red-900 font-semibold"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  value="DITOLAK"
                  {...register("status")}
                  className="text-red-600 focus:ring-red-600"
                />
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-xs">Tolak Permohonan</span>
              </label>
            </div>
          </div>

          {/* FORM JADWAL & PETUGAS (JIKA DIJADWALKAN) */}
          {selectedStatus === "DIJADWALKAN" && (
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Tanggal & Jam Pelaksanaan Tera <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  {...register("jadwalTanggal", { required: selectedStatus === "DIJADWALKAN" })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700"
                />
                {errors.jadwalTanggal && (
                  <p className="text-xs text-red-500 mt-1">Tanggal jadwal wajib diisi</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                  Petugas Penera yang Ditugaskan <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("petugasId", { required: selectedStatus === "DIJADWALKAN" })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700"
                >
                  <option value="">-- Pilih Petugas Penera --</option>
                  {inspectors.map((ins) => (
                    <option key={ins.id} value={ins.id}>
                      {ins.name} {ins.email ? `(${ins.email})` : ""}
                    </option>
                  ))}
                </select>
                {errors.petugasId && (
                  <p className="text-xs text-red-500 mt-1">Petugas penera wajib dipilih</p>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {selectedStatus === "DITOLAK" ? "Alasan Penolakan *" : "Catatan / Arahan Teknis"}
            </label>
            <textarea
              {...register("catatan", {
                required: selectedStatus === "DITOLAK" ? "Alasan penolakan wajib dituliskan" : false,
              })}
              rows={3}
              placeholder={
                selectedStatus === "DITOLAK"
                  ? "Tuliskan alasan penolakan agar pemohon dapat memperbaiki dokumen..."
                  : "Contoh: Bawa anak timbangan standar M1 kapasitas 50kg..."
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700"
            />
            {errors.catatan && (
              <p className="text-xs text-red-500 mt-1">{errors.catatan.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              variant={selectedStatus === "DITOLAK" ? "danger" : "primary"}
            >
              {loading ? "Menyimpan..." : selectedStatus === "DITOLAK" ? "Tolak Permohonan" : "Simpan Jadwal & Tugaskan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
