ALTER TABLE `instruments` MODIFY COLUMN `dayabaca` decimal(10,5) NOT NULL;--> statement-breakpoint
ALTER TABLE `quality_documents` MODIFY COLUMN `is_active` boolean NOT NULL DEFAULT true;