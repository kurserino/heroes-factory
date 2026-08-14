-- CreateTable
CREATE TABLE `heroes` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `nickname` VARCHAR(120) NOT NULL,
    `date_of_birth` DATE NOT NULL,
    `universe` VARCHAR(120) NOT NULL,
    `main_power` VARCHAR(200) NOT NULL,
    `avatar_url` VARCHAR(2048) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `heroes_created_at_idx`(`created_at`),
    INDEX `heroes_name_nickname_idx`(`name`, `nickname`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
