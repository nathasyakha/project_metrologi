import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import {
    editPermohonan,
    jenisLayananList,
    layananLabel,
    lokasiList,
    lokasiLabel,
    type PermohonanPeneraan,
    type JenisLayanan,
    type LokasiPeneraan,
} from "@/lib/peneraan";
import { getErrorMessage } from "@/lib/api";
import Swal from "sweetalert2";

interface EditPermohonanModalProps {
    isOpen: boolean;
    onClose: () => void;
    permohonan: PermohonanPeneraan | null;
    onSuccess: () => void;
}

type FormValues = {
    layanan: JenisLayanan;
    lokasi: LokasiPeneraan;
    catatan: string;
};

export function EditPermohonanModal({ isOpen, onClose, permohonan, onSuccess }: EditPermohonanModalProps) {
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, reset } = useForm<FormValues>();

    useEffect(() => {
        if (isOpen && permohonan) {
            reset({
                layanan: permohonan.layanan,
                lokasi: permohonan.lokasi,
                catatan: permohonan.catatan ?? "",
            });
        }
    }, [isOpen, permohonan, reset]);

    if (!isOpen || !permohonan) return null;

    const onSubmit = async (values: FormValues) => {
        setLoading(true);
        try {
            await editPermohonan(permohonan.id, values);
            Swal.fire({ title: "Berhasil!", text: "Permohonan berhasil diperbarui.", icon: "success", timer: 1500, showConfirmButton: false });
            onSuccess();
            onClose();
        } catch (error) {
            Swal.fire("Gagal!", getErrorMessage(error, "Gagal memperbarui permohonan."), "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-xl">
                <div className="border-b border-slate-100 px-6 py-4">
                    <h2 className="text-lg font-semibold text-slate-900">Edit Permohonan</h2>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono">{permohonan.applicationNumber}</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Layanan</label>
                        <select {...register("layanan")} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-navy-700 focus:outline-none">
                            {jenisLayananList.map((l) => <option key={l} value={l}>{layananLabel[l]}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Lokasi</label>
                        <select {...register("lokasi")} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-navy-700 focus:outline-none">
                            {lokasiList.map((l) => <option key={l} value={l}>{lokasiLabel[l]}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan</label>
                        <textarea
                            {...register("catatan")}
                            rows={3}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-navy-700 focus:outline-none"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                        <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>Batal</Button>
                        <Button type="submit" disabled={loading}>{loading ? "Menyimpan..." : "Simpan Perubahan"}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}