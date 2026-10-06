import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  createInstrument,
  updateInstrument,
  capacityUnits,
  instrumentClasses,
  jenisAlatUttpList,
  jenisAlatLabel,
  type CapacityUnit,
  type InstrumentClass,
  type InstrumentOwner,
  type Instrument,
  type JenisAlatUttp,
} from "@/lib/peneraan";
import { getErrorMessage } from "@/lib/api";
import Swal from "sweetalert2";

interface InstrumentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  owners: InstrumentOwner[];
  defaultOwnerId?: string;
  existingInstrument?: Instrument | null;   // ⬅️ TAMBAHAN — kalau ada, jadi mode edit
  onSuccess: (newInstrumentId?: string) => void;
}

type FormValues = {
  ownerId: string;
  jenisAlat: JenisAlatUttp;
  brand: string;
  type: string;
  serialNumber: string;
  capacityValue: number;
  capacityUnit: CapacityUnit;
  dayabaca: number;
  dayabacaUnit: CapacityUnit;
  class: InstrumentClass;
};

export function InstrumentFormModal({
  isOpen,
  onClose,
  owners,
  defaultOwnerId,
  existingInstrument,
  onSuccess,
}: InstrumentFormModalProps) {
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(existingInstrument);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      ownerId: defaultOwnerId ?? (owners[0]?.id || ""),
      jenisAlat: "TIMBANGAN_ELEKTRONIK",
      brand: "",
      type: "",
      serialNumber: "",
      capacityValue: 100,
      capacityUnit: "kg",
      dayabaca: 0.05,
      dayabacaUnit: "kg",
      class: "III",
    },
  });

  // Isi ulang form kalau buka modal dalam mode edit
  useEffect(() => {
    if (isOpen && existingInstrument) {
      reset({
        ownerId: existingInstrument.ownerId,
        jenisAlat: existingInstrument.jenisAlat,
        brand: existingInstrument.brand,
        type: existingInstrument.type ?? "",
        serialNumber: existingInstrument.serialNumber ?? "",
        capacityValue: Number(existingInstrument.capacityValue),
        capacityUnit: existingInstrument.capacityUnit,
        dayabaca: Number(existingInstrument.dayabaca),
        dayabacaUnit: existingInstrument.dayabacaUnit,
        class: existingInstrument.class,
      });
    } else if (isOpen && !existingInstrument) {
      reset({
        ownerId: defaultOwnerId ?? (owners[0]?.id || ""),
        jenisAlat: "TIMBANGAN_ELEKTRONIK",
        brand: "",
        type: "",
        serialNumber: "",
        capacityValue: 100,
        capacityUnit: "kg",
        dayabaca: 0.05,
        dayabacaUnit: "kg",
        class: "III",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, existingInstrument]);

  if (!isOpen) return null;

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      if (isEdit && existingInstrument) {
        await updateInstrument(existingInstrument.id, {
          jenisAlat: values.jenisAlat,
          brand: values.brand,
          type: values.type,
          serialNumber: values.serialNumber,
          capacityValue: Number(values.capacityValue),
          capacityUnit: values.capacityUnit,
          dayabaca: Number(values.dayabaca),
          dayabacaUnit: values.dayabacaUnit,
          class: values.class,
        });

        Swal.fire({ title: "Berhasil!", text: "Data alat ukur berhasil diperbarui.", icon: "success", timer: 1500, showConfirmButton: false });
        onSuccess(existingInstrument.id);
      } else {
        const created = await createInstrument({
          ...values,
          capacityValue: Number(values.capacityValue),
          dayabaca: Number(values.dayabaca),
        });

        Swal.fire({ title: "Berhasil!", text: "Alat ukur berhasil didaftarkan.", icon: "success", timer: 1500, showConfirmButton: false });
        onSuccess(created.id);
      }

      reset();
      onClose();
    } catch (error) {
      Swal.fire("Gagal!", getErrorMessage(error, "Terjadi kesalahan saat menyimpan data alat."), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl my-8">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {isEdit ? "Edit Data Alat Ukur (UTTP)" : "Daftarkan Alat Ukur Baru (UTTP)"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registrasi spesifikasi alat ukur, takar, timbang dan perlengkapannya.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Perusahaan / Pemilik <span className="text-red-500">*</span>
            </label>
            <select
              {...register("ownerId", { required: "Pemilik alat wajib dipilih" })}
              disabled={!!defaultOwnerId || isEdit}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700 disabled:bg-slate-100"
            >
              {owners.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.companyName}
                </option>
              ))}
            </select>
            {errors.ownerId && <p className="text-xs text-red-500 mt-1">{errors.ownerId.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Jenis Alat <span className="text-red-500">*</span>
            </label>
            <select
              {...register("jenisAlat", { required: "Jenis alat wajib dipilih" })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700"
            >
              {jenisAlatUttpList.map((j) => (
                <option key={j} value={j}>
                  {jenisAlatLabel[j]}
                </option>
              ))}
            </select>
            {errors.jenisAlat && <p className="text-xs text-red-500 mt-1">{errors.jenisAlat.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Merek Alat <span className="text-red-500">*</span>
              </label>
              <Input {...register("brand", { required: "Merk wajib diisi" })} placeholder="Contoh: Mettler Toledo" />
              {errors.brand && <p className="text-xs text-red-500 mt-1">{errors.brand.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tipe / Model Alat</label>
              <Input {...register("type")} placeholder="Contoh: Timbangan Elektronik" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor Seri</label>
              <Input {...register("serialNumber")} placeholder="Contoh: SN-2024-8891" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kelas Ketelitian <span className="text-red-500">*</span>
              </label>
              <select
                {...register("class", { required: "Kelas wajib dipilih" })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700"
              >
                {instrumentClasses.map((cls) => (
                  <option key={cls} value={cls}>Kelas {cls}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kapasitas Maksimum <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <Input type="number" step="any" {...register("capacityValue", { required: "Kapasitas wajib diisi", min: 0 })} placeholder="100" />
                <select {...register("capacityUnit")} className="rounded-md border border-slate-300 px-2 py-2 text-sm font-medium bg-slate-50 focus:border-navy-700 focus:outline-none">
                  {capacityUnits.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Daya Baca / Skala (d / e) <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <Input type="number" step="any" {...register("dayabaca", { required: "Daya baca wajib diisi", min: 0 })} placeholder="0.05" />
                <select {...register("dayabacaUnit")} className="rounded-md border border-slate-300 px-2 py-2 text-sm font-medium bg-slate-50 focus:border-navy-700 focus:outline-none">
                  {capacityUnits.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>Batal</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Daftarkan Alat"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}