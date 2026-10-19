CREATE TABLE `refresh_tokens` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`user_id` int NOT NULL,
	`token` varchar(500) NOT NULL,
	`is_revoked` boolean NOT NULL DEFAULT false,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `token_unique` UNIQUE INDEX(`token`),
	CONSTRAINT `refresh_tokens_user_id_users_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);
