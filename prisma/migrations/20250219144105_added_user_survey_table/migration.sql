-- AlterTable
ALTER TABLE `activities` ADD COLUMN `voting_cycle_count` INTEGER NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `activity_join_requests` ADD COLUMN `vote_cycle_count` INTEGER NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `user_survey` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `survey_type` ENUM('account_deletion') NOT NULL DEFAULT 'account_deletion',
    `user_id` BIGINT UNSIGNED NOT NULL,
    `reason` JSON NULL,
    `comments` TEXT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL,
    `deleted_at` TIMESTAMP(0) NULL,

    INDEX `user_survey_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_survey` ADD CONSTRAINT `user_survey_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
