-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `audit_logs` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36),
	`action` varchar(50),
	`table_name` varchar(100),
	`record_id` varchar(36),
	`description` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `certificates` (
	`id` varchar(36) NOT NULL,
	`observation_id` varchar(36),
	`certificate_number` varchar(100) NOT NULL,
	`issued_by` varchar(36),
	`issue_date` timestamp DEFAULT (now()),
	`certificate_status` enum('active','expired','revoked') NOT NULL DEFAULT 'active',
	`expiry_date` timestamp NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `certificates_id` PRIMARY KEY(`id`),
	CONSTRAINT `certificates_certificate_number_unique` UNIQUE(`certificate_number`)
);
--> statement-breakpoint
CREATE TABLE `instrument_owners` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36),
	`company_name` varchar(255) NOT NULL,
	`address` text NOT NULL,
	`phone` varchar(50) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `instrument_owners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `instruments` (
	`id` varchar(36) NOT NULL,
	`owner_id` varchar(36),
	`brand` varchar(100) NOT NULL,
	`type` varchar(100),
	`serial_number` varchar(100),
	`capacity_value` decimal(10,2) NOT NULL,
	`capacity_unit` enum('kg','L','g','mL') NOT NULL,
	`dayabaca` decimal(10,5),
	`dayabaca_unit` enum('kg','L','g','mL') NOT NULL,
	`class` enum('I','II','III','IIII') NOT NULL,
	`registered_by` varchar(36),
	`registered_at` timestamp DEFAULT (now()),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`jenis_alat` enum('TIMBANGAN_ELEKTRONIK','TIMBANGAN_MEJA','TIMBANGAN_JEMBATAN','DACIN','TIMBANGAN_PEGAS','TIMBANGAN_SENTISIMAL','TIMBANGAN_BOBOT_INGSUT','NERACA_EMAS','NERACA_OBAT','POMPA_UKUR_BBM','METER_AIR','METER_KWH','ANAK_TIMBANGAN') NOT NULL DEFAULT 'TIMBANGAN_ELEKTRONIK',
	CONSTRAINT `instruments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `peneraan_applications` (
	`id` varchar(36) NOT NULL,
	`application_number` varchar(100) NOT NULL,
	`owner_id` varchar(36) NOT NULL,
	`instrument_id` varchar(36) NOT NULL,
	`layanan` enum('TERA','TERA_ULANG') NOT NULL,
	`lokasi` enum('KANTOR','TEMPAT_PAKAI') NOT NULL,
	`status` enum('MENUNGGU_VERIFIKASI','DIJADWALKAN','DIPROSES','TIDAK_LULUS_UJI','SELESAI','DITOLAK') NOT NULL DEFAULT 'MENUNGGU_VERIFIKASI',
	`jadwal_tanggal` timestamp,
	`petugas_id` varchar(36),
	`catatan` text,
	`test_observation_id` varchar(36),
	`created_by` varchar(36),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `peneraan_applications_id` PRIMARY KEY(`id`),
	CONSTRAINT `peneraan_applications_application_number_unique` UNIQUE(`application_number`)
);
--> statement-breakpoint
CREATE TABLE `pengawasan` (
	`id` varchar(36) NOT NULL,
	`jenis_pengujian` enum('KUANTITAS_BDKT','SATUAN_UKURAN','PELABELAN_BDKT','PENGAMATAN_UTTP') NOT NULL,
	`tanggal_pengawasan` timestamp NOT NULL,
	`alamat` varchar(255) NOT NULL,
	`petugas_id` varchar(36),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pengawasan_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pengawasan_cerapan` (
	`id` varchar(36) NOT NULL,
	`pengawasan_id` varchar(36) NOT NULL,
	`data` json NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `pengawasan_cerapan_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quality_documents` (
	`id` varchar(36) NOT NULL,
	`code` varchar(100) NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` enum('SOP','IK','IK_ALAT','FORMULIR','CERAPAN') NOT NULL,
	`version` int NOT NULL DEFAULT 0,
	`effective_date` timestamp NOT NULL,
	`file_name` varchar(255) NOT NULL,
	`file_mime_type` varchar(100) NOT NULL,
	`file_size` int NOT NULL,
	`file_data` longtext NOT NULL,
	`is_active` tinyint(1) NOT NULL DEFAULT 1,
	`created_by` varchar(36),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `quality_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `test_observations` (
	`id` varchar(36) NOT NULL,
	`instrument_id` varchar(36) NOT NULL,
	`inspector_id` varchar(36),
	`observation_data` json NOT NULL,
	`status` enum('SAH','BATAL') NOT NULL,
	`tested_at` timestamp DEFAULT (now()),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `test_observations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`role` enum('admin','petugas_penera','pemilik_alat','kepala','staf','pengamat_tera','pengawas') NOT NULL,
	`nip` varchar(30),
	`is_active` int DEFAULT 1,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`),
	CONSTRAINT `users_nip_unique` UNIQUE(`nip`)
);
--> statement-breakpoint
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `certificates` ADD CONSTRAINT `certificates_issued_by_users_id_fk` FOREIGN KEY (`issued_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `certificates` ADD CONSTRAINT `certificates_observation_id_test_observations_id_fk` FOREIGN KEY (`observation_id`) REFERENCES `test_observations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `instrument_owners` ADD CONSTRAINT `instrument_owners_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `instruments` ADD CONSTRAINT `instruments_owner_id_instrument_owners_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `instrument_owners`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `instruments` ADD CONSTRAINT `instruments_registered_by_users_id_fk` FOREIGN KEY (`registered_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `peneraan_applications` ADD CONSTRAINT `peneraan_applications_instrument_id_instruments_id_fk` FOREIGN KEY (`instrument_id`) REFERENCES `instruments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `peneraan_applications` ADD CONSTRAINT `peneraan_applications_owner_id_instrument_owners_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `instrument_owners`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `peneraan_applications` ADD CONSTRAINT `peneraan_applications_petugas_id_users_id_fk` FOREIGN KEY (`petugas_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pengawasan` ADD CONSTRAINT `pengawasan_petugas_id_users_id_fk` FOREIGN KEY (`petugas_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pengawasan_cerapan` ADD CONSTRAINT `pengawasan_cerapan_pengawasan_id_pengawasan_id_fk` FOREIGN KEY (`pengawasan_id`) REFERENCES `pengawasan`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quality_documents` ADD CONSTRAINT `quality_documents_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `test_observations` ADD CONSTRAINT `test_observations_inspector_id_users_id_fk` FOREIGN KEY (`inspector_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `test_observations` ADD CONSTRAINT `test_observations_instrument_id_instruments_id_fk` FOREIGN KEY (`instrument_id`) REFERENCES `instruments`(`id`) ON DELETE no action ON UPDATE no action;
*/