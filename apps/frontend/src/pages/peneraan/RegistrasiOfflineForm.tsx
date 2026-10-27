import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    useMutation,
    useQuery,
    useQueryClient
} from "@tanstack/react-query";
import {
    X,
    CheckCircle2,
} from "lucide-react";
import { jenisAlatLabel } from "@/lib/peneraan";
import Swal from "sweetalert2";

// ==========================================
// KONFIGURASI
// ==========================================

const capacityUnits = [
    "kg", "g", "mg", "L", "mL", "m", "cm"
] as const;

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

const isEmpty = (value: unknown) =>
    value === undefined ||
    value === null ||
    value === "";

// ==========================================
// SKEMA VALIDASI
// Field wajib dibedakan berdasarkan kategori.
// ==========================================

const alatSchema = z.object({
    instrumentId: z.string().optional(),

    jenisAlat: z.enum(jenisAlatUttp, {
        required_error: "Jenis alat wajib dipilih"
    }),

    brand: z.string().optional(),
    type: z.string().optional(),
    serialNumber: z.string().optional(),

    capacityValue: z.preprocess(
        value => isEmpty(value) ? undefined : value,
        z.coerce.number().positive("Kapasitas harus lebih dari 0").optional()
    ),
    capacityUnit: z.enum(capacityUnits).optional(),

    dayabaca: z.preprocess(
        value => isEmpty(value) ? undefined : value,
        z.coerce.number().positive("Daya baca harus lebih dari 0").optional()
    ),
    dayabacaUnit: z.enum(capacityUnits).optional(),
    class: z.enum(kelasAlat).optional(),

    nomorSPBU: z.string().optional(),
    stationAddress: z.string().optional(),

    lajuAlirMaksimum: z.preprocess(
        value => isEmpty(value) ? undefined : value,
        z.coerce.number().positive().optional()
    ),
    lajuAlirMinimum: z.preprocess(
        value => isEmpty(value) ? undefined : value,
        z.coerce.number().positive().optional()
    ),

    jenisCairan: z.string().optional(),
    identifikasiNozzle: z.string().optional()
}).superRefine((alat, ctx) => {
    const error = (field: string, message: string) => {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field],
            message
        });
    };

    if (!alat.brand?.trim()) {
        error("brand", "Merek alat wajib diisi");
    }

    if (alat.jenisAlat === "POMPA_UKUR_BBM") {
        if (!alat.nomorSPBU?.trim()) {
            error("nomorSPBU", "Nomor SPBU wajib diisi");
        }

        if (!alat.stationAddress?.trim()) {
            error("stationAddress", "Alamat SPBU wajib diisi");
        }

        if (
            alat.lajuAlirMinimum != null &&
            alat.lajuAlirMaksimum != null &&
            alat.lajuAlirMinimum > alat.lajuAlirMaksimum
        ) {
            error(
                "lajuAlirMinimum",
                "Laju alir minimum tidak boleh melebihi maksimum"
            );
        }

        return;
    }

    if (alat.capacityValue == null) {
        error("capacityValue", "Kapasitas wajib diisi");
    }
    if (!alat.capacityUnit) {
        error("capacityUnit", "Satuan kapasitas wajib dipilih");
    }
    if (alat.dayabaca == null) {
        error("dayabaca", "Daya baca wajib diisi");
    }
    if (!alat.dayabacaUnit) {
        error("dayabacaUnit", "Satuan daya baca wajib dipilih");
    }
    if (!alat.class) {
        error("class", "Kelas wajib dipilih");
    }
});

const registrasiSchema = z.object({
    ownerId: z.string().optional(),
    companyName: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),

    instruments: z.array(alatSchema)
        .min(1, "Minimal satu alat harus didaftarkan"),

    layanan: z.enum(jenisLayanan),
    lokasi: z.enum(lokasiPeneraan),
    jadwalTanggal: z.string().min(1, "Tanggal pengujian wajib diisi"),
    petugasId: z.string().min(1, "Petugas wajib dipilih"),
    catatan: z.string().optional()
}).superRefine((data, ctx) => {
    if (!data.ownerId) {
        if (!data.companyName?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["companyName"],
                message: "Nama pemilik wajib diisi"
            });
        }

        if (!data.address?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["address"],
                message: "Alamat pemilik wajib diisi"
            });
        }

        if (!data.phone?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["phone"],
                message: "Nomor telepon wajib diisi"
            });
        }
    }
});

type RegistrasiFormData = z.infer<typeof registrasiSchema>;

interface RegistrasiOfflineFormProps {
    isOpen: boolean;
    onClose: () => void;
    inspectors: any[];
}

// ==========================================
// KOMPONEN REGISTRASI
// ==========================================

export function RegistrasiOfflineForm({
    isOpen,
    onClose,
    inspectors
}: RegistrasiOfflineFormProps) {
    const queryClient = useQueryClient();

    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedOwner, setSelectedOwner] = useState<any | null>(null);

    const emptyInstrument = (): RegistrasiFormData["instruments"][number] => ({
        jenisAlat: "TIMBANGAN_ELEKTRONIK",
        instrumentId: undefined,
        brand: "",
        type: "",
        serialNumber: "",
        capacityValue: undefined,
        capacityUnit: undefined,
        dayabaca: undefined,
        dayabacaUnit: undefined,
        class: undefined,
        nomorSPBU: "",
        stationAddress: "",
        lajuAlirMaksimum: undefined,
        lajuAlirMinimum: undefined,
        jenisCairan: "",
        identifikasiNozzle: ""
    });

    const {
        control,
        register,
        handleSubmit,
        setValue,
        reset,
        watch,
        formState: { errors }
    } = useForm<RegistrasiFormData>({
        resolver: zodResolver(registrasiSchema),
        defaultValues: {
            ownerId: "",
            companyName: "",
            address: "",
            phone: "",
            instruments: [emptyInstrument()],
            layanan: "TERA_ULANG",
            lokasi: "KANTOR",
            jadwalTanggal: "",
            petugasId: "",
            catatan: ""
        }
    });

    const {
        fields: instrumentFields,
        append: appendInstrument,
        remove: removeInstrument
    } = useFieldArray({
        control,
        name: "instruments"
    });

    const instruments = watch("instruments") ?? [];

    const hasPUBBM = instruments.some(
        instrument => instrument.jenisAlat === "POMPA_UKUR_BBM"
    );

    // ======================================
    // PENCARIAN PEMILIK UNTUK FORM MASSA
    // ======================================

    useEffect(() => {
        const timer = setTimeout(
            () => setDebouncedSearch(searchTerm),
            500
        );

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const {
        data: searchResults,
        isFetching: isSearching
    } = useQuery({
        queryKey: ["owners-search", debouncedSearch],
        queryFn: async () => {
            if (!debouncedSearch) return [];

            const res = await fetch(
                `http://localhost:3000/owners?search=${encodeURIComponent(debouncedSearch)}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );

            if (!res.ok) {
                throw new Error("Gagal mencari pemilik");
            }

            const json = await res.json();
            return json.data || [];
        },
        enabled:
            isOpen &&
            debouncedSearch.trim().length > 2
    });

    useEffect(() => {
        if (!isOpen) {
            reset({
                ownerId: "",
                companyName: "",
                address: "",
                phone: "",
                instruments: [emptyInstrument()],
                layanan: "TERA_ULANG",
                lokasi: "KANTOR",
                jadwalTanggal: "",
                petugasId: "",
                catatan: ""
            });

            setSearchTerm("");
            setDebouncedSearch("");
            setSelectedOwner(null);
        }
    }, [isOpen, reset]);

    // ======================================
    // PEMILIHAN PEMILIK
    // ======================================

    const handleSelectOwner = (owner: any) => {
        setSelectedOwner(owner);

        setValue("ownerId", String(owner.id), {
            shouldValidate: true
        });

        setValue("companyName", owner.companyName);
        setValue("address", owner.address || "");
        setValue("phone", owner.phone || "");

        setSearchTerm("");
        setDebouncedSearch("");
    };

    const handleClearOwner = () => {
        setSelectedOwner(null);
        setValue("ownerId", "");
        setValue("companyName", "");
        setValue("address", "");
        setValue("phone", "");
    };

    // ======================================
    // PENYIMPANAN REGISTRASI
    // ======================================

    const mutation = useMutation({
        mutationFn: async (values: RegistrasiFormData) => {
            const payload = {
                ...(values.ownerId
                    ? { ownerId: values.ownerId }
                    : {
                        companyName: values.companyName?.trim(),
                        address: values.address?.trim(),
                        phone: values.phone?.trim()
                    }),

                layanan: values.layanan,
                lokasi: values.lokasi,

                jadwalTanggal: new Date(
                    `${values.jadwalTanggal}T00:00:00`
                ).toISOString(),

                petugasId: values.petugasId,
                catatan: values.catatan?.trim() || undefined,

                instruments: values.instruments.map(alat => ({
                    ...(alat.instrumentId
                        ? { instrumentId: alat.instrumentId }
                        : {}),

                    jenisAlat: alat.jenisAlat,
                    brand: alat.brand?.trim(),
                    type: alat.type?.trim() || undefined,
                    serialNumber: alat.serialNumber?.trim() || undefined,

                    ...(alat.jenisAlat === "POMPA_UKUR_BBM"
                        ? {
                            nomorSPBU: alat.nomorSPBU?.trim(),
                            stationAddress: alat.stationAddress?.trim(),
                            lajuAlirMinimum: alat.lajuAlirMinimum,
                            lajuAlirMaksimum: alat.lajuAlirMaksimum,
                            jenisCairan: alat.jenisCairan?.trim() || undefined,
                            identifikasiNozzle:
                                alat.identifikasiNozzle?.trim() || undefined
                        }
                        : {
                            capacityValue: alat.capacityValue,
                            capacityUnit: alat.capacityUnit,
                            dayabaca: alat.dayabaca,
                            dayabacaUnit: alat.dayabacaUnit,
                            class: alat.class
                        })
                }))
            };

            const res = await fetch(
                "http://localhost:3000/permohonan/offline",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    },
                    body: JSON.stringify(payload)
                }
            );

            if (!res.ok) {
                const errorData = await res.json().catch(() => null);
                throw new Error(
                    errorData?.message || "Gagal menyimpan permohonan"
                );
            }

            return res.json();
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["peneraan-applications"]
            });

            Swal.fire({
                title: "Berhasil!",
                text: "Registrasi berhasil disimpan.",
                icon: "success",
                timer: 2000,
                showConfirmButton: false
            });

            onClose();
        },

        onError: (error: Error) => {
            Swal.fire("Gagal", error.message, "error");
        }
    });

    if (!isOpen) return null;

    // ======================================
    // TAMPILAN
    // ======================================

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col rounded-xl bg-white shadow-2xl">

                {/* HEADER */}

                <div className="flex shrink-0 items-center justify-between rounded-t-xl border-b border-slate-100 bg-slate-50 px-6 py-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            Registrasi Peneraan (Offline)
                        </h2>

                        <p className="text-xs text-slate-500">
                            {hasPUBBM
                                ? "Registrasi pengujian Pompa Ukur BBM."
                                : "Daftarkan pemilik, alat, dan jadwal sekaligus."}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md border border-slate-200 bg-white p-1 text-slate-400 shadow-sm hover:text-slate-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form
                    id="registrasi-offline-form"
                    onSubmit={handleSubmit(values => mutation.mutate(values))}
                    className="flex-1 space-y-6 overflow-y-auto p-6"
                >

                    {/* DATA PEMILIK */}

                    <section className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
                        <h3 className="mb-4 font-semibold text-slate-800">
                            1. Data Pemilik Alat
                        </h3>

                        {selectedOwner ? (
                            <div className="flex items-center justify-between rounded-lg border border-green-200 bg-white p-4">
                                <div>
                                    <p className="font-semibold text-slate-900">
                                        <CheckCircle2 className="mr-1 inline h-4 w-4 text-green-600" />
                                        {selectedOwner.companyName}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {selectedOwner.phone} — {selectedOwner.address}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleClearOwner}
                                    className="rounded-md bg-red-50 px-3 py-1.5 text-xs text-red-600"
                                >
                                    Ganti Pemilik
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="relative">
                                    <label className="mb-1 block text-xs font-semibold">
                                        Cari Pemilik Terdaftar
                                    </label>
                                    <input
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        placeholder="Cari nama atau nomor HP..."
                                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                                    />

                                    {searchTerm.trim().length > 2 && (
                                        <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-md border bg-white shadow-lg">
                                            {isSearching ? (
                                                <p className="p-3 text-sm">Mencari...</p>
                                            ) : searchResults?.length ? (
                                                searchResults.map((owner: any) => (
                                                    <button
                                                        key={owner.id}
                                                        type="button"
                                                        onClick={() => handleSelectOwner(owner)}
                                                        className="block w-full border-b p-3 text-left hover:bg-slate-50"
                                                    >
                                                        <span className="block text-sm font-medium">
                                                            {owner.companyName}
                                                        </span>
                                                        <span className="text-xs text-slate-500">
                                                            {owner.phone}
                                                        </span>
                                                    </button>
                                                ))
                                            ) : (
                                                <p className="p-3 text-sm text-slate-500">
                                                    Pemilik tidak ditemukan. Isi data pemilik baru di bawah.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block text-xs font-semibold">
                                            Nama Pemilik / Perusahaan
                                        </label>
                                        <input
                                            {...register("companyName")}
                                            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                                        />
                                        {errors.companyName && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.companyName.message}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-xs font-semibold">
                                            Nomor Telepon
                                        </label>
                                        <input
                                            {...register("phone")}
                                            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                                        />
                                        {errors.phone && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.phone.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="mb-1 block text-xs font-semibold">
                                            Alamat Pemilik
                                        </label>
                                        <textarea
                                            {...register("address")}
                                            rows={2}
                                            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                                        />
                                        {errors.address && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.address.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* DAFTAR ALAT */}

                    <section className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-5">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h3 className="font-semibold text-slate-800">
                                    2. Daftar Alat Ukur
                                </h3>
                                <p className="mt-1 text-xs text-slate-500">
                                    Satu permohonan dapat memuat beberapa alat.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => appendInstrument(emptyInstrument())}
                                className="rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-700"
                            >
                                + Tambah Alat
                            </button>
                        </div>

                        {errors.instruments?.root?.message && (
                            <p className="text-xs text-red-500">
                                {errors.instruments.root.message}
                            </p>
                        )}

                        {instrumentFields.map((field, index) => {
                            const jenis = instruments[index]?.jenisAlat;
                            const isPUBBM = jenis === "POMPA_UKUR_BBM";
                            const itemErrors = errors.instruments?.[index];

                            return (
                                <div
                                    key={field.id}
                                    className="space-y-4 rounded-lg border border-slate-200 bg-white p-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold text-slate-800">
                                            Alat #{index + 1}
                                        </h4>

                                        {instrumentFields.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeInstrument(index)}
                                                className="rounded-md bg-red-50 px-3 py-1.5 text-xs text-red-600 hover:bg-red-100"
                                            >
                                                Hapus Alat
                                            </button>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-xs font-semibold">
                                            Jenis Alat
                                        </label>
                                        <select
                                            {...register(`instruments.${index}.jenisAlat` as const)}
                                            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                                        >
                                            {Object.entries(jenisAlatLabel).map(([value, label]) => (
                                                <option key={value} value={value}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                        {itemErrors?.jenisAlat && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {itemErrors.jenisAlat.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                        <div>
                                            <label className="mb-1 block text-xs font-semibold">
                                                Merek
                                            </label>
                                            <input
                                                {...register(`instruments.${index}.brand` as const)}
                                                placeholder="Contoh: TATSUNO"
                                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                            />
                                            {itemErrors?.brand && (
                                                <p className="mt-1 text-xs text-red-500">
                                                    {itemErrors.brand.message}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs font-semibold">
                                                Tipe / Model
                                            </label>
                                            <input
                                                {...register(`instruments.${index}.type` as const)}
                                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs font-semibold">
                                                Nomor Seri
                                            </label>
                                            <input
                                                {...register(`instruments.${index}.serialNumber` as const)}
                                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                            />
                                        </div>

                                        {isPUBBM ? (
                                            <>
                                                <div>
                                                    <label className="mb-1 block text-xs font-semibold">
                                                        Nomor SPBU
                                                    </label>
                                                    <input
                                                        {...register(`instruments.${index}.nomorSPBU` as const)}
                                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                                    />
                                                    {itemErrors?.nomorSPBU && (
                                                        <p className="mt-1 text-xs text-red-500">
                                                            {itemErrors.nomorSPBU.message}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label className="mb-1 block text-xs font-semibold">
                                                        Alamat SPBU
                                                    </label>
                                                    <textarea
                                                        {...register(`instruments.${index}.stationAddress` as const)}
                                                        rows={2}
                                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                                    />
                                                    {itemErrors?.stationAddress && (
                                                        <p className="mt-1 text-xs text-red-500">
                                                            {itemErrors.stationAddress.message}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="mb-1 block text-xs font-semibold">
                                                        Laju Alir Minimum
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        {...register(`instruments.${index}.lajuAlirMinimum` as const)}
                                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                                    />
                                                    {itemErrors?.lajuAlirMinimum && (
                                                        <p className="mt-1 text-xs text-red-500">
                                                            {itemErrors.lajuAlirMinimum.message}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="mb-1 block text-xs font-semibold">
                                                        Laju Alir Maksimum
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        {...register(`instruments.${index}.lajuAlirMaksimum` as const)}
                                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="mb-1 block text-xs font-semibold">
                                                        Jenis Cairan
                                                    </label>
                                                    <input
                                                        {...register(`instruments.${index}.jenisCairan` as const)}
                                                        placeholder="Contoh: Pertalite"
                                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="mb-1 block text-xs font-semibold">
                                                        Identifikasi Nozzle
                                                    </label>
                                                    <input
                                                        {...register(`instruments.${index}.identifikasiNozzle` as const)}
                                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div>
                                                    <label className="mb-1 block text-xs font-semibold">
                                                        Kapasitas
                                                    </label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            {...register(`instruments.${index}.capacityValue` as const)}
                                                            className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
                                                        />
                                                        <select
                                                            {...register(`instruments.${index}.capacityUnit` as const)}
                                                            className="w-24 rounded-md border border-slate-300 px-2 py-2 text-sm"
                                                        >
                                                            <option value="">Satuan</option>
                                                            {capacityUnits.map(unit => (
                                                                <option key={unit} value={unit}>
                                                                    {unit}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    {itemErrors?.capacityValue && (
                                                        <p className="mt-1 text-xs text-red-500">
                                                            {itemErrors.capacityValue.message}
                                                        </p>
                                                    )}
                                                    {itemErrors?.capacityUnit && (
                                                        <p className="mt-1 text-xs text-red-500">
                                                            {itemErrors.capacityUnit.message}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="mb-1 block text-xs font-semibold">
                                                        Daya Baca
                                                    </label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            {...register(`instruments.${index}.dayabaca` as const)}
                                                            className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
                                                        />
                                                        <select
                                                            {...register(`instruments.${index}.dayabacaUnit` as const)}
                                                            className="w-24 rounded-md border border-slate-300 px-2 py-2 text-sm"
                                                        >
                                                            <option value="">Satuan</option>
                                                            {capacityUnits.map(unit => (
                                                                <option key={unit} value={unit}>
                                                                    {unit}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    {itemErrors?.dayabaca && (
                                                        <p className="mt-1 text-xs text-red-500">
                                                            {itemErrors.dayabaca.message}
                                                        </p>
                                                    )}
                                                    {itemErrors?.dayabacaUnit && (
                                                        <p className="mt-1 text-xs text-red-500">
                                                            {itemErrors.dayabacaUnit.message}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="mb-1 block text-xs font-semibold">
                                                        Kelas Alat
                                                    </label>
                                                    <select
                                                        {...register(`instruments.${index}.class` as const)}
                                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                                    >
                                                        <option value="">Pilih kelas</option>
                                                        {kelasAlat.map(kelas => (
                                                            <option key={kelas} value={kelas}>
                                                                Kelas {kelas}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {itemErrors?.class && (
                                                        <p className="mt-1 text-xs text-red-500">
                                                            {itemErrors.class.message}
                                                        </p>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </section>


                    {/* PENERAAN DAN JADWAL */}

                    <section className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
                        <h3 className="mb-4 font-semibold text-slate-800">
                            Pelaksanaan Peneraan
                        </h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-700">
                                    Layanan
                                </label>
                                <select
                                    {...register("layanan")}
                                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                                >
                                    <option value="TERA_ULANG">Tera Ulang</option>
                                    <option value="TERA">Tera Baru</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-700">
                                    Lokasi
                                </label>
                                <select
                                    {...register("lokasi")}
                                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                                >
                                    <option value="KANTOR">Di Kantor (Sidang)</option>
                                    <option value="TEMPAT_PAKAI">Di Tempat Pakai</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-700">
                                    Tanggal Sidang/Tera
                                </label>
                                <input
                                    type="date"
                                    {...register("jadwalTanggal")}
                                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                                />
                                {errors.jadwalTanggal && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.jadwalTanggal.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-700">
                                    Petugas Penera
                                </label>
                                <select
                                    {...register("petugasId")}
                                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                                >
                                    <option value="">-- Pilih Petugas --</option>
                                    {inspectors?.map((petugas: any) => (
                                        <option key={petugas.id} value={petugas.id}>
                                            {petugas.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.petugasId && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.petugasId.message}
                                    </p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-1 block text-xs font-semibold text-slate-700">
                                    Catatan Tambahan (Opsional)
                                </label>
                                <input
                                    {...register("catatan")}
                                    placeholder="Catatan tambahan"
                                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                                />
                            </div>
                        </div>
                    </section>
                </form>

                {/* FOOTER */}

                <div className="flex shrink-0 justify-end gap-3 rounded-b-xl border-t border-slate-100 bg-white px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                    >
                        Batal
                    </button>

                    <button
                        type="submit"
                        form="registrasi-offline-form"
                        disabled={mutation.isPending}
                        className="rounded-md bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                    >
                        {mutation.isPending
                            ? "Menyimpan Data..."
                            : "Simpan Registrasi"}
                    </button>
                </div>
            </div>
        </div >
    );
}
