CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`createdBy` int NOT NULL,
	`title` varchar(150) NOT NULL,
	`status` enum('Todo','In PProgress','completed') NOT NULL DEFAULT 'Todo',
	`proprity` enum('Low','Medium','High','Critical') NOT NULL DEFAULT 'Low',
	`description` varchar(1500) NOT NULL,
	`due_date` timestamp,
	`specialties` json DEFAULT ('"[]"'),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tasks_createdBy_users_id_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `role` varchar(300);