CREATE TABLE `client_tasks` (
	`id` varchar(255) PRIMARY KEY,
	`title` varchar(255) NOT NULL,
	`description` text,
	`project_id` varchar(255) NOT NULL,
	`client_id` varchar(255) NOT NULL,
	`user_id` int NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'Backlog',
	`billable` int NOT NULL DEFAULT 1,
	`estimated_hours` varchar(50),
	`assigned_to` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now())
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` varchar(255) PRIMARY KEY,
	`name` varchar(255) NOT NULL,
	`description` text,
	`client_id` varchar(255) NOT NULL,
	`user_id` int NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'Active',
	`due_date` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now())
);
--> statement-breakpoint
ALTER TABLE `clients` DROP CONSTRAINT `clients_userId_users_id_fkey`;--> statement-breakpoint
DROP INDEX `clients_userId_users_id_fkey` ON `clients`--> statement-breakpoint
ALTER TABLE `clients` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `clients` MODIFY COLUMN `company` varchar(350) NOT NULL;--> statement-breakpoint
ALTER TABLE `clients` MODIFY COLUMN `email` varchar(255);--> statement-breakpoint
ALTER TABLE `clients` MODIFY COLUMN `plan` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `clients` MODIFY COLUMN `phone` varchar(11) NOT NULL;--> statement-breakpoint
ALTER TABLE `clients` MODIFY COLUMN `title` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `clients` MODIFY COLUMN `status` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `clients` ADD `user_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `clients` ADD `billing_type` varchar(50) DEFAULT 'Hourly' NOT NULL;--> statement-breakpoint
ALTER TABLE `clients` ADD `rate` decimal(10,2) DEFAULT (0.00) NOT NULL;--> statement-breakpoint
ALTER TABLE `clients` ADD `currency` varchar(10) DEFAULT 'NGN' NOT NULL;--> statement-breakpoint
ALTER TABLE `clients` ADD `monthly_budget_cap` int;--> statement-breakpoint
ALTER TABLE `clients` ADD `contact_name` varchar(255);--> statement-breakpoint
ALTER TABLE `clients` ADD `created_at` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `tasks` ADD `client_id` varchar(255);--> statement-breakpoint
ALTER TABLE `tasks` ADD `project_id` varchar(255);--> statement-breakpoint
ALTER TABLE `client_tasks` ADD CONSTRAINT `client_tasks_project_id_projects_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `client_tasks` ADD CONSTRAINT `client_tasks_client_id_clients_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `client_tasks` ADD CONSTRAINT `client_tasks_user_id_users_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `clients` ADD CONSTRAINT `clients_user_id_users_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `projects` ADD CONSTRAINT `projects_client_id_clients_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `projects` ADD CONSTRAINT `projects_user_id_users_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_client_id_clients_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_project_id_projects_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE `clients` DROP COLUMN `userId`;--> statement-breakpoint
ALTER TABLE `clients` DROP COLUMN `contactName`;--> statement-breakpoint
ALTER TABLE `clients` DROP COLUMN `projects`;--> statement-breakpoint
ALTER TABLE `clients` DROP COLUMN `value`;--> statement-breakpoint
ALTER TABLE `clients` DROP COLUMN `location`;--> statement-breakpoint
ALTER TABLE `clients` DROP COLUMN `avatar`;--> statement-breakpoint
ALTER TABLE `clients` DROP COLUMN `lastActivity`;--> statement-breakpoint
ALTER TABLE `clients` DROP COLUMN `createdAt`;