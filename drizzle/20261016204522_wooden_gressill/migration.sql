CREATE TABLE `users` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`fullname` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`role` varchar(50) NOT NULL DEFAULT 'client',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_unique` UNIQUE INDEX(`email`)
);
