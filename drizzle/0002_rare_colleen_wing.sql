CREATE TABLE `final_video_render_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storyOrderId` int NOT NULL,
	`jobId` varchar(255) NOT NULL,
	`status` enum('queued','processing','completed','failed') NOT NULL DEFAULT 'queued',
	`stage` varchar(255),
	`progress` int NOT NULL DEFAULT 0,
	`errorMessage` text,
	`retryCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`completedAt` timestamp,
	CONSTRAINT `final_video_render_jobs_id` PRIMARY KEY(`id`),
	CONSTRAINT `final_video_render_jobs_jobId_unique` UNIQUE(`jobId`)
);
--> statement-breakpoint
ALTER TABLE `story_orders` ADD `finalVideoUrl` text;--> statement-breakpoint
ALTER TABLE `story_orders` ADD `finalVideoKey` text;--> statement-breakpoint
ALTER TABLE `story_orders` ADD `finalVideoJobId` varchar(255);--> statement-breakpoint
ALTER TABLE `story_orders` ADD `finalVideoStatus` enum('pending','reading_story','generating_scenes','creating_narration','rendering_video','finalizing_export','completed','failed') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `story_orders` ADD `finalVideoProgress` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `story_orders` ADD `finalVideoStage` varchar(255);--> statement-breakpoint
ALTER TABLE `final_video_render_jobs` ADD CONSTRAINT `final_video_render_jobs_storyOrderId_story_orders_id_fk` FOREIGN KEY (`storyOrderId`) REFERENCES `story_orders`(`id`) ON DELETE no action ON UPDATE no action;