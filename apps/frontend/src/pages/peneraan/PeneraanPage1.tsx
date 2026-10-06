import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Plus,
    Award,
    AlertCircle,
} from "lucide-react";
import Swal from "sweetalert2";
import { getErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
    fetchPermohonan,
    /*fetchMyPermohonan,
    fetchMyTasks,*/
    fetchOwners,
    fetchMyOwnerProfile,
    fetchInstruments,
    fetchCertificates,
    fetchMyCertificates,
    fetchInspectors,
    deleteOwner,
    deleteInstrument,
    deleteCertificate,
    deletePermohonan,
    type Instrument,
    type InstrumentOwner,
    type PermohonanPeneraan,
    type Certificate,
} from "@/lib/peneraan";
import { DataTable } from "@/components/ui/DataTable";
import { getPermohonanColumns } from "@/tables/peneraan/permohonan.columns";
import { getInstrumenColumns } from "@/tables/peneraan/instrument.columns";
import { getTugasColumns } from "@/tables/peneraan/tugas.columns";
import { getSertifikatColumns } from "@/tables/peneraan/sertifikat.columns";
import { getPemilikColumns } from "@/tables/peneraan/pemilik.columns";
import { CerapanModal } from "@/components/cerapan/CerapanModal";
import { OwnerProfileModal } from "./OwnerProfileModal";
import { InstrumentFormModal } from "./InstrumentFormModal";
import { PermohonanFormModal } from "./PermohonanFormModal";
import { ReviewJadwalModal } from "./ReviewJadwalModal";
import { InputCerapanModal } from "./InputCerapanModal";
import { TerbitkanSertifikatModal } from "./TerbitkanSertifikatModal";
import { CertificateViewModal } from "./CertificateViewModal";
import { RegistrasiOfflineForm } from "./RegistrasiOfflineForm";


export function PeneraanPage1() {

    const { user } = useAuth();
    const queryClient = useQueryClient();

    const isAdmin = ["admin", "kepala", "staf"].includes(user?.role ?? "");
    const isInspector = user?.role === "petugas_penera";
    const isOwner = user?.role === "pemilik_alat";

    const canDelete = user?.role === "admin"; // sengaja lebih ketat dari `isAdmin` (yang termasuk kepala/staf) — backend cuma izinkan admin

    const refreshAll = () => {
        queryClient.invalidateQueries({ queryKey: ["permohonan-list"] });
        queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
        queryClient.invalidateQueries({ queryKey: ["instruments-list"] });
        queryClient.invalidateQueries({ queryKey: ["certificates-list"] });
        queryClient.invalidateQueries({ queryKey: ["owners-list"] });
        queryClient.invalidateQueries({ queryKey: ["my-owner-profile"] });
    };

    const handleDeleteOwner = async (id: string, name: string) => {
        const result = await Swal.fire({
            title: "Hapus pemilik ini?",
            text: `"${name}" akan dihapus permanen.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Ya, Hapus",
            cancelButtonText: "Batal",
            reverseButtons: true,
            focusCancel: true,
        });
        if (result.isConfirmed) {
            try {
                await deleteOwner(id);
                Swal.fire({ title: "Berhasil!", text: "Pemilik telah dihapus.", icon: "success", timer: 1500, showConfirmButton: false });
                refreshAll();
            } catch (error) {
                Swal.fire("Gagal!", getErrorMessage(error, "Gagal menghapus pemilik."), "error");
            }
        }
    };

    const handleDeleteInstrument = async (id: string, name: string) => {
        const result = await Swal.fire({
            title: "Hapus alat ukur ini?",
            text: `"${name}" akan dihapus permanen.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Ya, Hapus",
            cancelButtonText: "Batal",
            reverseButtons: true,
            focusCancel: true,
        });
        if (result.isConfirmed) {
            try {
                await deleteInstrument(id);
                Swal.fire({ title: "Berhasil!", text: "Alat ukur telah dihapus.", icon: "success", timer: 1500, showConfirmButton: false });
                refreshAll();
            } catch (error) {
                Swal.fire("Gagal!", getErrorMessage(error, "Gagal menghapus alat ukur."), "error");
            }
        }
    };

    const handleDeletePermohonan = async (id: string, no: string) => {
        const result = await Swal.fire({
            title: "Hapus permohonan ini?",
            text: `Permohonan "${no}" akan dihapus permanen.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Ya, Hapus",
            cancelButtonText: "Batal",
            reverseButtons: true,
            focusCancel: true,
        });
        if (result.isConfirmed) {
            try {
                await deletePermohonan(id);
                Swal.fire({ title: "Berhasil!", text: "Permohonan telah dihapus.", icon: "success", timer: 1500, showConfirmButton: false });
                refreshAll();
            } catch (error) {
                Swal.fire("Gagal!", getErrorMessage(error, "Gagal menghapus permohonan."), "error");
            }
        }
    };

    const handleDeleteCertificate = async (id: string, no: string) => {
        const result = await Swal.fire({
            title: "Hapus sertifikat ini?",
            text: `Sertifikat "${no}" akan dihapus permanen. Ini menghapus bukti resmi penerbitan — pastikan memang diperlukan.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Ya, Hapus",
            cancelButtonText: "Batal",
            reverseButtons: true,
            focusCancel: true,
        });
        if (result.isConfirmed) {
            try {
                await deleteCertificate(id);
                Swal.fire({ title: "Berhasil!", text: "Sertifikat telah dihapus.", icon: "success", timer: 1500, showConfirmButton: false });
                refreshAll();
            } catch (error) {
                Swal.fire("Gagal!", getErrorMessage(error, "Gagal menghapus sertifikat."), "error");
            }
        }
    };


    // Tab state
    const [activeTab, setActiveTab] = useState<string>(
        isInspector ? "tugas" : "permohonan"
    );


    // Modals state
    const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);
    const [isInstrumentModalOpen, setIsInstrumentModalOpen] = useState(false);
    const [isPermohonanModalOpen, setIsPermohonanModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isCerapanModalOpen, setIsCerapanModalOpen] = useState(false);
    const [isSertifikatModalOpen, setIsSertifikatModalOpen] = useState(false);
    const [isCertViewOpen, setIsCertViewOpen] = useState(false);
    const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
    const [selectedPermohonan, setSelectedPermohonan] = useState<PermohonanPeneraan | null>(null);
    const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
    const [instrumentDefaultOwnerId, setInstrumentDefaultOwnerId] = useState<string>("");
    const [isEditInstrumentOpen, setIsEditInstrumentOpen] = useState(false);
    const [editingInstrument, setEditingInstrument] = useState<Instrument | null>(null);
    const [isEditOwnerOpen, setIsEditOwnerOpen] = useState(false);
    const [editingOwner, setEditingOwner] = useState<InstrumentOwner | null>(null);
    const [editingPermohonan, setEditingPermohonan] = useState<PermohonanPeneraan | null>(null);
    const [isEditPermohonanOpen, setIsEditPermohonanOpen] = useState(false);

    const instrumentColumns = useMemo(
        () =>
            getInstrumenColumns({
                isAdmin,
                canDelete,

                onEdit: (inst) => {
                    setEditingInstrument(inst);
                    setIsEditInstrumentOpen(true);
                },

                onDelete: handleDeleteInstrument,
            }),

        [
            isAdmin,
            canDelete,
            handleDeleteInstrument
        ]
    );

    // ─── QUERIES ────────────────────────────────────────────────────────────────

    // Profil pemilik saya (untuk role pemilik_alat)
    const { data: myOwnerProfile } = useQuery({
        queryKey: ["my-owner-profile"],
        queryFn: fetchMyOwnerProfile,
        enabled: isOwner,
    });

    // Data permohonan sesuai role
    const {
        data: permohonanList = [],
        isLoading: loadingPermohonan
    } = useQuery({
        queryKey: ["permohonan-list"],

        queryFn: () =>
            fetchPermohonan()
    });

    /* Tugas pengujian bagi petugas penera
    const { data: myTasks, isLoading: loadingTasks } = useQuery({
        queryKey: ["my-tasks"],
        queryFn: fetchMyTasks,
        enabled: isInspector || isAdmin,
    });*/

    // Data Master Pemilik
    const { data: owners = [] } = useQuery({
        queryKey: ["owners-list"],
        queryFn: fetchOwners,
        enabled: isAdmin,
    });

    // Data Master Alat
    const { data: instruments = [] } = useQuery({
        queryKey: ["instruments-list", myOwnerProfile?.id],
        queryFn: () => fetchInstruments(isOwner ? myOwnerProfile?.id : undefined),
        enabled: !!user,
    });

    // Data Sertifikat
    const { data: certificates = [], isLoading: loadingCerts } = useQuery({
        queryKey: ["certificates-list", isOwner],
        queryFn: () => (isOwner ? fetchMyCertificates() : fetchCertificates()),
    });

    // Data Petugas Penera (untuk Admin menjadwalkan)
    const { data: inspectors = [] } = useQuery({
        queryKey: ["inspectors-list"],
        queryFn: fetchInspectors,
        enabled: isAdmin,
    });

    const handleOpenCreateInstrument = (ownerId?: string) => {
        setInstrumentDefaultOwnerId(ownerId || myOwnerProfile?.id || "");
        setIsInstrumentModalOpen(true);
    };

    const handleOpenReview = (item: PermohonanPeneraan) => {
        setSelectedPermohonan(item);
        setIsReviewModalOpen(true);
    };

    const handleOpenCerapan = (item: PermohonanPeneraan) => {
        setSelectedPermohonan(item);
        setIsCerapanModalOpen(true);
    };

    const handleOpenSertifikat = (item: PermohonanPeneraan) => {
        setSelectedPermohonan(item);
        setIsSertifikatModalOpen(true);
    };

    const handleOpenViewCertificate = (item: PermohonanPeneraan) => {
        setSelectedPermohonan(item);
        if (item.certificateId) {
            setSelectedCertificate({
                id: item.certificateId,
                observationId: item.testObservationId || "",
                certificateNumber: item.certificateNumber || "",
                issuedBy: "",
                issueDate: item.createdAt,
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                status: "active",
                createdAt: item.createdAt,
                companyName: item.companyName,
                instrumentBrand: item.instrumentBrand,
                instrumentType: item.instrumentType,
                instrumentSerial: item.instrumentSerial,
            });
            setIsCertViewOpen(true);
        }
    };

    const filteredInstruments = instruments;

    const permohonanColumns = getPermohonanColumns({
        isAdmin,
        isInspector,
        canDelete,
        handleOpenReview,
        handleOpenCerapan,
        handleOpenSertifikat,
        handleOpenViewCertificate,
        setEditingPermohonan,
        handleDeletePermohonan,
        setIsEditPermohonanOpen,
    });

    const [
        selectedCerapan,
        setSelectedCerapan
    ] = useState<PermohonanPeneraan | null>(null);


    const [
        openCerapan,
        setOpenCerapan
    ] = useState(false);

    return (
        <div className="space-y-6">
            {/* HEADER UTAMA */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Modul Peneraan (Tera & Tera Ulang)</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Pelayanan verifikasi dan pengujian alat ukur, takar, timbang dan perlengkapannya (UTTP).
                    </p>
                </div>

                {/* AKSI CEPAT SESUAI ROLE */}
                <div className="flex flex-wrap gap-2">
                    {isAdmin && (
                        <>
                            <Button
                                onClick={() => setIsOfflineModalOpen(true)}
                                className="gap-1.5 bg-navy-900 text-white"
                            >
                                <Plus className="h-4 w-4" /> Registrasi Peneraan
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* BANNER NOTIFIKASI KHUSUS PEMILIK ALAT JIKA BELUM LENGKAP PROFIL */}
            {isOwner && myOwnerProfile === null && (
                <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="h-6 w-6 text-amber-600 shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-amber-900">Profil Perusahaan Belum Dilengkapi</p>
                            <p className="text-xs text-amber-700">
                                Lengkapi identitas perusahaan agar Anda dapat mendaftarkan alat ukur dan mengajukan permohonan tera.
                            </p>
                        </div>
                    </div>
                    <Button size="sm" onClick={() => setIsOwnerModalOpen(true)} className="bg-amber-600 text-white hover:bg-amber-700">
                        Lengkapi Sekarang
                    </Button>
                </div>
            )}

            {/* TAB NAVIGASI */}
            <div className="flex border-b border-slate-200">
                <nav className="flex space-x-6">
                    {isAdmin && (
                        <button
                            onClick={() => setActiveTab("pemilik")}
                            className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === "pemilik"
                                ? "border-navy-900 text-navy-900 font-semibold"
                                : "border-transparent text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            Pemilik Alat UTTP
                        </button>
                    )}
                    <button
                        onClick={() => setActiveTab("alat")}
                        className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === "alat"
                            ? "border-navy-900 text-navy-900 font-semibold"
                            : "border-transparent text-slate-500 hover:text-slate-700"
                            }`}
                    >
                        {isOwner ? "Alat Ukur Saya" : "Daftar Alat UTTP"}
                    </button>
                    <button
                        onClick={() => setActiveTab("permohonan")}
                        className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === "permohonan"
                            ? "border-navy-900 text-navy-900 font-semibold"
                            : "border-transparent text-slate-500 hover:text-slate-700"
                            }`}
                    >
                        {isOwner ? "Permohonan Saya" : "Antrean Permohonan"}
                    </button>

                    {(isInspector || isAdmin) && (
                        <button
                            onClick={() => setActiveTab("tugas")}
                            className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === "tugas"
                                ? "border-navy-900 text-navy-900 font-semibold"
                                : "border-transparent text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            Tugas Pengujian
                        </button>
                    )}



                    <button
                        onClick={() => setActiveTab("sertifikat")}
                        className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === "sertifikat"
                            ? "border-navy-900 text-navy-900 font-semibold"
                            : "border-transparent text-slate-500 hover:text-slate-700"
                            }`}
                    >
                        <Award className="h-4 w-4" />
                        {isOwner ? "Sertifikat Saya" : "Sertifikat Terbit (SKHP)"}
                    </button>


                </nav>
            </div>

            {/* ═══════════════════════════════════════════════════════════════════════ */}
            {/* TAB 1: ANTREAN / DAFTAR PERMOHONAN PENERAAN                           */}
            {/* ═══════════════════════════════════════════════════════════════════════ */}
            {activeTab === "permohonan" && (
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                            <div>
                                <h2 className="text-base font-semibold text-slate-900">
                                    {isOwner ? "Daftar Permohonan Peneraan Anda" : "Semua Permohonan Peneraan"}
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Lacak status verifikasi, jadwal sidang tera, hingga penerbitan sertifikat.
                                </p>
                            </div>
                        </div>
                    </CardHeader>

                    <CardBody className="p-0">
                        <DataTable
                            columns={permohonanColumns}
                            data={permohonanList ?? []}
                            loading={loadingPermohonan}
                            emptyMessage={
                                isOwner
                                    ? "Anda belum memiliki permohonan"
                                    : "Belum ada permohonan"
                            }
                        />
                    </CardBody>
                </Card>
            )}

            {/* ═══════════════════════════════════════════════════════════════════════ */}
            {/* TAB 2: TUGAS SIDANG / PENGUJIAN PENERA                                 */}
            {/* ═══════════════════════════════════════════════════════════════════════ */}
            {(isInspector || isAdmin) && activeTab === "tugas" && (
                <Card>
                    <CardHeader>
                        <div>
                            <h2 className="text-base font-semibold text-slate-900">
                                {isInspector
                                    ? "Daftar Tugas Pengujian Peneraan Anda"
                                    : "Semua Penugasan Petugas Penera"}
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Alat ukur yang telah dijadwalkan untuk dilaksanakan pengujian teknis metrologi.
                            </p>
                        </div>
                    </CardHeader>
                    <CardBody className="p-0">
                        <DataTable
                            columns={
                                getTugasColumns({
                                    onInputCerapan: (item) => {
                                        console.log(
                                            "CLASS DAN KAPASITAS",
                                            {
                                                class: item.class,
                                                capacityValue: item.capacityValue,
                                                dayabaca: item.dayabaca
                                            }
                                        );
                                        setSelectedCerapan(item);
                                        setOpenCerapan(true);
                                    }
                                })
                            }
                            data={permohonanList}
                        />
                    </CardBody>
                </Card>
            )}
            <CerapanModal
                open={openCerapan}
                onClose={() => {
                    setOpenCerapan(false);
                    setSelectedCerapan(null);
                }}
                instrument={selectedCerapan}
            />

            {/* ═══════════════════════════════════════════════════════════════════════ */}
            {/* TAB 3: DAFTAR ALAT UKUR (UTTP)                                        */}
            {/* ═══════════════════════════════════════════════════════════════════════ */}
            {activeTab === "alat" && (
                <Card>
                    {/* Tab "alat" — CardHeader */}
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                            <div>
                                <h2 className="text-base font-semibold text-slate-900">
                                    {isOwner ? "Data Alat Ukur Milik Anda" : "Semua Data Alat Ukur (UTTP)"}
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">Daftar UTTP terdaftar yang dapat diajukan untuk peneraan.</p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <Button size="sm" onClick={() => handleOpenCreateInstrument()} className="gap-1.5">
                                    <Plus className="h-4 w-4" /> Daftarkan Alat Baru
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    <CardBody className="p-0">
                        <DataTable
                            columns={instrumentColumns}
                            data={filteredInstruments}
                        />
                    </CardBody>
                </Card>
            )}

            {/* ═══════════════════════════════════════════════════════════════════════ */}
            {/* TAB 4: SERTIFIKAT TERBIT (SKHP)                                       */}
            {/* ═══════════════════════════════════════════════════════════════════════ */}
            {activeTab === "sertifikat" && (
                <Card>
                    <CardHeader>
                        <div>
                            <h2 className="text-base font-semibold text-slate-900">
                                {isOwner ? "Sertifikat Sah Milik Anda" : "Semua Sertifikat Tera yang Diterbitkan"}
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Surat Keterangan Hasil Pengujian (SKHP) resmi yang masih aktif maupun kedaluwarsa.
                            </p>
                        </div>
                    </CardHeader>
                    <CardBody className="p-0">
                        <DataTable
                            columns={getSertifikatColumns({
                                canDelete,
                                onView: (cert) => { setSelectedCertificate(cert); setIsCertViewOpen(true); },
                                onDelete: handleDeleteCertificate,
                            })}
                            data={certificates}
                            loading={loadingCerts}
                            emptyMessage="Belum ada sertifikat yang diterbitkan."
                        />
                    </CardBody>
                </Card>
            )}

            {/* ═══════════════════════════════════════════════════════════════════════ */}
            {/* TAB 5: DATA PEMILIK ALAT (KHUSUS ADMIN)                               */}
            {/* ═══════════════════════════════════════════════════════════════════════ */}
            {isAdmin && activeTab === "pemilik" && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between w-full">
                            <div>
                                <h2 className="text-base font-semibold text-slate-900">Data Pemilik Alat / Perusahaan</h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Daftar entitas perusahaan yang memiliki alat ukur terdaftar di metrologi.
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody className="p-0">
                        <DataTable
                            columns={getPemilikColumns({
                                canDelete,
                                onAddInstrument: handleOpenCreateInstrument,
                                onEdit: (owner) => { setEditingOwner(owner); setIsEditOwnerOpen(true); },
                                onDelete: handleDeleteOwner,
                            })}
                            data={owners}
                            emptyMessage="Belum ada data pemilik terdaftar."
                        />
                    </CardBody>
                </Card>
            )}

            {/* ═══════════════════════════════════════════════════════════════════════ */}
            {/* MODAL DIALOGS                                                         */}
            {/* ═══════════════════════════════════════════════════════════════════════ */}

            {/* 1. Modal Profil Pemilik */}
            <OwnerProfileModal
                isOpen={isOwnerModalOpen}
                onClose={() => setIsOwnerModalOpen(false)}
                existingOwner={myOwnerProfile ?? null}
                onSuccess={refreshAll}
            />

            {/* 2. Modal Daftarkan Alat */}
            <InstrumentFormModal
                isOpen={isInstrumentModalOpen}
                onClose={() => setIsInstrumentModalOpen(false)}
                owners={owners.length > 0 ? owners : myOwnerProfile ? [myOwnerProfile] : []}
                defaultOwnerId={instrumentDefaultOwnerId || myOwnerProfile?.id}
                onSuccess={refreshAll}
            />

            {/* 3. Modal Ajukan / Registrasi Permohonan */}
            <PermohonanFormModal
                isOpen={isPermohonanModalOpen}
                onClose={() => setIsPermohonanModalOpen(false)}
                isAdmin={isAdmin}
                owners={owners.length > 0 ? owners : myOwnerProfile ? [myOwnerProfile] : []}
                instruments={instruments}
                inspectors={inspectors}
                defaultOwnerId={myOwnerProfile?.id}
                onOpenCreateInstrument={handleOpenCreateInstrument}
                onSuccess={refreshAll}
            />

            {/* 4. Modal Review & Penjadwalan Admin */}
            <ReviewJadwalModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                permohonan={selectedPermohonan}
                inspectors={inspectors}
                onSuccess={refreshAll}
            />

            {/* 5. Modal Input Cerapan Petugas Penera */}
            <InputCerapanModal
                isOpen={isCerapanModalOpen}
                onClose={() => setIsCerapanModalOpen(false)}
                permohonan={selectedPermohonan}
                onSuccess={refreshAll}
            />

            {/* 6. Modal Terbitkan Sertifikat */}
            <TerbitkanSertifikatModal
                isOpen={isSertifikatModalOpen}
                onClose={() => setIsSertifikatModalOpen(false)}
                permohonan={selectedPermohonan}
                onSuccess={refreshAll}
            />

            {/* 7. Modal Pratinjau & Cetak Sertifikat SKHP */}
            <CertificateViewModal
                isOpen={isCertViewOpen}
                onClose={() => setIsCertViewOpen(false)}
                certificate={selectedCertificate}
                permohonan={selectedPermohonan}
            />
            {/* 8. Modal Registrasi Offline (Gabungan) */}
            <RegistrasiOfflineForm
                isOpen={isOfflineModalOpen}
                onClose={() => {
                    setIsOfflineModalOpen(false);
                    refreshAll();
                }}
                inspectors={inspectors}
            />

            {/* 9. Modal Edit Alat Ukur (admin) */}
            <InstrumentFormModal
                isOpen={isEditInstrumentOpen}
                onClose={() => setIsEditInstrumentOpen(false)}
                owners={owners.length > 0 ? owners : myOwnerProfile ? [myOwnerProfile] : []}
                existingInstrument={editingInstrument}
                onSuccess={refreshAll}
            />

            {/* 10. Modal Edit Pemilik (admin, beda instance dari modal "lengkapi profil" milik sendiri) */}
            <OwnerProfileModal
                isOpen={isEditOwnerOpen}
                onClose={() => setIsEditOwnerOpen(false)}
                existingOwner={editingOwner}
                onSuccess={refreshAll}
            />

            <PermohonanFormModal

                isOpen={
                    isPermohonanModalOpen ||
                    isEditPermohonanOpen
                }

                onClose={() => {
                    setIsPermohonanModalOpen(false);
                    setIsEditPermohonanOpen(false);
                    setEditingPermohonan(null);
                }}

                existingPermohonan={
                    editingPermohonan
                }

                isAdmin={
                    isAdmin
                }

                owners={
                    owners
                }

                instruments={
                    instruments
                }

                inspectors={
                    inspectors
                }

                defaultOwnerId={
                    isOwner ? user?.id : undefined
                }

                onOpenCreateInstrument={
                    handleOpenCreateInstrument
                }

                onSuccess={() => {
                    refreshAll();
                    setIsPermohonanModalOpen(false);
                    setIsEditPermohonanOpen(false);
                }}
            />
        </div>
    );
}