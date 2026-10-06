import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Plus,
  Calendar,
  FileCheck2,
  Award,
  FileSpreadsheet,
  Eye,
  AlertCircle,
  Trash2,
  Pencil,
} from "lucide-react";
import Swal from "sweetalert2";
import { getErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";
import {
  fetchPermohonan,
  fetchMyPermohonan,
  fetchMyTasks,
  fetchOwners,
  fetchMyOwnerProfile,
  fetchInstruments,
  fetchCertificates,
  fetchMyCertificates,
  fetchInspectors,
  statusPermohonanLabel,
  statusPermohonanTone,
  layananLabel,
  lokasiLabel,
  jenisAlatLabel,
  deleteOwner,
  deleteInstrument,
  deleteCertificate,
  deletePermohonan,
  type Instrument,
  type InstrumentOwner,
  type PermohonanPeneraan,
  type Certificate,
  type StatusPermohonan,
} from "@/lib/peneraan";
import { OwnerProfileModal } from "./OwnerProfileModal";
import { InstrumentFormModal } from "./InstrumentFormModal";
import { PermohonanFormModal } from "./PermohonanFormModal";
import { ReviewJadwalModal } from "./ReviewJadwalModal";
import { InputCerapanModal } from "./InputCerapanModal";
import { TerbitkanSertifikatModal } from "./TerbitkanSertifikatModal";
import { CertificateViewModal } from "./CertificateViewModal";
import { RegistrasiOfflineForm } from "./RegistrasiOfflineForm";
import { EditPermohonanModal } from "./EditPermohonanModal";

export function PeneraanPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isAdmin = ["admin", "kepala", "staf"].includes(user?.role ?? "");
  const isInspector = user?.role === "petugas_penera";
  const isOwner = user?.role === "pemilik_alat";

  const canDelete = user?.role === "admin"; // sengaja lebih ketat dari `isAdmin` (yang termasuk kepala/staf) — backend cuma izinkan admin

  // --- Handlers Hapus Data ---
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

  // Tab & Standard state
  const [activeTab, setActiveTab] = useState<string>(isInspector ? "tugas" : "permohonan");
  const [statusFilter, setStatusFilter] = useState<StatusPermohonan | "">("");

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

  // Edit state
  const [isEditInstrumentOpen, setIsEditInstrumentOpen] = useState(false);
  const [editingInstrument, setEditingInstrument] = useState<Instrument | null>(null);
  const [isEditOwnerOpen, setIsEditOwnerOpen] = useState(false);
  const [editingOwner, setEditingOwner] = useState<InstrumentOwner | null>(null);
  const [isEditPermohonanOpen, setIsEditPermohonanOpen] = useState(false);
  const [editingPermohonan, setEditingPermohonan] = useState<PermohonanPeneraan | null>(null);

  // ─── QUERIES ────────────────────────────────────────────────────────────────
  const { data: myOwnerProfile } = useQuery({
    queryKey: ["my-owner-profile"],
    queryFn: fetchMyOwnerProfile,
    enabled: isOwner,
  });

  const { data: permohonanList, isLoading: loadingPermohonan } = useQuery({
    queryKey: ["permohonan-list", statusFilter, isOwner],
    queryFn: () =>
      isOwner
        ? fetchMyPermohonan()
        : fetchPermohonan(statusFilter ? { status: statusFilter } : undefined),
  });

  const { data: myTasks, isLoading: loadingTasks } = useQuery({
    queryKey: ["my-tasks"],
    queryFn: fetchMyTasks,
    enabled: isInspector || isAdmin,
  });

  const { data: owners = [] } = useQuery({
    queryKey: ["owners-list"],
    queryFn: fetchOwners,
    enabled: isAdmin,
  });

  const { data: instruments = [] } = useQuery({
    queryKey: ["instruments-list", myOwnerProfile?.id],
    queryFn: () => fetchInstruments(isOwner ? myOwnerProfile?.id : undefined),
    enabled: !!user,
  });

  const { data: certificates = [], isLoading: loadingCerts } = useQuery({
    queryKey: ["certificates-list", isOwner],
    queryFn: () => (isOwner ? fetchMyCertificates() : fetchCertificates()),
  });

  const { data: inspectors = [] } = useQuery({
    queryKey: ["inspectors-list"],
    queryFn: fetchInspectors,
    enabled: isAdmin,
  });

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ["permohonan-list"] });
    queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
    queryClient.invalidateQueries({ queryKey: ["instruments-list"] });
    queryClient.invalidateQueries({ queryKey: ["certificates-list"] });
    queryClient.invalidateQueries({ queryKey: ["owners-list"] });
    queryClient.invalidateQueries({ queryKey: ["my-owner-profile"] });
  };

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

  // ─── TANSTACK TABLE SETUP (Untuk Tab Daftar Alat UTTP) ──────────────────────
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const instrumentColumns = useMemo<ColumnDef<any>[]>(() => {
    const cols: ColumnDef<any>[] = [];

    if (isAdmin) {
      cols.push({ accessorKey: "ownerName", header: "Nama Pemilik" });
    }

    cols.push(
      {
        accessorKey: "jenisAlat",
        header: "Jenis Alat",
        cell: (info) => (
          <span className="text-sm text-slate-700">
            {/* Ubah 'as string' menjadi 'as keyof typeof jenisAlatLabel' */}
            {jenisAlatLabel[info.getValue() as keyof typeof jenisAlatLabel] || (info.getValue() as string)}
          </span>
        ),
      },
      {
        accessorKey: "brand",
        header: "Merek",
        cell: (info) => <span className="font-semibold text-slate-900">{info.getValue() as string}</span>,
      },
      { accessorKey: "type", header: "Tipe / Model" },
      {
        accessorKey: "serialNumber",
        header: "Nomor Seri",
        cell: (info) => <span className="font-mono text-xs text-slate-600">{info.getValue() as string || "-"}</span>,
      },
      {
        id: "capacity",
        header: "Kapasitas Maks.",
        accessorFn: (row) => `${row.capacityValue} ${row.capacityUnit}`,
      },
      {
        id: "dayabaca",
        header: "Daya Baca",
        accessorFn: (row) => `${row.dayabaca} ${row.dayabacaUnit}`,
      },
      {
        accessorKey: "class",
        header: "Kelas",
        cell: (info) => <Badge tone="blue">Kelas {info.getValue() as string}</Badge>,
      },
      {
        id: "aksi",
        header: "Aksi",
        cell: ({ row }) => {
          const inst = row.original;
          return (
            <div className="flex justify-end gap-1.5">
              {canDelete && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => { setEditingInstrument(inst); setIsEditInstrumentOpen(true); }}
                  className="text-xs h-7 px-2"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              )}
              {canDelete && (
                <Button size="sm" variant="secondary" onClick={() => handleDeleteInstrument(inst.id, inst.brand)} className="text-xs h-7 px-2">
                  <Trash2 className="h-3.5 w-3.5 text-red-600" />
                </Button>
              )}
            </div>
          );
        },
      }
    );
    return cols;
  }, [isAdmin, canDelete]);

  const tableAlat = useReactTable({
    data: instruments || [],
    columns: instrumentColumns,
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

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

              <div className="flex items-center gap-2">
                {!isOwner && (
                  <>
                    <span className="text-xs text-slate-500">Status:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-navy-900 focus:outline-none"
                    >
                      <option value="">Semua Status</option>
                      <option value="MENUNGGU_VERIFIKASI">Menunggu Verifikasi</option>
                      <option value="DIJADWALKAN">Dijadwalkan</option>
                      <option value="DIPROSES">Sedang Diproses</option>
                      <option value="SELESAI">Selesai</option>
                      <option value="DITOLAK">Ditolak</option>
                    </select>
                  </>
                )}
              </div>
            </div>
          </CardHeader>

          <CardBody className="p-0">
            <Table>
              <Thead>
                <Tr>
                  <Th>No. Permohonan</Th>
                  <Th>Pemilik / Perusahaan</Th>
                  <Th>Alat Ukur</Th>
                  <Th>Layanan / Lokasi</Th>
                  <Th>Jadwal Tera</Th>
                  <Th>Petugas</Th>
                  <Th>Status</Th>
                  <Th className="text-center">Aksi</Th>
                </Tr>
              </Thead>
              <tbody>
                {loadingPermohonan ? (
                  <EmptyState colSpan={8} message="Memuat daftar permohonan..." />
                ) : !permohonanList || permohonanList.length === 0 ? (
                  <EmptyState
                    colSpan={8}
                    message={
                      isOwner
                        ? "Anda belum memiliki permohonan peneraan. Klik tombol Ajukan Permohonan Tera di atas."
                        : "Belum ada permohonan peneraan yang diajukan."
                    }
                  />
                ) : (
                  permohonanList.map((item) => (
                    <Tr key={item.id}>
                      <Td className="font-mono text-xs font-semibold text-slate-800">
                        {item.applicationNumber}
                      </Td>
                      <Td className="font-medium text-slate-900">{item.companyName || "-"}</Td>
                      <Td>
                        <div className="font-medium text-slate-900">
                          {item.instrumentBrand} {item.instrumentType ? `(${item.instrumentType})` : ""}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          SN: {item.instrumentSerial || "-"}
                        </div>
                      </Td>
                      <Td>
                        <span className="inline-block text-xs font-medium text-slate-700">
                          {layananLabel[item.layanan]}
                        </span>
                        <span className="block text-[11px] text-slate-400">
                          {lokasiLabel[item.lokasi]}
                        </span>
                      </Td>
                      <Td className="text-xs">
                        {item.jadwalTanggal ? (
                          <span className="font-medium text-slate-800">
                            {formatDate(item.jadwalTanggal)}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Belum dijadwalkan</span>
                        )}
                      </Td>
                      <Td className="text-xs text-slate-700">
                        {item.petugasName || <span className="text-slate-400">-</span>}
                      </Td>
                      <Td>
                        <Badge tone={statusPermohonanTone[item.status]}>
                          {statusPermohonanLabel[item.status]}
                        </Badge>
                      </Td>
                      <Td className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* SKEMA 1 LANGKAH 2: Admin Meninjau & Menjadwalkan */}
                          {isAdmin && item.status === "MENUNGGU_VERIFIKASI" && (
                            <Button
                              size="sm"
                              onClick={() => handleOpenReview(item)}
                              className="text-xs h-7 px-2.5 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              Ajukan Tera
                            </Button>
                          )}

                          {/* SKEMA 1 & 2 LANGKAH 3: Petugas Input Cerapan */}
                          {isInspector && ["DIJADWALKAN", "DIPROSES"].includes(item.status) && (
                            <Button
                              size="sm"
                              onClick={() => handleOpenCerapan(item)}
                              className="text-xs h-7 px-2.5 bg-emerald-700 hover:bg-emerald-800 text-white"
                            >
                              Input Cerapan
                            </Button>
                          )}

                          {/* SKEMA 1 & 2 LANGKAH 4: Admin Terbitkan Sertifikat */}

                          {isAdmin &&
                            item.status === "SELESAI" &&
                            item.testObservationId &&
                            !item.certificateId && (
                              <Button
                                size="sm"
                                onClick={() => handleOpenSertifikat(item)}
                                className="text-xs h-7 px-2.5 bg-brass-500 hover:bg-brass-600 text-white"
                              >
                                Terbitkan Sertifikat
                              </Button>
                            )}

                          {/* SKEMA 1 & 2 LANGKAH 5: Pemilik / Admin Lihat & Unduh Sertifikat */}
                          {item.certificateId && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleOpenViewCertificate(item)}
                              className="text-xs h-7 px-2.5 gap-1 text-navy-900 border-navy-900/30 hover:bg-navy-50"
                            >
                              <FileCheck2 className="h-3.5 w-3.5 text-emerald-600" />
                              Lihat SKHP
                            </Button>
                          )}
                          {canDelete && !["SELESAI", "TIDAK_LULUS_UJI", "DITOLAK"].includes(item.status) && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => { setEditingPermohonan(item); setIsEditPermohonanOpen(true); }}
                              className="text-xs h-7 px-2"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleDeletePermohonan(item.id, item.applicationNumber)}
                              className="text-xs h-7 px-2"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-red-600" />
                            </Button>
                          )}
                        </div>
                      </Td>
                    </Tr>
                  ))
                )}
              </tbody>
            </Table>
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
                {isInspector ? "Daftar Tugas Pengujian Peneraan Anda" : "Semua Penugasan Petugas Penera"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Alat ukur yang telah dijadwalkan untuk dilaksanakan pengujian teknis metrologi.
              </p>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <Table>
              <Thead>
                <Tr>
                  <Th>No. Permohonan</Th>
                  <Th>Jadwal Pelaksanaan</Th>
                  <Th>Perusahaan / Pemilik</Th>
                  <Th>Lokasi & Kontak</Th>
                  <Th>Spesifikasi Alat</Th>
                  <Th>Status</Th>
                  <Th className="text-center">Aksi</Th>
                </Tr>
              </Thead>
              <tbody>
                {loadingTasks ? (
                  <EmptyState colSpan={7} message="Memuat jadwal penugasan..." />
                ) : !myTasks || myTasks.length === 0 ? (
                  <EmptyState colSpan={7} message="Tidak ada tugas pengujian aktif saat ini." />
                ) : (
                  myTasks.map((task) => (
                    <Tr key={task.id}>
                      <Td className="font-mono text-xs font-semibold text-slate-800">
                        {task.applicationNumber}
                      </Td>
                      <Td className="text-xs">
                        <div className="font-semibold text-navy-950 flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {task.jadwalTanggal ? formatDate(task.jadwalTanggal) : "-"}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {layananLabel[task.layanan]}
                        </div>
                      </Td>
                      <Td className="font-medium text-slate-900">{task.companyName}</Td>
                      <Td className="text-xs text-slate-600">
                        <div>{lokasiLabel[task.lokasi]}</div>
                        <div className="text-[11px] text-slate-400">{task.companyPhone}</div>
                      </Td>
                      <Td className="text-xs">
                        <span className="font-semibold text-slate-900">{task.instrumentBrand}</span>{" "}
                        <span className="text-slate-500">
                          ({task.capacityValue} {task.capacityUnit}, Kelas {task.class})
                        </span>
                      </Td>
                      <Td>
                        <Badge tone={statusPermohonanTone[task.status]}>
                          {statusPermohonanLabel[task.status]}
                        </Badge>
                      </Td>
                      <Td className="text-right">
                        <Button
                          size="sm"
                          onClick={() => handleOpenCerapan(task)}
                          className="text-xs h-7 px-2.5 bg-emerald-700 hover:bg-emerald-800 text-white gap-1"
                        >
                          <FileSpreadsheet className="h-3.5 w-3.5" />
                          Input Cerapan Uji
                        </Button>
                      </Td>
                    </Tr>
                  ))
                )}
              </tbody>
            </Table>
          </CardBody>
        </Card>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 3: DAFTAR ALAT UKUR (UTTP) - MENGGUNAKAN TANSTACK TABLE           */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "alat" && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  {isOwner ? "Data Alat Ukur Milik Anda" : "Semua Data Alat Ukur (UTTP)"}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftar UTTP terdaftar yang dapat diajukan untuk peneraan.
                </p>
              </div>

              {/* HANYA TOMBOL TAMBAH DI SINI */}
              <Button size="sm" onClick={() => handleOpenCreateInstrument()} className="gap-1.5 shrink-0">
                <Plus className="h-4 w-4" /> Daftarkan Alat Baru
              </Button>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <Table>
              <Thead>
                {/* BARIS 1: JUDUL KOLOM OTOMATIS */}
                {tableAlat.getHeaderGroups().map((headerGroup) => (
                  <Tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <Th key={header.id} className="align-top">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </Th>
                    ))}
                  </Tr>
                ))}

                {/* BARIS 2: KOTAK FILTER (ADMIN LTE STYLE) */}
                <Tr className="bg-slate-50/50">
                  {tableAlat.getHeaderGroups()[0].headers.map((header) => {
                    const colId = header.column.id;

                    return (
                      <Th key={colId + "-filter"} className="py-2 px-3 align-top">
                        {/* FILTER NAMA PEMILIK & MEREK (Input Teks) */}
                        {["ownerName", "brand"].includes(colId) ? (
                          <input
                            type="text"
                            placeholder="Cari..."
                            value={(header.column.getFilterValue() ?? "") as string}
                            onChange={(e) => header.column.setFilterValue(e.target.value)}
                            className="w-full min-w-[100px] rounded border border-slate-300 bg-white px-2 py-1.5 text-xs font-normal text-slate-700 shadow-sm focus:border-navy-500 focus:outline-none"
                          />
                        ) :

                          /* FILTER JENIS ALAT (Dropdown) */
                          colId === "jenisAlat" ? (
                            <select
                              value={(header.column.getFilterValue() ?? "") as string}
                              onChange={(e) => header.column.setFilterValue(e.target.value)}
                              className="w-full min-w-[130px] rounded border border-slate-300 bg-white px-2 py-1.5 text-xs font-normal text-slate-700 shadow-sm focus:border-navy-500 focus:outline-none"
                            >
                              <option value=""></option>
                              {Object.entries(jenisAlatLabel).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                              ))}
                            </select>
                          ) :

                            /* FILTER KELAS (Dropdown) */
                            colId === "class" ? (
                              <select
                                value={(header.column.getFilterValue() ?? "") as string}
                                onChange={(e) => header.column.setFilterValue(e.target.value)}
                                className="w-full min-w-[80px] rounded border border-slate-300 bg-white px-2 py-1.5 text-xs font-normal text-slate-700 shadow-sm focus:border-navy-500 focus:outline-none"
                              >
                                <option value=""></option>
                                <option value="I">Kelas I</option>
                                <option value="II">Kelas II</option>
                                <option value="III">Kelas III</option>
                                <option value="IIII">Kelas IIII</option>
                              </select>
                            ) : (

                              /* KOLOM TANPA FILTER (Kosongkan dengan {null}) */
                              null
                            )}
                      </Th>
                    );
                  })}
                </Tr>
              </Thead>

              {/* BODY TABEL */}
              <tbody>
                {tableAlat.getRowModel().rows.length === 0 ? (
                  <EmptyState colSpan={isAdmin ? 9 : 8} message="Tidak ada alat ukur yang sesuai dengan pencarian." />
                ) : (
                  tableAlat.getRowModel().rows.map((row) => (
                    <Tr key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <Td key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </Td>
                      ))}
                    </Tr>
                  ))
                )}
              </tbody>
            </Table>
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
            <Table>
              <Thead>
                <Tr>
                  <Th>No. Sertifikat</Th>
                  <Th>Perusahaan / Pemilik</Th>
                  <Th>Alat Ukur</Th>
                  <Th>Tanggal Terbit</Th>
                  <Th>Masa Berlaku Hingga</Th>
                  <Th>Status</Th>
                  <Th className="text-center">Aksi</Th>
                </Tr>
              </Thead>
              <tbody>
                {loadingCerts ? (
                  <EmptyState colSpan={7} message="Memuat daftar sertifikat..." />
                ) : certificates.length === 0 ? (
                  <EmptyState colSpan={7} message="Belum ada sertifikat yang diterbitkan." />
                ) : (
                  certificates.map((cert) => (
                    <Tr key={cert.id}>
                      <Td className="font-mono text-xs font-semibold text-navy-950">
                        {cert.certificateNumber}
                      </Td>
                      <Td className="font-medium text-slate-900">{cert.companyName || "-"}</Td>
                      <Td>
                        <span className="font-medium text-slate-900">{cert.instrumentBrand || "-"}</span>
                        <span className="text-[11px] text-slate-400 block font-mono">
                          SN: {cert.instrumentSerial || "-"}
                        </span>
                      </Td>
                      <Td className="text-xs text-slate-600">{formatDate(cert.issueDate)}</Td>
                      <Td className="text-xs font-medium text-slate-900">
                        {formatDate(cert.expiryDate)}
                      </Td>
                      <Td>
                        <Badge tone={cert.status === "active" ? "green" : "red"}>
                          {cert.status === "active" ? "Aktif" : "Kedaluwarsa"}
                        </Badge>
                      </Td>
                      <Td className="text-center">
                        <div className="flex justify-end gap-1.5">
                          <Button size="sm" variant="secondary" onClick={() => { setSelectedCertificate(cert); setIsCertViewOpen(true); }} className="text-xs h-7 px-2.5 gap-1">
                            <Eye className="h-3.5 w-3.5" /> Lihat / Cetak
                          </Button>
                          {canDelete && (
                            <Button size="sm" variant="secondary" onClick={() => handleDeleteCertificate(cert.id, cert.certificateNumber)} className="text-xs h-7 px-2">
                              <Trash2 className="h-3.5 w-3.5 text-red-600" />
                            </Button>
                          )}
                        </div>
                      </Td>
                    </Tr>
                  ))
                )}
              </tbody>
            </Table>
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
            <Table>
              <Thead>
                <Tr>
                  <Th>Nama Perusahaan / Pemilik</Th>
                  <Th>Telepon / Kontak</Th>
                  <Th>Alamat Kantor / Pabrik</Th>
                  <Th>Tanggal Terdaftar</Th>
                  <Th className="text-center">Aksi</Th>
                </Tr>
              </Thead>
              <tbody>
                {owners.length === 0 ? (
                  <EmptyState colSpan={5} message="Belum ada data pemilik terdaftar." />
                ) : (
                  owners.map((owner) => (
                    <Tr key={owner.id}>
                      <Td className="font-semibold text-slate-900">{owner.companyName}</Td>
                      <Td className="font-mono text-xs text-slate-700">{owner.phone}</Td>
                      <Td className="text-xs text-slate-600 max-w-xs truncate">{owner.address}</Td>
                      <Td className="text-xs text-slate-500">{formatDate(owner.createdAt)}</Td>
                      <Td className="text-center">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleOpenCreateInstrument(owner.id)}
                            className="text-xs h-7 px-2"
                          >
                            + Tambah Alat
                          </Button>
                          {canDelete && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => { setEditingOwner(owner); setIsEditOwnerOpen(true); }}
                              className="text-xs h-7 px-2"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleDeleteOwner(owner.id, owner.companyName)}
                              className="text-xs h-7 px-2"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-red-600" />
                            </Button>
                          )}
                        </div>
                      </Td>
                    </Tr>
                  ))
                )}
              </tbody>
            </Table>
          </CardBody>
        </Card>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MODAL DIALOGS                                                         */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}

      <OwnerProfileModal
        isOpen={isOwnerModalOpen}
        onClose={() => setIsOwnerModalOpen(false)}
        existingOwner={myOwnerProfile ?? null}
        onSuccess={refreshAll}
      />

      <InstrumentFormModal
        isOpen={isInstrumentModalOpen}
        onClose={() => setIsInstrumentModalOpen(false)}
        owners={owners.length > 0 ? owners : myOwnerProfile ? [myOwnerProfile] : []}
        defaultOwnerId={instrumentDefaultOwnerId || myOwnerProfile?.id}
        onSuccess={refreshAll}
      />

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

      <ReviewJadwalModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        permohonan={selectedPermohonan}
        inspectors={inspectors}
        onSuccess={refreshAll}
      />

      <InputCerapanModal
        isOpen={isCerapanModalOpen}
        onClose={() => setIsCerapanModalOpen(false)}
        permohonan={selectedPermohonan}
        onSuccess={refreshAll}
      />

      <TerbitkanSertifikatModal
        isOpen={isSertifikatModalOpen}
        onClose={() => setIsSertifikatModalOpen(false)}
        permohonan={selectedPermohonan}
        onSuccess={refreshAll}
      />

      <CertificateViewModal
        isOpen={isCertViewOpen}
        onClose={() => setIsCertViewOpen(false)}
        certificate={selectedCertificate}
        permohonan={selectedPermohonan}
      />

      <RegistrasiOfflineForm
        isOpen={isOfflineModalOpen}
        onClose={() => {
          setIsOfflineModalOpen(false);
          refreshAll();
        }}
        inspectors={inspectors}
      />

      <InstrumentFormModal
        isOpen={isEditInstrumentOpen}
        onClose={() => setIsEditInstrumentOpen(false)}
        owners={owners.length > 0 ? owners : myOwnerProfile ? [myOwnerProfile] : []}
        existingInstrument={editingInstrument}
        onSuccess={refreshAll}
      />

      <OwnerProfileModal
        isOpen={isEditOwnerOpen}
        onClose={() => setIsEditOwnerOpen(false)}
        existingOwner={editingOwner}
        onSuccess={refreshAll}
      />

      <EditPermohonanModal
        isOpen={isEditPermohonanOpen}
        onClose={() => setIsEditPermohonanOpen(false)}
        permohonan={editingPermohonan}
        onSuccess={refreshAll}
      />
    </div>
  );
}