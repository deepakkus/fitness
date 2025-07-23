/*
  Warnings:

  - You are about to drop the column `entity_id` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `is_read` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `related_entity_type` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the `contactsubmission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `contactsubmissionmedia` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `verificationtoken` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `notification_type` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipient_id` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipient_type` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `triggerer_id` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `triggerer_type` to the `notifications` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `contactsubmissionmedia` DROP FOREIGN KEY `ContactSubmissionMedia_contactSubmissionId_fkey`;

-- DropForeignKey
ALTER TABLE `notifications` DROP FOREIGN KEY `notifications_ibfk_1`;

-- DropForeignKey
ALTER TABLE `notifications` DROP FOREIGN KEY `notifications_ibfk_2`;

-- AlterTable
ALTER TABLE `activities` ADD COLUMN `is_sponsored` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `voting_cycle_duration` INTEGER NULL DEFAULT 1440,
    ALTER COLUMN `start_time` DROP DEFAULT;

-- AlterTable
ALTER TABLE `notifications` DROP COLUMN `entity_id`,
    DROP COLUMN `is_read`,
    DROP COLUMN `related_entity_type`,
    DROP COLUMN `user_id`,
    ADD COLUMN `action_url` VARCHAR(2048) NULL,
    ADD COLUMN `aggregation_key` VARCHAR(255) NULL,
    ADD COLUMN `is_summary` TINYINT NULL,
    ADD COLUMN `media_thumbnail` VARCHAR(255) NULL,
    ADD COLUMN `metadata` JSON NULL,
    ADD COLUMN `notification_key` VARCHAR(255) NULL,
    ADD COLUMN `notification_type` VARCHAR(50) NOT NULL,
    ADD COLUMN `priority` TINYINT NULL,
    ADD COLUMN `read_at` TIMESTAMP(0) NULL,
    ADD COLUMN `recipient_id` BIGINT UNSIGNED NOT NULL,
    ADD COLUMN `recipient_type` VARCHAR(32) NOT NULL,
    ADD COLUMN `superseded_by_id` BIGINT UNSIGNED NULL,
    ADD COLUMN `triggerer_id` BIGINT UNSIGNED NOT NULL,
    ADD COLUMN `triggerer_type` VARCHAR(32) NOT NULL,
    MODIFY `notification_type_id` BIGINT UNSIGNED NULL;

-- AlterTable
ALTER TABLE `password_reset_tokens` ALTER COLUMN `expires_at` DROP DEFAULT;

-- DropTable
DROP TABLE `contactsubmission`;

-- DropTable
DROP TABLE `contactsubmissionmedia`;

-- DropTable
DROP TABLE `verificationtoken`;

-- CreateTable
CREATE TABLE `contact_submission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fullName` VARCHAR(191) NOT NULL,
    `relatedHelp` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contact_submission_media` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `image_blob` LONGBLOB NOT NULL,
    `contactSubmissionId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ContactSubmissionMedia_contactSubmissionId_fkey`(`contactSubmissionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `verification_token` (
    `identifier` VARCHAR(255) NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `expires` DATETIME(0) NOT NULL,

    UNIQUE INDEX `identifier_token_unique`(`identifier`, `token`),
    PRIMARY KEY (`identifier`, `token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `slider` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `category` VARCHAR(255) NULL,
    `subcategory` VARCHAR(255) NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `image` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL,
    `deleted_at` TIMESTAMP(0) NULL,

    INDEX `slider_category_idx`(`category`),
    INDEX `slider_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `userId` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(255) NULL,
    `description` TEXT NULL,
    `is_active` TINYINT NULL,
    `is_home` TINYINT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL,
    `deleted_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_media` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `product_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL,
    `deleted_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `idx_activity_media_name_unique`(`name`),
    INDEX `product_id`(`product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_media_blobs` (
    `product_media_id` BIGINT UNSIGNED NOT NULL,
    `image_blob` BLOB NULL,
    `video_blob` LONGBLOB NULL,
    `pdf_blob` BLOB NULL,

    PRIMARY KEY (`product_media_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `slider_blobs` (
    `slider_id` BIGINT UNSIGNED NOT NULL,
    `image_blob` MEDIUMBLOB NULL,

    PRIMARY KEY (`slider_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `billing_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `first_name` VARCHAR(191) NOT NULL,
    `last_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `zip` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `idx_triggerer_active` ON `notifications`(`triggerer_id`, `triggerer_type`, `deleted_at`);

-- CreateIndex
CREATE INDEX `idx_type_key_active` ON `notifications`(`notification_type`, `notification_key`, `deleted_at`);

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`notification_type_id`) REFERENCES `ref_notification_types`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `contact_submission_media` ADD CONSTRAINT `ContactSubmissionMedia_contactSubmissionId_fkey` FOREIGN KEY (`contactSubmissionId`) REFERENCES `contact_submission`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_media` ADD CONSTRAINT `product_media_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `product_media_blobs` ADD CONSTRAINT `product_media_blobs_ibfk_1` FOREIGN KEY (`product_media_id`) REFERENCES `product_media`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `slider_blobs` ADD CONSTRAINT `slider_blobs_ibfk_1` FOREIGN KEY (`slider_id`) REFERENCES `slider`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
