import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Search, CheckCircle2, UserX } from "lucide-react";
import { jenisAlatLabel } from "@/lib/peneraan";
import Swal from "sweetalert2";

// --- 1. SKEMA VALIDASI ZOD ---
// Sesuaikan array enum ini dengan database Drizzle Anda
const capacityUnits = ["kg", "g", "mg", "L", "mL", "m", "cm"] as const;
const jenisLayanan = ["TERA", "TERA_ULANG"] as const;
const lokasiPeneraan = ["KANTOR", "TEMPAT_PAKAI"] as const;
const kelasAlat = ["I", "II", "III", "IIII"] as const;
const jenisAlatUttp = [
    "TIMBANGAN_ELEKTRONIK",
    "TIMBANGAN_MEJA",
    "TIMBANGAN_JEMBATAN",
    "DACIN",
    "TIMBANGAN_PEGAS",
    "TIMBANGAN_SENTISIMAL",
    "TIMBANGAN_BOBOT_INGSUT",
    "NERACA_EMAS",
    "NERACA_OBAT",
    "POMPA_UKUR_BBM",
    "METER_AIR",
    "METER_KWH",
    "ANAK_TIMBANGAN"
] as const;

const registrasiSchema = z.object({
    // Pemilik
    ownerId: z.string().optional(),
    companyName: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),

    // Alat Ukur
    jenisAlat: z.enum(jenisAlatUttp, { required_error: "Jenis alat wajib dipilih" }),
    brand: z.string().min(1, "Merek wajib diisi"),
    type: z.string().optional(),
    serialNumber: z.string().optional(),
    capacityValue: z.coerce.number({ invalid_type_error: "Kapasitas wajib angka" }).min(0),
    capacityUnit: z.enum(capacityUnits, { required_error: "Satuan wajib dipilih" }),
    dayabaca: z.coerce.number({ invalid_type_error: "Daya baca wajib angka" }).min(0),
    dayabacaUnit: z.enum(capacityUnits, { required_error: "Satuan wajib dipilih" }),
    class: z.enum(kelasAlat, { required_error: "Kelas wajib dipilih" }),

    // Permohonan
    layanan: z.enum(jenisLayanan),
    lokasi: z.enum(lokasiPeneraan),
    jadwalTanggal: z.string().min(1, "Tanggal wajib diisi"),
    petugasId: z.string().min(1, "Petugas wajib dipilih"),
    catatan: z.string().optional(),
}).refine(
    (data) => {
        // Validasi Bersyarat: Jika ownerId kosong, maka form manual WAJIB diisi
        if (!data.ownerId) {
            return !!data.companyName && !!data.address && !!data.phone;
        }
        return true;
    },
    {
        message: "Lengkapi data pemilik baru (Nama, Alamat, No. HP) jika tidak memilih dari daftar",
        path: ["companyName"],
    }
);

type RegistrasiFormData = z.infer<typeof registrasiSchema>;

interface RegistrasiOfflineFormProps {
    isOpen: boolean;
    onClose: () => void;
    inspectors: any[];
}

export function RegistrasiOfflineForm({ isOpen, onClose, inspectors }: RegistrasiOfflineFormProps) {
    const queryClient = useQueryClient();

    // State untuk fitur pencarian pemilik
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedOwner, setSelectedOwner] = useState<any | null>(null);

    // Debounce pencarian agar tidak spam request ke backend
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch pencarian pemilik
    const { data: searchResults, isFetching: isSearching } = useQuery({
        queryKey: ["owners-search", debouncedSearch],
        queryFn: async () => {
            if (!debouncedSearch) return [];
            const res = await fetch(`http://localhost:3000/owners?search=${debouncedSearch}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            const json = await res.json();
            return json.data || [];
        },
        enabled: debouncedSearch.length > 2,
    });

    const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<RegistrasiFormData>({
        resolver: zodResolver(registrasiSchema),
        defaultValues: {
            layanan: "TERA_ULANG",
            lokasi: "KANTOR",
        }
    });

    // Reset semua ketika modal ditutup
    useEffect(() => {
        if (!isOpen) {
            reset();
            setSearchTerm("");
            setSelectedOwner(null);
        }
    }, [isOpen, reset]);

    // Fungsi Pilih Pemilik
    const handleSelectOwner = (owner: any) => {
        setSelectedOwner(owner);
        setValue("ownerId", owner.id);
        setValue("companyName", owner.companyName); // Optional: isi form di belakang layar
        setSearchTerm("");
    };

    // Fungsi Batal Pilih Pemilik
    const handleClearOwner = () => {
        setSelectedOwner(null);
        setValue("ownerId", "");
        setValue("companyName", "");
    };

    // Mutasi Submit Data Gabungan
    const mutation = useMutation({
        mutationFn: async (values: RegistrasiFormData) => {
            const res = await fetch("http://localhost:3000/permohonan/offline", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(values),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Gagal menyimpan permohonan");
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["peneraan-applications"] });
            Swal.fire({
                title: "Berhasil!",
                text: "Registrasi offline berhasil disimpan.",
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
            });
            onClose();
        },
        onError: (error: any) => {
            Swal.fire("Gagal", error.message, "error");
        },
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 pointer-events-auto backdrop-blur-sm">
            <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col relative z-10 animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50 rounded-t-xl shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Registrasi Peneraan (Offline)</h2>
                        <p className="text-xs text-slate-500">Daftarkan pemilik, alat, dan jadwal sekaligus.</p>
                    </div>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 bg-white rounded-md border border-slate-200 shadow-sm transition-colors cursor-pointer">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body Form (Scrollable) */}
                <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* --- BAGIAN 1: DATA PEMILIK --- */}
                    <section className="bg-slate-50/50 p-5 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                <span className="bg-navy-900 text-white w-6 h-6 flex items-center justify-center rounded-full text-xs">1</span>
                                Data Pemilik Alat
                            </h3>
                        </div>

                        {selectedOwner ? (
                            // Jika Pemilik Sudah Terpilih
                            <div className="flex items-center justify-between bg-white border border-green-200 p-4 rounded-lg shadow-sm">
                                <div>
                                    <p className="flex items-center gap-1.5 font-semibold text-slate-900">
                                        <CheckCircle2 className="w-4 h-4 text-green-600" /> {selectedOwner.companyName}
                                    </p>
                                    <p className="text-sm text-slate-500 mt-1">{selectedOwner.phone} — {selectedOwner.address}</p>
                                </div>
                                <button type="button" onClick={handleClearOwner} className="text-xs text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-md font-medium">
                                    Batal Pilih
                                </button>
                            </div>
                        ) : (
                            // Jika Belum Terpilih -> Tampilkan Pencarian & Form Input Baru
                            <div className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Cari Pemilik (Ketik Nama / No. HP)..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:border-navy-600 focus:ring-1 focus:ring-navy-600 bg-white"
                                    />
                                    {/* Dropdown Pencarian */}
                                    {searchTerm.length > 2 && (
                                        <div className="absolute w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-20 max-h-48 overflow-y-auto">
                                            {isSearching ? (
                                                <p className="p-3 text-sm text-slate-500 text-center">Mencari...</p>
                                            ) : searchResults?.length > 0 ? (
                                                searchResults.map((owner: any) => (
                                                    <div key={owner.id} onClick={() => handleSelectOwner(owner)} className="p-3 hover:bg-slate-50 border-b border-slate-100 cursor-pointer">
                                                        <p className="font-medium text-sm text-slate-800">{owner.companyName}</p>
                                                        <p className="text-xs text-slate-500">{owner.phone}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="p-3 text-sm text-slate-500 text-center flex items-center justify-center gap-2">
                                                    <UserX className="w-4 h-4" /> Tidak ditemukan. Silakan isi form di bawah.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200 border-dashed mt-4">
                                    <div className="md:col-span-2">
                                        <p className="text-xs font-medium text-slate-500 mb-3">Atau daftarkan pemilik baru:</p>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Perusahaan / Pemilik</label>
                                        <input type="text" {...register("companyName")} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:border-navy-600 focus:ring-1 focus:ring-navy-600 bg-white" />
                                        {errors.companyName && <p className="text-xs text-red-500 mt-1">{errors.companyName.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">No. Telepon / WA</label>
                                        <input type="text" {...register("phone")} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:border-navy-600 focus:ring-1 focus:ring-navy-600 bg-white" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Lengkap</label>
                                        <input type="text" {...register("address")} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:border-navy-600 focus:ring-1 focus:ring-navy-600 bg-white" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* --- BAGIAN 2: DATA ALAT UKUR --- */}
                    <section className="bg-slate-50/50 p-5 rounded-xl border border-slate-200">
                        <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
                            <span className="bg-navy-900 text-white w-6 h-6 flex items-center justify-center rounded-full text-xs">2</span>
                            Identitas Alat Ukur Baru
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Alat (Kategori)</label>
                                <select
                                    {...register("jenisAlat")}
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:border-navy-600 focus:ring-1 focus:ring-navy-600"
                                >
                                    <option value="">
                                        -- Pilih Jenis UTTP --
                                    </option>
                                    {Object.entries(jenisAlatLabel).map(
                                        ([value, label]) => (
                                            <option
                                                key={value}
                                                value={value}
                                            >
                                                {label}
                                            </option>
                                        )
                                    )}
                                </select>
                                {errors.jenisAlat && <p className="text-xs text-red-500 mt-1">{errors.jenisAlat.message}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Merek Alat</label>
                                <input type="text" {...register("brand")} placeholder="Contoh: Timbangan Gantung..." className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white" />
                                {errors.brand && <p className="text-xs text-red-500 mt-1">{errors.brand.message}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tipe / Model</label>
                                    <input type="text" {...register("type")} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor Seri</label>
                                    <input type="text" {...register("serialNumber")} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Kapasitas</label>
                                    <input type="number" step="any" {...register("capacityValue")} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Satuan Kap.</label>
                                    <select {...register("capacityUnit")} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white">
                                        {capacityUnits.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Daya Baca (e/d)</label>
                                    <input type="number" step="any" {...register("dayabaca")} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Satuan D.B.</label>
                                    <select {...register("dayabacaUnit")} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white">
                                        {capacityUnits.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Kelas</label>
                                    <select {...register("class")} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white">
                                        {kelasAlat.map(c => <option key={c} value={c}>Kelas {c}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* --- BAGIAN 3: DATA PENERAAN & JADWAL --- */}
                    <section className="bg-slate-50/50 p-5 rounded-xl border border-slate-200">
                        <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
                            <span className="bg-navy-900 text-white w-6 h-6 flex items-center justify-center rounded-full text-xs">3</span>
                            Pelaksanaan Peneraan
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Layanan</label>
                                    <select {...register("layanan")} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white">
                                        <option value="TERA_ULANG">Tera Ulang</option>
                                        <option value="TERA">Tera Baru</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Lokasi</label>
                                    <select {...register("lokasi")} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white">
                                        <option value="KANTOR">Di Kantor (Sidang)</option>
                                        <option value="TEMPAT_PAKAI">Di Tempat Pakai</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Sidang/Tera</label>
                                    <input type="date" {...register("jadwalTanggal")} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white" />
                                    {errors.jadwalTanggal && <p className="text-xs text-red-500 mt-1">{errors.jadwalTanggal.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Petugas Penera</label>
                                    <select {...register("petugasId")} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white">
                                        <option value="">-- Pilih Petugas --</option>
                                        {/* 4. Ubah petugasList menjadi inspectors */}
                                        {inspectors?.map((p: any) => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                    {errors.petugasId && <p className="text-xs text-red-500 mt-1">{errors.petugasId.message}</p>}
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan Tambahan (Opsional)</label>
                                <input type="text" {...register("catatan")} placeholder="Contoh: Alat rusak parah di bagian X..." className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white" />
                            </div>
                        </div>
                    </section>

                </form>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0 rounded-b-xl">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
                        Batal
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit((values) => mutation.mutate(values))}
                        disabled={mutation.isPending}
                        className="px-5 py-2 text-sm font-medium text-white bg-navy-900 hover:bg-navy-800 rounded-md shadow-sm transition-colors disabled:opacity-50"
                    >
                        {mutation.isPending ? "Menyimpan Data..." : "Simpan Registrasi"}
                    </button>
                </div>

            </div>
        </div>
    );
}