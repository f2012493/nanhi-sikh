CREATE TABLE `character_uploads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storyOrderId` int NOT NULL,
	`characterName` varchar(255) NOT NULL,
	`characterRole` varchar(255) NOT NULL,
	`photoUrl` text NOT NULL,
	`photoKey` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `character_uploads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `photo_delete_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`photoKey` varchar(255) NOT NULL,
	`photoType` enum('child','character') NOT NULL,
	`storyOrderId` int,
	`deletedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `photo_delete_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `render_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storyOrderId` int NOT NULL,
	`jobId` varchar(255) NOT NULL,
	`status` enum('queued','processing','completed','failed') NOT NULL DEFAULT 'queued',
	`progress` int NOT NULL DEFAULT 0,
	`currentStep` varchar(255),
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`completedAt` timestamp,
	CONSTRAINT `render_jobs_id` PRIMARY KEY(`id`),
	CONSTRAINT `render_jobs_jobId_unique` UNIQUE(`jobId`)
);
--> statement-breakpoint
CREATE TABLE `story_feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storyOrderId` int NOT NULL,
	`feedbackType` enum('worked','partial','not_worked') NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `story_feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `story_orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`childName` varchar(255) NOT NULL,
	`childAge` int NOT NULL,
	`childGender` enum('male','female','other') NOT NULL,
	`childPhotoUrl` text,
	`childPhotoKey` text,
	`language` enum('en','hi','hinglish') NOT NULL DEFAULT 'en',
	`parentingChallenge` text NOT NULL,
	`childPersonality` text,
	`animationStyle` enum('cartoon','storybook','magical') NOT NULL DEFAULT 'cartoon',
	`musicMood` enum('playful','calm','adventurous') NOT NULL DEFAULT 'playful',
	`videoLength` enum('short','full') NOT NULL DEFAULT 'full',
	`storyScript` text,
	`videoUrl` text,
	`videoKey` text,
	`renderJobId` varchar(255),
	`renderStatus` enum('pending','generating_script','generating_images','generating_voiceover','stitching','completed','failed') NOT NULL DEFAULT 'pending',
	`renderProgress` int NOT NULL DEFAULT 0,
	`paymentStatus` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
	`pricingTier` enum('preview','hd','hd_whatsapp') NOT NULL DEFAULT 'preview',
	`amountPaid` int NOT NULL DEFAULT 0,
	`razorpayOrderId` varchar(255),
	`razorpayPaymentId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `story_orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `character_uploads` ADD CONSTRAINT `character_uploads_storyOrderId_story_orders_id_fk` FOREIGN KEY (`storyOrderId`) REFERENCES `story_orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `render_jobs` ADD CONSTRAINT `render_jobs_storyOrderId_story_orders_id_fk` FOREIGN KEY (`storyOrderId`) REFERENCES `story_orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `story_feedback` ADD CONSTRAINT `story_feedback_storyOrderId_story_orders_id_fk` FOREIGN KEY (`storyOrderId`) REFERENCES `story_orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `story_orders` ADD CONSTRAINT `story_orders_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;