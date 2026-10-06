import { api } from "./api";

export const documentCategories = ["SOP", "IK", "IK_ALAT", "FORMULIR", "CERAPAN"] as const;
export type DocumentCategory = (typeof documentCategories)[number];

export const categoryLabel: Record<DocumentCategory, string> = {
  SOP: "SOP",
  IK: "Instruksi Kerja",
  IK_ALAT: "Instruksi Kerja Alat",
  FORMULIR: "Formulir",
  CERAPAN: "Cerapan",
};

export type QualityDocument = {
  id: string;
  code: string;
  name: string;
  category: DocumentCategory;
  version: number;
  effectiveDate: string;
  fileName: string;
  fileMimeType: string;
  fileSize: number;
  isActive: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function fetchQualityDocuments(category?: DocumentCategory) {
  const { data } = await api.get<{ data: QualityDocument[] }>("/quality-documents", {
    params: category ? { category } : undefined,
  });
  return data.data;
}

export async function fetchExpiredQualityDocuments() {
  const { data } = await api.get<{ data: QualityDocument[] }>("/quality-documents/expired");
  return data.data;
}

export async function fetchQualityDocument(id: string) {
  const { data } = await api.get<{ data: QualityDocument; history: QualityDocument[] }>(
    `/quality-documents/${id}`
  );
  return data;
}

export type CreateDocumentInput = {
  code: string;
  name: string;
  category: DocumentCategory;
  effectiveDate: string;
  file: File;
};

export async function createQualityDocument(input: CreateDocumentInput) {
  const formData = new FormData();
  formData.append("code", input.code);
  formData.append("name", input.name);
  formData.append("category", input.category);
  formData.append("effectiveDate", input.effectiveDate);
  formData.append("file", input.file);

  const { data } = await api.post("/quality-documents", formData);
  return data;
}

export type ReviseDocumentInput = {
  id: string;
  code?: string;
  name?: string;
  effectiveDate: string;
  file: File;
};

export async function reviseQualityDocument({ id, ...input }: ReviseDocumentInput) {
  const formData = new FormData();
  if (input.code) formData.append("code", input.code);   // ⬅️ baris yang hilang
  if (input.name) formData.append("name", input.name);
  formData.append("effectiveDate", input.effectiveDate);
  formData.append("file", input.file);

  const { data } = await api.post(`/quality-documents/${id}/revise`, formData);
  return data;
}

export async function deleteQualityDocument(id: string) {
  const { data } = await api.delete(`/quality-documents/${id}`);
  return data;
}

// Endpoint file butuh header Authorization, jadi tidak bisa dibuka lewat <a href> biasa.
// Ambil sebagai blob dulu (axios otomatis menyisipkan Bearer token), baru dibuka di tab baru.
export async function openDocumentFile(id: string) {
  const { data } = await api.get(`/quality-documents/${id}/file`, { responseType: "blob" });
  const url = URL.createObjectURL(data as Blob);
  window.open(url, "_blank");
  // beri waktu tab baru untuk load sebelum URL di-revoke
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export function formatVersionLabel(version: number): string {
  return `Rev ${String(version + 1).padStart(2, "0")}`;
}

export function computeNextDocumentCode(currentCode: string, currentVersion: number): string {
  const parts = currentCode.split("/");
  const nextRevisionDisplay = currentVersion + 1;
  parts[parts.length - 1] = String(nextRevisionDisplay).padStart(2, "0");
  return parts.join("/");
}

export type EditDocumentInput = {
  id: string;
  code?: string;
  name?: string;
  category?: DocumentCategory;
  effectiveDate?: string;
  file?: File;
};

export async function editQualityDocument({ id, ...input }: EditDocumentInput) {
  const formData = new FormData();
  if (input.code) formData.append("code", input.code);
  if (input.name) formData.append("name", input.name);
  if (input.category) formData.append("category", input.category);
  if (input.effectiveDate) formData.append("effectiveDate", input.effectiveDate);
  if (input.file) formData.append("file", input.file);

  const { data } = await api.patch(`/quality-documents/${id}`, formData);
  return data;
}

export type DeletedQualityDocument = QualityDocument & { deletedAt: string };

export async function fetchDeletedQualityDocuments() {
  const { data } = await api.get<{ data: DeletedQualityDocument[] }>("/quality-documents/trash");
  return data.data;
}

export async function restoreQualityDocument(id: string) {
  const { data } = await api.patch(`/quality-documents/${id}/restore`);
  return data;
}

export async function permanentlyDeleteQualityDocument(id: string) {
  const { data } = await api.delete(`/quality-documents/${id}/permanent`);
  return data;
}