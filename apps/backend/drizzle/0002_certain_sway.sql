CREATE TABLE `instruments_massa` (
	`id` varchar(36) NOT NULL,
	`instrument_id` varchar(36) NOT NULL,
	`capacity_value` decimal(10,2) NOT NULL,
	`capacity_unit` enum('kg','L','g','mL') NOT NULL,
	`dayabaca` decimal(10,5) NOT NULL,
	`dayabaca_unit` enum('kg','L','g','mL') NOT NULL,
	`class` enum('I','II','III','IIII') NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `instruments_massa_id` PRIMARY KEY(`id`),
	CONSTRAINT `instruments_massa_instrument_id_unique` UNIQUE(`instrument_id`)
);
--> statement-breakpoint
CREATE TABLE `instruments_pubbm` (
	`id` varchar(36) NOT NULL,
	`instrument_id` varchar(36) NOT NULL,
	`station_id` varchar(36) NOT NULL,
	`laju_alir_maksimum` decimal(10,3),
	`laju_alir_minimum` decimal(10,3),
	`jenis_cairan` varchar(100),
	`identifikasi_nozzle` varchar(100),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `instruments_pubbm_id` PRIMARY KEY(`id`),
	CONSTRAINT `instruments_pubbm_instrument_id_unique` UNIQUE(`instrument_id`)
);
--> statement-breakpoint
CREATE TABLE `pubbm_stations` (
	`id` varchar(36) NOT NULL,
	`owner_id` varchar(36) NOT NULL,
	`nomor_spbu` varchar(30) NOT NULL,
	`address` text NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pubbm_stations_id` PRIMARY KEY(`id`),
	CONSTRAINT `pubbm_stations_owner_id_unique` UNIQUE(`owner_id`),
	CONSTRAINT `pubbm_stations_nomor_spbu_unique` UNIQUE(`nomor_spbu`)
);
--> statement-breakpoint
ALTER TABLE `instruments_massa` ADD CONSTRAINT `instruments_massa_instrument_id_instruments_id_fk` FOREIGN KEY (`instrument_id`) REFERENCES `instruments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `instruments_pubbm` ADD CONSTRAINT `instruments_pubbm_instrument_id_instruments_id_fk` FOREIGN KEY (`instrument_id`) REFERENCES `instruments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `instruments_pubbm` ADD CONSTRAINT `instruments_pubbm_station_id_pubbm_stations_id_fk` FOREIGN KEY (`station_id`) REFERENCES `pubbm_stations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pubbm_stations` ADD CONSTRAINT `pubbm_stations_owner_id_instrument_owners_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `instrument_owners`(`id`) ON DELETE no action ON UPDATE no action;