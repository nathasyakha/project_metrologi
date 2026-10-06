import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import {
  createObservation,
  updatePermohonanStatus,
  type PermohonanPeneraan,
} from "@/lib/peneraan";
import { getErrorMessage } from "@/lib/api";
import { CheckCircle2, XCircle, Thermometer, Droplets } from "lucide-react";
import Swal from "sweetalert2";

interface InputCerapanModalProps {
  isOpen: boolean;
  onClose: () => void;
  permohonan: PermohonanPeneraan | null;
  onSuccess: () => void;
}

type FormValues = {
  status: "SAH" | "BATAL";
  suhu: number;
  kelembaban: number;
  bebanUji1: string;
  penunjukan1: string;
  deviasi1: string;
  bebanUji2: string;
  penunjukan2: string;
  deviasi2: string;
  bebanUji3: string;
  penunjukan3: string;
  deviasi3: string;
  ujiSudut: "SESUAI" | "TIDAK_SESUAI";
  kemampuanBalik: "SESUAI" | "TIDAK_SESUAI";
  kondisiFisik: "BAIK" | "RUSAK";
  catatanPetugas: string;
};

export function InputCerapanModal({
  isOpen,
  onClose,
  permohonan,
  onSuccess,
}: InputCerapanModalProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      status: "SAH",
      suhu: 26,
      kelembaban: 65,
      bebanUji1: "10",
      penunjukan1: "10.00",
      deviasi1: "0.00",
      bebanUji2: "50",
      penunjukan2: "50.01",
      deviasi2: "+0.01",
      bebanUji3: "100",
      penunjukan3: "100.00",
      deviasi3: "0.00",
      ujiSudut: "SESUAI",
      kemampuanBalik: "SESUAI",
      kondisiFisik: "BAIK",
      catatanPetugas: "Alat memenuhi syarat teknis metrologi dan toleransi BKD (Batas Kesalahan yang Diizinkan).",
    },
  });

  const selectedStatus = watch("status");

  if (!isOpen || !permohonan) return null;

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      // 1. Simpan cerapan pengujian
      const obs = await createObservation({
        instrumentId: permohonan.instrumentId,
        status: values.status,
        observationData: {
          kondisiLingkungan: {
            suhu: `${values.suhu} °C`,
            kelembaban: `${values.kelembaban} %`,
          },
          ujiKebenaran: [
            { beban: values.bebanUji1, penunjukan: values.penunjukan1, deviasi: values.deviasi1 },
            { beban: values.bebanUji2, penunjukan: values.penunjukan2, deviasi: values.deviasi2 },
            { beban: values.bebanUji3, penunjukan: values.penunjukan3, deviasi: values.deviasi3 },
          ],
          ujiTambahan: {
            eksentrisitas: values.ujiSudut,
            kemampuanBalik: values.kemampuanBalik,
            kondisiFisik: values.kondisiFisik,
          },
          catatanTeknis: values.catatanPetugas,
        },
      });

      // 2. Update status permohonan ke SELESAI dan tautkan testObservationId
      await updatePermohonanStatus(permohonan.id, {
        status: "SELESAI",
        testObservationId: obs.id,
        catatan: `Pengujian selesai oleh Petugas. Hasil: ${values.status}`,
      });

      Swal.fire({
        title: "Cerapan Berhasil Disimpan!",
        text: `Hasil pengujian: ${values.status === "SAH" ? "✅ SAH (Memenuhi Syarat)" : "❌ BATAL (Tidak Sah)"}. Permohonan kini siap untuk proses sertifikat.`,
        icon: values.status === "SAH" ? "success" : "warning",
      });

      onSuccess();
      onClose();
    } catch (error) {
      Swal.fire("Gagal!", getErrorMessage(error, "Terjadi kesalahan saat menyimpan cerapan."), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-xl my-8">
        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Input Cerapan Pengujian Peneraan</h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Alat: {permohonan.instrumentBrand} • Kapasitas: {permohonan.capacityValue} {permohonan.capacityUnit}
            </p>
          </div>
          <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-1 rounded">
            {permohonan.applicationNumber}
          </span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* IDENTITAS ALAT & PERUSAHAAN */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3.5 text-xs grid grid-cols-2 gap-2">
            <div>
              <span className="text-slate-500">Perusahaan: </span>
              <span className="font-semibold text-slate-900">{permohonan.companyName}</span>
            </div>
            <div>
              <span className="text-slate-500">Nomor Seri: </span>
              <span className="font-mono text-slate-900">{permohonan.instrumentSerial || "-"}</span>
            </div>
            <div>
              <span className="text-slate-500">Daya Baca (e / d): </span>
              <span className="font-medium text-slate-800">{permohonan.dayabaca} {permohonan.dayabacaUnit}</span>
            </div>
            <div>
              <span className="text-slate-500">Kelas Ketelitian: </span>
              <span className="font-medium text-slate-800">Kelas {permohonan.class}</span>
            </div>
          </div>

          {/* KONDISI LINGKUNGAN PENGUJIAN */}
          <div className="rounded-lg border border-slate-200 p-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              1. Kondisi Ruang Pengujian
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-600 mb-1 flex items-center gap-1">
                  <Thermometer className="h-3.5 w-3.5 text-amber-500" />
                  Suhu Ruang (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  {...register("suhu", { required: true })}
                  className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-navy-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1 flex items-center gap-1">
                  <Droplets className="h-3.5 w-3.5 text-blue-500" />
                  Kelembaban Udara (% RH)
                </label>
                <input
                  type="number"
                  step="1"
                  {...register("kelembaban", { required: true })}
                  className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-navy-700 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* TABEL PENGUJIAN KEBENARAN PENUNJUKAN */}
          <div className="rounded-lg border border-slate-200 p-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              2. Uji Kebenaran Skala Penunjukan (Titik Beban)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2">Titik Uji</th>
                    <th className="py-2">Beban Standar</th>
                    <th className="py-2">Penunjukan Alat</th>
                    <th className="py-2">Kesalahan / Deviasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2 font-medium">Beban Minimal (Min)</td>
                    <td className="py-2">
                      <input
                        {...register("bebanUji1")}
                        className="w-24 rounded border border-slate-200 px-2 py-1 text-xs"
                      />
                    </td>
                    <td className="py-2">
                      <input
                        {...register("penunjukan1")}
                        className="w-24 rounded border border-slate-200 px-2 py-1 text-xs"
                      />
                    </td>
                    <td className="py-2">
                      <input
                        {...register("deviasi1")}
                        className="w-24 rounded border border-slate-200 px-2 py-1 text-xs font-mono"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 font-medium">Beban 50% Kapasitas</td>
                    <td className="py-2">
                      <input
                        {...register("bebanUji2")}
                        className="w-24 rounded border border-slate-200 px-2 py-1 text-xs"
                      />
                    </td>
                    <td className="py-2">
                      <input
                        {...register("penunjukan2")}
                        className="w-24 rounded border border-slate-200 px-2 py-1 text-xs"
                      />
                    </td>
                    <td className="py-2">
                      <input
                        {...register("deviasi2")}
                        className="w-24 rounded border border-slate-200 px-2 py-1 text-xs font-mono"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 font-medium">Kapasitas Maksimum (Max)</td>
                    <td className="py-2">
                      <input
                        {...register("bebanUji3")}
                        className="w-24 rounded border border-slate-200 px-2 py-1 text-xs"
                      />
                    </td>
                    <td className="py-2">
                      <input
                        {...register("penunjukan3")}
                        className="w-24 rounded border border-slate-200 px-2 py-1 text-xs"
                      />
                    </td>
                    <td className="py-2">
                      <input
                        {...register("deviasi3")}
                        className="w-24 rounded border border-slate-200 px-2 py-1 text-xs font-mono"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* KEPUTUSAN AKHIR PETUGAS */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Keputusan Hasil Pengujian <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedStatus === "SAH"
                    ? "border-emerald-600 bg-emerald-50/50 text-emerald-950 font-semibold"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  value="SAH"
                  {...register("status")}
                  className="text-emerald-600 focus:ring-emerald-600"
                />
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-sm font-semibold">SAH (Memenuhi Syarat)</p>
                  <p className="text-xs text-slate-500 font-normal">
                    Dapat diterbitkan Sertifikat / SKHP
                  </p>
                </div>
              </label>

              <label
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedStatus === "BATAL"
                    ? "border-red-600 bg-red-50/50 text-red-950 font-semibold"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  value="BATAL"
                  {...register("status")}
                  className="text-red-600 focus:ring-red-600"
                />
                <XCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-semibold">BATAL (Tidak Memenuhi Syarat)</p>
                  <p className="text-xs text-slate-500 font-normal">
                    Alat tidak diperkenankan bertanda tera sah
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan Rekomendasi Petugas Penera
            </label>
            <textarea
              {...register("catatanPetugas")}
              rows={2}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              variant={selectedStatus === "BATAL" ? "danger" : "primary"}
            >
              {loading ? "Menyimpan..." : "Simpan Cerapan Pengujian"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
