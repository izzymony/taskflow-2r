CREATE TABLE `schedules` (
	`id` varchar(255) PRIMARY KEY,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`user_id` int NOT NULL,
	`startTime` timestamp NOT NULL,
	`endTime` timestamp NOT NULL,
	`type` enum('Meeting','Deadline','Focus') NOT NULL,
	`attendees` json DEFAULT ('"[]"'),
	`date` date NOT NULL,
	`location` varchar(78),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `schedules_user_id_users_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);
