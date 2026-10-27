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
import { Plus, X } from "lucide-react";
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
  const [selectedInstrumentIds, setSelectedInstrumentIds] = useState<string[]>([]);
  const [instrumentToAdd, setInstrumentToAdd] = useState("");

  const initialOwnerId = defaultOwnerId || (owners[0]?.id ?? "");

  const {
    register,
    handleSubmit,
    watch,
    formState: { },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      ownerId: initialOwnerId,
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
    setSelectedInstrumentIds([]);
    setInstrumentToAdd("");
  }, [selectedOwnerId]);

  useEffect(() => {
    const availableIds = new Set(
      filteredInstruments.map((inst) => inst.id)
    );

    setSelectedInstrumentIds((current) => {
      const validIds = current.filter((id) => availableIds.has(id));

      if (validIds.length > 0) return validIds;

      const firstInstrument = filteredInstruments[0];
      return firstInstrument ? [firstInstrument.id] : [];
    });
  }, [selectedOwnerId, instruments]);

  if (!isOpen) return null;


  const onSubmit = async (values: FormValues) => {
    if (selectedInstrumentIds.length === 0) {
      Swal.fire(
        "Perhatian",
        "Silakan pilih minimal satu alat ukur.",
        "warning"
      );
      return;
    }

    setLoading(true);

    try {
      await createPermohonan({
        ownerId: values.ownerId,
        instrumentIds: selectedInstrumentIds,
        layanan: values.layanan,
        lokasi: values.lokasi,
        catatan: values.catatan || undefined,
        jadwalTanggal: values.jadwalTanggal
          ? new Date(values.jadwalTanggal).toISOString()
          : undefined,
        petugasId: values.petugasId || undefined,
      });

      await Swal.fire({
        title: "Berhasil!",
        text: isAdmin && values.jadwalTanggal
          ? `Permohonan dengan ${selectedInstrumentIds.length} alat berhasil didaftarkan dan dijadwalkan.`
          : `Permohonan dengan ${selectedInstrumentIds.length} alat berhasil diajukan.`,
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
      });

      reset();
      setSelectedInstrumentIds([]);
      setInstrumentToAdd("");
      onSuccess();
      onClose();
    } catch (error) {
      Swal.fire(
        "Gagal!",
        getErrorMessage(
          error,
          "Terjadi kesalahan saat mengajukan permohonan."
        ),
        "error"
      );
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
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-700">
                Alat Ukur yang Diajukan <span className="text-red-500">*</span>
              </label>

              <button
                type="button"
                onClick={() => onOpenCreateInstrument(selectedOwnerId)}
                disabled={!selectedOwnerId}
                className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                <Plus className="h-3 w-3 mr-0.5" />
                Daftarkan Alat Baru
              </button>
            </div>

            {filteredInstruments.length === 0 ? (
              <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50/60 p-3 text-xs text-amber-800">
                Belum ada alat ukur terdaftar untuk pemilik ini.
                Silakan daftarkan alat terlebih dahulu.
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {selectedInstrumentIds.map((id, index) => {
                    const inst = filteredInstruments.find(
                      (item) => item.id === id
                    );

                    if (!inst) return null;

                    return (
                      <div
                        key={id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800">
                            Alat {index + 1}: {inst.brand}
                          </p>
                          <p className="text-xs text-slate-600">
                            {inst.jenisAlat.replaceAll("_", " ")}
                            {inst.type ? ` · Tipe ${inst.type}` : ""}
                          </p>
                          <p className="text-xs text-slate-500">
                            Nomor seri: {inst.serialNumber || "-"}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedInstrumentIds((current) =>
                              current.filter((itemId) => itemId !== id)
                            )
                          }
                          className="shrink-0 rounded-md p-1.5 text-red-600 hover:bg-red-50"
                          aria-label={`Hapus alat ${inst.brand}`}
                          title="Hapus alat"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <select
                    value={instrumentToAdd}
                    onChange={(event) => setInstrumentToAdd(event.target.value)}
                    className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-navy-700 focus:outline-none"
                  >
                    <option value="">-- Pilih alat untuk ditambahkan --</option>

                    {filteredInstruments
                      .filter(
                        (inst) => !selectedInstrumentIds.includes(inst.id)
                      )
                      .map((inst) => (
                        <option key={inst.id} value={inst.id}>
                          {inst.brand}
                          {inst.type ? ` (${inst.type})` : ""}
                          {" - "}
                          {inst.serialNumber || "Tanpa nomor seri"}
                        </option>
                      ))}
                  </select>

                  <Button
                    type="button"
                    variant="secondary"
                    disabled={
                      !instrumentToAdd ||
                      selectedInstrumentIds.includes(instrumentToAdd)
                    }
                    onClick={() => {
                      if (!instrumentToAdd) return;

                      setSelectedInstrumentIds((current) =>
                        current.includes(instrumentToAdd)
                          ? current
                          : [...current, instrumentToAdd]
                      );

                      setInstrumentToAdd("");
                    }}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Tambah
                  </Button>
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  {selectedInstrumentIds.length} alat dipilih.
                  Semua alat harus berasal dari pemilik yang sama.
                </p>
              </>
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
            <Button
              type="submit"
              disabled={loading || selectedInstrumentIds.length === 0}
            >
              {loading ? "Memproses..." : "Ajukan Permohonan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
