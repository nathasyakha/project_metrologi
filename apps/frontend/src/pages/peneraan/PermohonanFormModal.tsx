import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import {
  createPermohonan,
  jenisLayananList,
  layananLabel,
  lokasiList,
  lokasiLabel,
  type Instrument,
  type InstrumentOwner,
  type JenisLayanan,
  type LokasiPeneraan,
  type PermohonanPeneraan,
} from "@/lib/peneraan";
import { getErrorMessage } from "@/lib/api";
import { Plus } from "lucide-react";
import Swal from "sweetalert2";

interface PermohonanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingPermohonan?: PermohonanPeneraan | null;
  isAdmin: boolean;
  owners: InstrumentOwner[];
  instruments: Instrument[];
  inspectors: { id: string; name: string }[];
  defaultOwnerId?: string;
  onOpenCreateInstrument: (ownerId: string) => void;
  onSuccess: () => void;
}

type FormValues = {
  ownerId: string;
  instrumentId: string;
  layanan: JenisLayanan;
  lokasi: LokasiPeneraan;
  catatan?: string;
  jadwalTanggal?: string;
  petugasId?: string;
};

export function PermohonanFormModal({
  isOpen,
  onClose,
  isAdmin,
  owners,
  instruments,
  inspectors,
  defaultOwnerId,
  onOpenCreateInstrument,
  onSuccess,
}: PermohonanFormModalProps) {
  const [loading, setLoading] = useState(false);

  const initialOwnerId = defaultOwnerId || (owners[0]?.id ?? "");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      ownerId: initialOwnerId,
      instrumentId: "",
      layanan: "TERA_ULANG",
      lokasi: "KANTOR",
      catatan: "",
      jadwalTanggal: "",
      petugasId: "",
    },
  });

  const selectedOwnerId = watch("ownerId");

  // Filter alat ukur yang dimiliki oleh owner yang dipilih
  const filteredInstruments = instruments.filter((inst) => inst.ownerId === selectedOwnerId);

  useEffect(() => {
    if (defaultOwnerId) {
      setValue("ownerId", defaultOwnerId);
    }
  }, [defaultOwnerId, setValue]);

  useEffect(() => {
    if (filteredInstruments.length > 0 && !filteredInstruments.some(i => i.id === watch("instrumentId"))) {
      setValue("instrumentId", filteredInstruments[0].id);
    }
  }, [selectedOwnerId, filteredInstruments, setValue, watch]);

  if (!isOpen) return null;

  const onSubmit = async (values: FormValues) => {
    if (!values.instrumentId) {
      Swal.fire("Perhatian", "Silakan pilih alat ukur terlebih dahulu", "warning");
      return;
    }

    setLoading(true);
    try {
      await createPermohonan({
        ownerId: values.ownerId,
        instrumentId: values.instrumentId,
        layanan: values.layanan,
        lokasi: values.lokasi,
        catatan: values.catatan || undefined,
        jadwalTanggal: values.jadwalTanggal ? new Date(values.jadwalTanggal).toISOString() : undefined,
        petugasId: values.petugasId || undefined,
      });

      Swal.fire({
        title: "Berhasil!",
        text: isAdmin && values.jadwalTanggal
          ? "Permohonan berhasil didaftarkan dan langsung dijadwalkan."
          : "Permohonan peneraan berhasil diajukan. Menunggu verifikasi admin.",
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
      });

      reset();
      onSuccess();
      onClose();
    } catch (error) {
      Swal.fire("Gagal!", getErrorMessage(error, "Terjadi kesalahan saat mengajukan permohonan."), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl my-8">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {isAdmin ? "Pendaftaran Peneraan (Loket / Offline)" : "Ajukan Permohonan Peneraan Baru"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAdmin
              ? "Input registrasi pemilik, alat, dan langsung tentukan jadwal serta petugas penera."
              : "Isi data permohonan pengujian alat ukur untuk diverifikasi petugas."}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* PEMILIH PEMILIK / PERUSAHAAN */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pemilik / Perusahaan <span className="text-red-500">*</span>
            </label>
            <select
              {...register("ownerId", { required: "Pemilik alat wajib dipilih" })}
              disabled={!isAdmin && !!defaultOwnerId}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700 disabled:bg-slate-100"
            >
              {owners.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.companyName}
                </option>
              ))}
            </select>
          </div>

          {/* PEMILIH ALAT UKUR */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Alat Ukur yang Diajukan <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => onOpenCreateInstrument(selectedOwnerId)}
                className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800"
              >
                <Plus className="h-3 w-3 mr-0.5" /> Daftarkan Alat Baru
              </button>
            </div>

            {filteredInstruments.length === 0 ? (
              <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50/60 p-3 text-xs text-amber-800">
                Belum ada data alat ukur terdaftar untuk pemilik ini. Silakan klik{" "}
                <strong
                  onClick={() => onOpenCreateInstrument(selectedOwnerId)}
                  className="cursor-pointer underline"
                >
                  Daftarkan Alat Baru
                </strong>{" "}
                terlebih dahulu.
              </div>
            ) : (
              <select
                {...register("instrumentId", { required: "Alat ukur wajib dipilih" })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700"
              >
                {filteredInstruments.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.brand} {inst.type ? `(${inst.type})` : ""} - Kap: {inst.capacityValue} {inst.capacityUnit} (Kelas {inst.class})
                  </option>
                ))}
              </select>
            )}
            {errors.instrumentId && (
              <p className="text-xs text-red-500 mt-1">{errors.instrumentId.message}</p>
            )}
          </div>

          {/* JENIS LAYANAN & LOKASI */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jenis Layanan <span className="text-red-500">*</span>
              </label>
              <select
                {...register("layanan")}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700"
              >
                {jenisLayananList.map((j) => (
                  <option key={j} value={j}>
                    {layananLabel[j]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lokasi Pengujian <span className="text-red-500">*</span>
              </label>
              <select
                {...register("lokasi")}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700"
              >
                {lokasiList.map((l) => (
                  <option key={l} value={l}>
                    {lokasiLabel[l]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* JIKA ADMIN (SKEMA 2 OFFLINE): BISA LANGSUNG TENTUKAN JADWAL & PETUGAS */}
          {isAdmin && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 space-y-3">
              <p className="text-xs font-semibold text-navy-900">
                Disposisi Langsung (Khusus Admin):
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Tanggal & Jam Sidang/Tera</label>
                  <input
                    type="datetime-local"
                    {...register("jadwalTanggal")}
                    className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs bg-white focus:border-navy-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Petugas Penera</label>
                  <select
                    {...register("petugasId")}
                    className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs bg-white focus:border-navy-700 focus:outline-none"
                  >
                    <option value="">-- Pilih Petugas --</option>
                    {inspectors.map((ins) => (
                      <option key={ins.id} value={ins.id}>
                        {ins.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan Tambahan</label>
            <textarea
              {...register("catatan")}
              rows={2}
              placeholder="Contoh: Jadwal operasional pabrik atau permintaan khusus"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" disabled={loading || filteredInstruments.length === 0}>
              {loading ? "Memproses..." : "Ajukan Permohonan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
