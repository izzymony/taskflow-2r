CREATE TABLE `clients` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`userId` int,
	`company` varchar(450) NOT NULL,
	`email` varchar(400) NOT NULL,
	`plan` varchar(450) NOT NULL,
	`contactName` varchar(450) NOT NULL,
	`phone` varchar(450) NOT NULL,
	`projects` varchar(379),
	`title` varchar(540),
	`value` int,
	`location` varchar(400),
	`status` varchar(500) NOT NULL,
	`avatar` varchar(250),
	`lastActivity` varchar(250),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `clients_userId_users_id_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`)
);
--> statement-breakpoint
ALTER TABLE `tasks` MODIFY COLUMN `status` enum('Todo','In Progress','Under Review','Completed') DEFAULT 'Todo' NOT NULL;--> statement-breakpoint
ALTER TABLE `tasks` ADD `assignedTo` int;--> statement-breakpoint
ALTER TABLE `tasks` ADD `priority` enum('Low','Medium','High','Critical') DEFAULT 'Medium' NOT NULL;--> statement-breakpoint
ALTER TABLE `tasks` ADD `tags` json DEFAULT ('"[]"');--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_assignedTo_users_id_fkey` FOREIGN KEY (`assignedTo`) REFERENCES `users`(`id`) ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE `tasks` DROP COLUMN `proprity`;--> statement-breakpoint
ALTER TABLE `tasks` DROP COLUMN `specialties`;