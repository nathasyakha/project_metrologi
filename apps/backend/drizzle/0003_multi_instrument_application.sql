CREATE TABLE `peneraan_application_instruments` (
  `id` varchar(36) NOT NULL,
  `application_id` varchar(36) NOT NULL,
  `instrument_id` varchar(36) NOT NULL,
  `status` enum(
    'MENUNGGU_VERIFIKASI',
    'DIJADWALKAN',
    'DIPROSES',
    'TIDAK_LULUS_UJI',
    'SELESAI',
    'DITOLAK'
  ) NOT NULL DEFAULT 'DIJADWALKAN',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `peneraan_application_instruments_id`
    PRIMARY KEY (`id`),
  CONSTRAINT `application_instrument_unique`
    UNIQUE (`application_id`, `instrument_id`),
  KEY `application_instruments_application_idx` (`application_id`),
  KEY `application_instruments_instrument_idx` (`instrument_id`),
  CONSTRAINT `peneraan_application_instruments_application_id_fk`
    FOREIGN KEY (`application_id`)
    REFERENCES `peneraan_applications` (`id`),
  CONSTRAINT `peneraan_application_instruments_instrument_id_fk`
    FOREIGN KEY (`instrument_id`)
    REFERENCES `instruments` (`id`)
);

ALTER TABLE `test_observations`
  ADD COLUMN `application_instrument_id` varchar(36) NULL;

ALTER TABLE `test_observations`
  ADD CONSTRAINT `test_observations_application_instrument_id_fk`
  FOREIGN KEY (`application_instrument_id`)
  REFERENCES `peneraan_application_instruments` (`id`);

-- Migrasikan permohonan lama: satu detail alat per permohonan.
INSERT INTO `peneraan_application_instruments`
  (`id`, `application_id`, `instrument_id`, `status`)
SELECT
  UUID(),
  a.`id`,
  a.`instrument_id`,
  a.`status`
FROM `peneraan_applications` a
WHERE NOT EXISTS (
  SELECT 1
  FROM `peneraan_application_instruments` d
  WHERE d.`application_id` = a.`id`
    AND d.`instrument_id` = a.`instrument_id`
);

-- Hubungkan hasil pengujian lama yang sudah memiliki referensi permohonan.
UPDATE `test_observations` o
JOIN `peneraan_applications` a
  ON a.`test_observation_id` = o.`id`
JOIN `peneraan_application_instruments` d
  ON d.`application_id` = a.`id`
 AND d.`instrument_id` = a.`instrument_id`
SET o.`application_instrument_id` = d.`id`
WHERE o.`application_instrument_id` IS NULL;
