ALTER TABLE `olist_connections` ADD `reconciliationTaskUid` varchar(65);--> statement-breakpoint
ALTER TABLE `olist_connections` ADD `reconciliationCron` varchar(64);--> statement-breakpoint
ALTER TABLE `olist_connections` ADD CONSTRAINT `olist_connections_reconciliationTaskUid_unique` UNIQUE(`reconciliationTaskUid`);