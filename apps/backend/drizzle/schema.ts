import { mysqlTable, mysqlSchema, AnyMySqlColumn, foreignKey, primaryKey, varchar, text, timestamp, unique, mysqlEnum, decimal, json, int, longtext } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const auditLogs = mysqlTable("audit_logs", {
	id: varchar({ length: 36 }).notNull(),
	userId: varchar("user_id", { length: 36 }).references(() => users.id),
	action: varchar({ length: 50 }),
	tableName: varchar("table_name", { length: 100 }),
	recordId: varchar("record_id", { length: 36 }),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`),
},
(table) => [
	primaryKey({ columns: [table.id], name: "audit_logs_id"}),
]);

export const certificates = mysqlTable("certificates", {
	id: varchar({ length: 36 }).notNull(),
	observationId: varchar("observation_id", { length: 36 }).references(() => testObservations.id),
	certificateNumber: varchar("certificate_number", { length: 100 }).notNull(),
	issuedBy: varchar("issued_by", { length: 36 }).references(() => users.id),
	issueDate: timestamp("issue_date", { mode: 'string' }).default(sql`(now())`),
	certificateStatus: mysqlEnum("certificate_status", ['active','expired','revoked']).default('active').notNull(),
	expiryDate: timestamp("expiry_date", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`),
},
(table) => [
	primaryKey({ columns: [table.id], name: "certificates_id"}),
	unique("certificates_certificate_number_unique").on(table.certificateNumber),
]);

export const instrumentOwners = mysqlTable("instrument_owners", {
	id: varchar({ length: 36 }).notNull(),
	userId: varchar("user_id", { length: 36 }).references(() => users.id),
	companyName: varchar("company_name", { length: 255 }).notNull(),
	address: text().notNull(),
	phone: varchar({ length: 50 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).onUpdateNow(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "instrument_owners_id"}),
]);

export const instruments = mysqlTable("instruments", {
	id: varchar({ length: 36 }).notNull(),
	ownerId: varchar("owner_id", { length: 36 }).references(() => instrumentOwners.id),
	brand: varchar({ length: 100 }).notNull(),
	type: varchar({ length: 100 }),
	serialNumber: varchar("serial_number", { length: 100 }),
	capacityValue: decimal("capacity_value", { precision: 10, scale: 2 }).notNull(),
	capacityUnit: mysqlEnum("capacity_unit", ['kg','L','g','mL']).notNull(),
	dayabaca: decimal({ precision: 10, scale: 5 }),
	dayabacaUnit: mysqlEnum("dayabaca_unit", ['kg','L','g','mL']).notNull(),
	class: mysqlEnum(['I','II','III','IIII']).notNull(),
	registeredBy: varchar("registered_by", { length: 36 }).references(() => users.id),
	registeredAt: timestamp("registered_at", { mode: 'string' }).default(sql`(now())`),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).onUpdateNow(),
	jenisAlat: mysqlEnum("jenis_alat", ['TIMBANGAN_ELEKTRONIK','TIMBANGAN_MEJA','TIMBANGAN_JEMBATAN','DACIN','TIMBANGAN_PEGAS','TIMBANGAN_SENTISIMAL','TIMBANGAN_BOBOT_INGSUT','NERACA_EMAS','NERACA_OBAT','POMPA_UKUR_BBM','METER_AIR','METER_KWH','ANAK_TIMBANGAN']).default('TIMBANGAN_ELEKTRONIK').notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "instruments_id"}),
]);

export const peneraanApplications = mysqlTable("peneraan_applications", {
	id: varchar({ length: 36 }).notNull(),
	applicationNumber: varchar("application_number", { length: 100 }).notNull(),
	ownerId: varchar("owner_id", { length: 36 }).notNull().references(() => instrumentOwners.id),
	instrumentId: varchar("instrument_id", { length: 36 }).notNull().references(() => instruments.id),
	layanan: mysqlEnum(['TERA','TERA_ULANG']).notNull(),
	lokasi: mysqlEnum(['KANTOR','TEMPAT_PAKAI']).notNull(),
	status: mysqlEnum(['MENUNGGU_VERIFIKASI','DIJADWALKAN','DIPROSES','TIDAK_LULUS_UJI','SELESAI','DITOLAK']).default('MENUNGGU_VERIFIKASI').notNull(),
	jadwalTanggal: timestamp("jadwal_tanggal", { mode: 'string' }),
	petugasId: varchar("petugas_id", { length: 36 }).references(() => users.id),
	catatan: text(),
	testObservationId: varchar("test_observation_id", { length: 36 }),
	createdBy: varchar("created_by", { length: 36 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).onUpdateNow(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "peneraan_applications_id"}),
	unique("peneraan_applications_application_number_unique").on(table.applicationNumber),
]);

export const pengawasan = mysqlTable("pengawasan", {
	id: varchar({ length: 36 }).notNull(),
	jenisPengujian: mysqlEnum("jenis_pengujian", ['KUANTITAS_BDKT','SATUAN_UKURAN','PELABELAN_BDKT','PENGAMATAN_UTTP']).notNull(),
	tanggalPengawasan: timestamp("tanggal_pengawasan", { mode: 'string' }).notNull(),
	alamat: varchar({ length: 255 }).notNull(),
	petugasId: varchar("petugas_id", { length: 36 }).references(() => users.id),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).onUpdateNow(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "pengawasan_id"}),
]);

export const pengawasanCerapan = mysqlTable("pengawasan_cerapan", {
	id: varchar({ length: 36 }).notNull(),
	pengawasanId: varchar("pengawasan_id", { length: 36 }).notNull().references(() => pengawasan.id),
	data: json().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`),
},
(table) => [
	primaryKey({ columns: [table.id], name: "pengawasan_cerapan_id"}),
]);

export const qualityDocuments = mysqlTable("quality_documents", {
	id: varchar({ length: 36 }).notNull(),
	code: varchar({ length: 100 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	category: mysqlEnum(['SOP','IK','IK_ALAT','FORMULIR','CERAPAN']).notNull(),
	version: int().default(0).notNull(),
	effectiveDate: timestamp("effective_date", { mode: 'string' }).notNull(),
	fileName: varchar("file_name", { length: 255 }).notNull(),
	fileMimeType: varchar("file_mime_type", { length: 100 }).notNull(),
	fileSize: int("file_size").notNull(),
	fileData: longtext("file_data").notNull(),
	isActive: tinyint("is_active").default(1).notNull(),
	createdBy: varchar("created_by", { length: 36 }).references(() => users.id),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).onUpdateNow(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
},
(table) => [
	primaryKey({ columns: [table.id], name: "quality_documents_id"}),
]);

export const testObservations = mysqlTable("test_observations", {
	id: varchar({ length: 36 }).notNull(),
	instrumentId: varchar("instrument_id", { length: 36 }).notNull().references(() => instruments.id),
	inspectorId: varchar("inspector_id", { length: 36 }).references(() => users.id),
	observationData: json("observation_data").notNull(),
	status: mysqlEnum(['SAH','BATAL']).notNull(),
	testedAt: timestamp("tested_at", { mode: 'string' }).default(sql`(now())`),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`),
},
(table) => [
	primaryKey({ columns: [table.id], name: "test_observations_id"}),
]);

export const users = mysqlTable("users", {
	id: varchar({ length: 36 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	password: varchar({ length: 255 }).notNull(),
	role: mysqlEnum(['admin','petugas_penera','pemilik_alat','kepala','staf','pengamat_tera','pengawas']).notNull(),
	nip: varchar({ length: 30 }),
	isActive: int("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).onUpdateNow(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "users_id"}),
	unique("users_email_unique").on(table.email),
	unique("users_nip_unique").on(table.nip),
]);
