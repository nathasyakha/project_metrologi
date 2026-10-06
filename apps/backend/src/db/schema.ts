import { mysqlTable, varchar, int, timestamp, json, text, mysqlEnum, decimal, boolean, longtext } from 'drizzle-orm/mysql-core';

export const roles = ['admin', 'petugas_penera', 'pemilik_alat', 'kepala', 'staf', 'pengamat_tera', 'pengawas'] as const;

export const capacityUnit = ['kg', 'L', 'g', 'mL'] as const;

export const documentCategory = ['SOP', 'IK', 'IK_ALAT', 'FORMULIR', 'CERAPAN'] as const;

export const jenisAlatUttp = [
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

export const users = mysqlTable('users', {

  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: mysqlEnum('role', roles).notNull(),
  nip: varchar('nip', { length: 30 }).unique(),
  isActive: int('is_active').default(1),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export const auditLogs = mysqlTable('audit_logs', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).references(() => users.id),
  action: varchar('action', { length: 50 }),
  tableName: varchar('table_name', { length: 100 }),
  recordId: varchar('record_id', { length: 36 }),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const instrumentOwners = mysqlTable('instrument_owners', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).references(() => users.id), // Link to user account
  companyName: varchar('company_name', { length: 255 }).notNull(),
  address: text('address').notNull(),
  phone: varchar('phone', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export const instruments = mysqlTable('instruments', {
  id: varchar('id', { length: 36 }).primaryKey(),
  ownerId: varchar('owner_id', { length: 36 }).references(() => instrumentOwners.id),
  jenisAlat: mysqlEnum("jenis_alat", jenisAlatUttp).notNull().default('TIMBANGAN_ELEKTRONIK'),
  brand: varchar('brand', { length: 100 }).notNull(),
  type: varchar('type', { length: 100 }),
  serialNumber: varchar('serial_number', { length: 100 }),
  capacityValue: decimal('capacity_value', { precision: 10, scale: 2 }).notNull(),
  capacityUnit: mysqlEnum('capacity_unit', capacityUnit).notNull(),
  dayabaca: decimal('dayabaca', { precision: 10, scale: 5 }).notNull(),
  dayabacaUnit: mysqlEnum('dayabaca_unit', capacityUnit).notNull(),
  class: mysqlEnum('class', ['I', 'II', 'III', 'IIII']).notNull(),
  registeredby: varchar('registered_by', { length: 36 }).references(() => users.id),
  registeredAt: timestamp('registered_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export const testObservations = mysqlTable('test_observations', {
  id: varchar('id', { length: 36 }).primaryKey(),
  instrumentId: varchar('instrument_id', { length: 36 }).notNull().references(() => instruments.id),
  inspectorId: varchar('inspector_id', { length: 36 }).references(() => users.id), // Petugas Penera
  observationData: json('observation_data').notNull(), // Dynamic fields per instrument type
  status: mysqlEnum('status', ['SAH', 'BATAL']).notNull(), // Sah / Batal
  testedAt: timestamp('tested_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const certificates = mysqlTable('certificates', {
  id: varchar('id', { length: 36 }).primaryKey(),
  observationId: varchar('observation_id', { length: 36 }).references(() => testObservations.id),
  certificateNumber: varchar('certificate_number', { length: 100 }).notNull().unique(),
  issuedBy: varchar('issued_by', { length: 36 }).references(() => users.id), // Admin or Kepala
  issueDate: timestamp('issue_date').defaultNow(),
  status: mysqlEnum('certificate_status', [
    'active',
    'expired',
    'revoked'
  ]).notNull().default('active'),
  expiryDate: timestamp('expiry_date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const qualityDocuments = mysqlTable('quality_documents', {
  id: varchar('id', { length: 36 }).primaryKey(),
  code: varchar('code', { length: 100 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  category: mysqlEnum('category', documentCategory).notNull(),
  version: int('version').notNull().default(0),
  effectiveDate: timestamp('effective_date').notNull(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileMimeType: varchar('file_mime_type', { length: 100 }).notNull(),
  fileSize: int('file_size').notNull(),
  fileData: longtext('file_data').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdBy: varchar('created_by', { length: 36 }).references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
  deletedAt: timestamp('deleted_at'),
});

export const jenisPengawasan = [
  'KUANTITAS_BDKT',
  'SATUAN_UKURAN',
  'PELABELAN_BDKT',
  'PENGAMATAN_UTTP',
] as const;

export const pengawasan = mysqlTable('pengawasan', {
  id: varchar('id', { length: 36 }).primaryKey(),
  jenisPengujian: mysqlEnum('jenis_pengujian', jenisPengawasan).notNull(),
  tanggalPengawasan: timestamp('tanggal_pengawasan').notNull(),
  alamat: varchar('alamat', { length: 255 }).notNull(),
  petugasId: varchar('petugas_id', { length: 36 }).references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export const pengawasanCerapan = mysqlTable('pengawasan_cerapan', {
  id: varchar('id', { length: 36 }).primaryKey(),
  pengawasanId: varchar('pengawasan_id', { length: 36 }).notNull().references(() => pengawasan.id),
  data: json('data').notNull(), // bentuk bebas, ditentukan frontend per jenis pengujian
  createdAt: timestamp('created_at').defaultNow(),
});

export const statusPermohonan = [
  'MENUNGGU_VERIFIKASI',
  'DIJADWALKAN',
  'DIPROSES',
  'TIDAK_LULUS_UJI',
  'SELESAI',
  'DITOLAK',
] as const;

export const jenisLayananPeneraan = ['TERA', 'TERA_ULANG'] as const;
export const lokasiPeneraan = ['KANTOR', 'TEMPAT_PAKAI'] as const;

export const peneraanApplications = mysqlTable('peneraan_applications', {
  id: varchar('id', { length: 36 }).primaryKey(),
  applicationNumber: varchar('application_number', { length: 100 }).notNull().unique(),
  ownerId: varchar('owner_id', { length: 36 }).notNull().references(() => instrumentOwners.id),
  instrumentId: varchar('instrument_id', { length: 36 }).notNull().references(() => instruments.id),
  layanan: mysqlEnum('layanan', jenisLayananPeneraan).notNull(),
  lokasi: mysqlEnum('lokasi', lokasiPeneraan).notNull(),
  status: mysqlEnum('status', statusPermohonan).notNull().default('MENUNGGU_VERIFIKASI'),
  jadwalTanggal: timestamp('jadwal_tanggal'),
  petugasId: varchar('petugas_id', { length: 36 }).references(() => users.id),
  catatan: text('catatan'),
  testObservationId: varchar('test_observation_id', { length: 36 }),
  createdBy: varchar('created_by', { length: 36 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});