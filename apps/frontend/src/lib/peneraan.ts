import { api } from "./api";

export const statusPermohonanList = [
  "MENUNGGU_VERIFIKASI",
  "DIJADWALKAN",
  "DIPROSES",
  "SELESAI",
  "DITOLAK",
] as const;
export type StatusPermohonan = (typeof statusPermohonanList)[number];

export const statusPermohonanLabel: Record<StatusPermohonan, string> = {
  MENUNGGU_VERIFIKASI: "Menunggu Verifikasi",
  DIJADWALKAN: "Dijadwalkan",
  DIPROSES: "Sedang Diproses",
  SELESAI: "Selesai",
  DITOLAK: "Ditolak",
};

export const statusPermohonanTone: Record<StatusPermohonan, "slate" | "blue" | "amber" | "red" | "green"> = {
  MENUNGGU_VERIFIKASI: "amber",
  DIJADWALKAN: "blue",
  DIPROSES: "blue",
  SELESAI: "green",
  DITOLAK: "red",
};

export const jenisLayananList = ["TERA", "TERA_ULANG"] as const;
export type JenisLayanan = (typeof jenisLayananList)[number];

export const layananLabel: Record<JenisLayanan, string> = {
  TERA: "Tera",
  TERA_ULANG: "Tera Ulang",
};

export const lokasiList = ["KANTOR", "TEMPAT_PAKAI"] as const;
export type LokasiPeneraan = (typeof lokasiList)[number];

export const lokasiLabel: Record<LokasiPeneraan, string> = {
  KANTOR: "Kantor Metrologi",
  TEMPAT_PAKAI: "Tempat Pakai / Lapangan",
};

export const capacityUnits = ["kg", "L", "g", "mL"] as const;
export type CapacityUnit = (typeof capacityUnits)[number];

export const instrumentClasses = ["I", "II", "III", "IIII"] as const;
export type InstrumentClass = (typeof instrumentClasses)[number];

export const jenisAlatUttpList = [
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
  "ANAK_TIMBANGAN",
] as const;
export type JenisAlatUttp = (typeof jenisAlatUttpList)[number];

export const certificateStatusLabel = {
  active: "Aktif",
  expired: "Kedaluwarsa",
  revoked: "Dicabut",
} as const;

export const jenisAlatLabel: Record<JenisAlatUttp, string> = {
  TIMBANGAN_ELEKTRONIK: "Timbangan Elektronik",
  TIMBANGAN_MEJA: "Timbangan Meja",
  TIMBANGAN_JEMBATAN: "Timbangan Jembatan",
  DACIN: "Dacin",
  TIMBANGAN_PEGAS: "Timbangan Pegas",
  TIMBANGAN_SENTISIMAL: "Timbangan Sentisimal",
  TIMBANGAN_BOBOT_INGSUT: "Timbangan Bobot Ingsut",
  NERACA_EMAS: "Neraca Emas",
  NERACA_OBAT: "Neraca Obat",
  POMPA_UKUR_BBM: "Pompa Ukur BBM",
  METER_AIR: "Meter Air",
  METER_KWH: "Meter kWh",
  ANAK_TIMBANGAN: "Anak Timbangan",
};

// ─── TIPE ENTITAS ────────────────────────────────────────────────────────────

export type InstrumentOwner = {
  id: string;
  userId: string | null;
  companyName: string;
  address: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
};

export type Instrument = {
  id: string;
  ownerId: string;
  ownerName?: string;
  jenisAlat: JenisAlatUttp;
  brand: string;
  type: string | null;
  serialNumber: string | null;
  capacityValue: string;
  capacityUnit: CapacityUnit;
  dayabaca: string;
  dayabacaUnit: CapacityUnit;
  class: InstrumentClass;
  registeredby?: string | null;
  registeredAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type TestObservation = {
  id: string;
  instrumentId: string;
  inspectorId: string;
  observationData: Record<string, any>;
  status: "SAH" | "BATAL";
  testedAt: string;
  createdAt: string;
};

export type Certificate = {
  id: string;
  observationId: string;
  certificateNumber: string;
  issuedBy: string;
  issueDate: string;
  expiryDate: string;
  status: "active" | "expired" | "revoked";
  createdAt: string;
  instrumentId?: string;
  instrumentJenisAlat?: string;
  instrumentBrand?: string;
  instrumentType?: string;
  instrumentSerial?: string;
  companyName?: string;
  class?: string;
};

export type PermohonanPeneraan = {
  id: string;
  applicationNumber: string;
  ownerId: string;
  instrumentId: string;
  layanan: JenisLayanan;
  lokasi: LokasiPeneraan;
  status: StatusPermohonan;
  jadwalTanggal: string | null;
  petugasId: string | null;
  catatan: string | null;
  testObservationId?: string | null;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;

  // Joined fields
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  ownerUserId?: string | null;
  instrumentJenisAlat?: JenisAlatUttp;
  instrumentBrand?: string;
  instrumentType?: string;
  instrumentSerial?: string;
  capacityValue?: string;
  capacityUnit?: CapacityUnit;
  dayabaca?: string;
  dayabacaUnit?: CapacityUnit;
  class?: InstrumentClass;
  petugasName?: string;
  certificateId?: string | null;
  certificateNumber?: string | null;
  observationStatus?: "SAH" | "BATAL" | null;
  observation?: TestObservation | null;
  certificate?: Certificate | null;
};

// ─── API FUNCTIONS ───────────────────────────────────────────────────────────

export async function fetchPermohonan(filter?: {
  status?: StatusPermohonan;
  ownerId?: string;
  petugasId?: string;
}) {
  const { data } = await api.get<{ data: PermohonanPeneraan[]; total: number }>("/permohonan", {
    params: filter,
  });
  return data.data;
}

export async function fetchMyPermohonan() {
  const { data } = await api.get<{ data: PermohonanPeneraan[]; total: number }>("/permohonan/my");
  return data.data;
}

export async function fetchMyTasks() {
  const { data } = await api.get<{ data: PermohonanPeneraan[]; total: number }>("/permohonan/tugas-saya");
  return data.data;
}

export async function fetchPermohonanDetail(id: string) {
  const { data } = await api.get<{ data: PermohonanPeneraan }>(`/permohonan/${id}`);
  return data.data;
}

export type CreatePermohonanInput = {
  ownerId: string;
  instrumentId: string;
  layanan: JenisLayanan;
  lokasi: LokasiPeneraan;
  catatan?: string;
  jadwalTanggal?: string;
  petugasId?: string;
};

export async function createPermohonan(input: CreatePermohonanInput) {
  const { data } = await api.post<{ message: string; data: PermohonanPeneraan }>("/permohonan", input);
  return data.data;
}

export type ReviewJadwalInput = {
  status: "DIJADWALKAN" | "DITOLAK" | "MENUNGGU_VERIFIKASI";
  jadwalTanggal?: string;
  petugasId?: string;
  catatan?: string;
};

export async function reviewPermohonanJadwal(id: string, input: ReviewJadwalInput) {
  const { data } = await api.patch<{ message: string; data: PermohonanPeneraan }>(
    `/permohonan/${id}/jadwal`,
    input
  );
  return data.data;
}

export async function updatePermohonanStatus(
  id: string,
  input: { status: StatusPermohonan; testObservationId?: string; catatan?: string }
) {
  const { data } = await api.patch<{ message: string; data: PermohonanPeneraan }>(
    `/permohonan/${id}/status`,
    input
  );
  return data.data;
}

// ─── DATA MASTER INSTRUMEN & PEMILIK ─────────────────────────────────────────

export async function fetchOwners() {
  const { data } = await api.get<{ data: InstrumentOwner[] }>("/owners");
  return data.data;
}

export async function fetchMyOwnerProfile() {
  const { data } = await api.get<{ data: InstrumentOwner | null }>("/owners/me");
  return data.data;
}

export type CreateOwnerInput = {
  companyName: string;
  address: string;
  phone: string;
  userId?: string;
};

export async function createOwner(input: CreateOwnerInput) {
  const { data } = await api.post<{ message: string; data: InstrumentOwner }>("/owners", input);
  return data.data;
}

export async function updateOwner(id: string, input: Omit<CreateOwnerInput, "userId">) {
  const { data } = await api.put<{ message: string }>(`/owners/${id}`, input);
  return data;
}

export async function fetchInstruments(ownerId?: string) {
  const { data } = await api.get<{ data: Instrument[]; total: number }>("/instruments", {
    params: ownerId ? { ownerId } : undefined,
  });
  return data.data;
}

export type CreateInstrumentInput = {
  ownerId: string;
  jenisAlat: JenisAlatUttp;
  brand: string;
  type?: string;
  serialNumber?: string;
  capacityValue: number;
  capacityUnit: CapacityUnit;
  dayabaca: number;
  dayabacaUnit: CapacityUnit;
  class: InstrumentClass;
};

export async function createInstrument(input: CreateInstrumentInput) {
  const { data } = await api.post<{ message: string; data: Instrument }>("/instruments", input);
  return data.data;
}

// ─── CERAPAN & SERTIFIKAT ────────────────────────────────────────────────────

export type CreateObservationInput = {
  instrumentId: string;
  status: "SAH" | "BATAL";
  observationData: Record<string, any>;
};

export async function createObservation(input: CreateObservationInput) {
  const { data } = await api.post<{ message: string; data: TestObservation }>("/observations", input);
  return data.data;
}

export type CreateCertificateInput = {
  observationId: string;
  expiryDate: string;
  certificateNumber?: string;
};

export async function createCertificate(input: CreateCertificateInput) {
  const { data } = await api.post<{ message: string; data: Certificate }>("/certificates", input);
  return data.data;
}

export async function fetchCertificates(observationId?: string) {
  const { data } = await api.get<{ data: Certificate[]; total: number }>("/certificates", {
    params: observationId ? { observationId } : undefined,
  });
  return data.data;
}

export async function fetchMyCertificates() {
  const { data } = await api.get<{ data: Certificate[]; total: number }>("/certificates/my");
  return data.data;
}

export async function fetchInspectors() {
  const { data } = await api.get<{ data: { id: string; name: string; email: string; role: string }[] }>(
    "/auth/users"
  );
  return data.data.filter((u) => u.role === "petugas_penera");
}

export async function deleteOwner(id: string) {
  const { data } = await api.delete<{ message: string }>(`/owners/${id}`);
  return data;
}

export async function deleteInstrument(id: string) {
  const { data } = await api.delete<{ message: string }>(`/instruments/${id}`);
  return data;
}

export async function deletePermohonan(id: string) {
  const { data } = await api.delete<{ message: string }>(`/permohonan/${id}`);
  return data;
}

export async function deleteCertificate(id: string) {
  const { data } = await api.delete<{ message: string }>(`/certificates/${id}`);
  return data;
}

export type UpdateInstrumentInput = Partial<Omit<CreateInstrumentInput, "ownerId">>;

export async function updateInstrument(id: string, input: UpdateInstrumentInput) {
  const { data } = await api.patch<{ message: string; data: Instrument }>(`/instruments/${id}`, input);
  return data.data;
}

export type EditPermohonanInput = {
  layanan?: JenisLayanan;
  lokasi?: LokasiPeneraan;
  jadwalTanggal?: string | null;
  petugasId?: string;
  catatan?: string;
};

export async function editPermohonan(id: string, input: EditPermohonanInput) {
  const { data } = await api.patch<{ message: string; data: PermohonanPeneraan }>(`/permohonan/${id}/edit`, input);
  return data.data;
}
