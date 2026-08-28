CREATE TABLE `olist_connections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`accountKey` varchar(64) NOT NULL,
	`olistAccountId` varchar(128),
	`accessTokenCiphertext` text NOT NULL,
	`refreshTokenCiphertext` text NOT NULL,
	`accessTokenExpiresAt` timestamp NOT NULL,
	`scope` text,
	`status` varchar(32) NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `olist_connections_id` PRIMARY KEY(`id`),
	CONSTRAINT `olist_connections_accountKey_unique` UNIQUE(`accountKey`)
);
--> statement-breakpoint
CREATE TABLE `olist_orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientReference` varchar(128) NOT NULL,
	`olistOrderId` varchar(64),
	`userId` int,
	`customerPayload` text NOT NULL,
	`itemsPayload` text NOT NULL,
	`shippingPayload` text,
	`totalCents` int NOT NULL DEFAULT 0,
	`paymentStatus` varchar(32) NOT NULL DEFAULT 'pending',
	`fulfillmentStatus` varchar(32) NOT NULL DEFAULT 'pending',
	`trackingCode` varchar(128),
	`trackingUrl` varchar(1024),
	`rawPayload` text,
	`syncedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `olist_orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `olist_orders_clientReference_unique` UNIQUE(`clientReference`),
	CONSTRAINT `olist_orders_olistOrderId_unique` UNIQUE(`olistOrderId`)
);
--> statement-breakpoint
CREATE TABLE `olist_product_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`olistProductId` varchar(64) NOT NULL,
	`storageKey` varchar(512) NOT NULL,
	`url` varchar(1024) NOT NULL,
	`altText` varchar(255),
	`position` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `olist_product_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `olist_products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`olistProductId` varchar(64) NOT NULL,
	`sku` varchar(128) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`shortDescription` text,
	`description` text,
	`productType` varchar(32),
	`categoryId` varchar(64),
	`categoryName` varchar(255),
	`priceCents` int NOT NULL DEFAULT 0,
	`compareAtPriceCents` int,
	`stockQuantity` int NOT NULL DEFAULT 0,
	`active` int NOT NULL DEFAULT 1,
	`rawPayload` text,
	`syncedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `olist_products_id` PRIMARY KEY(`id`),
	CONSTRAINT `olist_products_olistProductId_unique` UNIQUE(`olistProductId`),
	CONSTRAINT `olist_products_sku_unique` UNIQUE(`sku`),
	CONSTRAINT `olist_products_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `olist_sync_operations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`operationType` varchar(64) NOT NULL,
	`idempotencyKey` varchar(128) NOT NULL,
	`targetId` varchar(128),
	`status` varchar(32) NOT NULL DEFAULT 'queued',
	`attempts` int NOT NULL DEFAULT 0,
	`requestPayload` text,
	`responsePayload` text,
	`lastError` text,
	`availableAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `olist_sync_operations_id` PRIMARY KEY(`id`),
	CONSTRAINT `olist_sync_operations_idempotencyKey_unique` UNIQUE(`idempotencyKey`)
);
--> statement-breakpoint
CREATE TABLE `olist_webhook_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`payloadHash` varchar(128) NOT NULL,
	`eventType` varchar(64) NOT NULL,
	`payload` text NOT NULL,
	`status` varchar(32) NOT NULL DEFAULT 'received',
	`processedAt` timestamp,
	`receivedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `olist_webhook_events_id` PRIMARY KEY(`id`),
	CONSTRAINT `olist_webhook_events_payloadHash_unique` UNIQUE(`payloadHash`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
