-- ======================================================
-- IMRP Opium Nights Hotel - Database Schema
-- Author: Ragna | IMMORTAL ROLEPLAY
-- ======================================================

CREATE TABLE IF NOT EXISTS `imrp_hotel_rooms` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `room_number` VARCHAR(10) NOT NULL UNIQUE,
    `room_type` VARCHAR(20) NOT NULL DEFAULT 'standard',
    `floor` INT NOT NULL DEFAULT 1,
    `owner_citizenid` VARCHAR(50) DEFAULT NULL,
    `owner_name` VARCHAR(100) DEFAULT NULL,
    `purchase_date` DATETIME DEFAULT NULL,
    `expire_date` DATETIME DEFAULT NULL,
    `is_locked` TINYINT(1) NOT NULL DEFAULT 1,
    `alarm_enabled` TINYINT(1) NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_owner` (`owner_citizenid`),
    INDEX `idx_room_type` (`room_type`),
    INDEX `idx_floor` (`floor`),
    INDEX `idx_expire` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `imrp_hotel_access` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `room_number` VARCHAR(10) NOT NULL,
    `citizenid` VARCHAR(50) NOT NULL,
    `player_name` VARCHAR(100) NOT NULL,
    `access_type` ENUM('permanent', 'temporary') NOT NULL DEFAULT 'permanent',
    `granted_by` VARCHAR(50) NOT NULL,
    `granted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `expires_at` DATETIME DEFAULT NULL,
    UNIQUE KEY `uk_room_citizen` (`room_number`, `citizenid`),
    INDEX `idx_citizenid` (`citizenid`),
    INDEX `idx_room` (`room_number`),
    FOREIGN KEY (`room_number`) REFERENCES `imrp_hotel_rooms`(`room_number`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `imrp_hotel_mailbox` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `room_number` VARCHAR(10) NOT NULL,
    `sender_name` VARCHAR(100) NOT NULL DEFAULT 'Hotel Management',
    `mail_type` ENUM('letter', 'package', 'notification') NOT NULL DEFAULT 'notification',
    `subject` VARCHAR(255) NOT NULL,
    `body` TEXT NOT NULL,
    `is_read` TINYINT(1) NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_room` (`room_number`),
    INDEX `idx_read` (`is_read`),
    FOREIGN KEY (`room_number`) REFERENCES `imrp_hotel_rooms`(`room_number`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `imrp_hotel_utilities` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `room_number` VARCHAR(10) NOT NULL,
    `utility_type` ENUM('electricity', 'water', 'internet') NOT NULL,
    `amount` INT NOT NULL DEFAULT 0,
    `is_paid` TINYINT(1) NOT NULL DEFAULT 0,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `due_date` DATETIME NOT NULL,
    `paid_date` DATETIME DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_room` (`room_number`),
    INDEX `idx_paid` (`is_paid`),
    INDEX `idx_due` (`due_date`),
    FOREIGN KEY (`room_number`) REFERENCES `imrp_hotel_rooms`(`room_number`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `imrp_hotel_visitors` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `room_number` VARCHAR(10) NOT NULL,
    `visitor_citizenid` VARCHAR(50) NOT NULL,
    `visitor_name` VARCHAR(100) NOT NULL,
    `status` ENUM('pending', 'accepted', 'rejected', 'blocked') NOT NULL DEFAULT 'pending',
    `visited_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_room` (`room_number`),
    INDEX `idx_visitor` (`visitor_citizenid`),
    INDEX `idx_status` (`status`),
    FOREIGN KEY (`room_number`) REFERENCES `imrp_hotel_rooms`(`room_number`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `imrp_hotel_cctv` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `camera_label` VARCHAR(50) NOT NULL,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `last_accessed_by` VARCHAR(50) DEFAULT NULL,
    `last_accessed_at` DATETIME DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `imrp_hotel_garage` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `room_number` VARCHAR(10) NOT NULL,
    `citizenid` VARCHAR(50) NOT NULL,
    `plate` VARCHAR(20) NOT NULL,
    `vehicle` VARCHAR(50) NOT NULL,
    `fuel` FLOAT NOT NULL DEFAULT 100.0,
    `engine` FLOAT NOT NULL DEFAULT 1000.0,
    `body` FLOAT NOT NULL DEFAULT 1000.0,
    `props` TEXT DEFAULT NULL,
    `stored_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_plate` (`plate`),
    INDEX `idx_room` (`room_number`),
    INDEX `idx_citizen` (`citizenid`),
    FOREIGN KEY (`room_number`) REFERENCES `imrp_hotel_rooms`(`room_number`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default room records
-- Floor 1-6, 12 rooms each
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS `imrp_populate_rooms`()
BEGIN
    DECLARE f INT DEFAULT 1;
    DECLARE r INT DEFAULT 1;
    DECLARE room_num VARCHAR(10);
    DECLARE room_tp VARCHAR(20);

    WHILE f <= 6 DO
        SET r = 1;
        WHILE r <= 12 DO
            SET room_num = CONCAT(f, LPAD(r, 2, '0'));

            IF f <= 2 THEN SET room_tp = 'standard';
            ELSEIF f <= 4 THEN SET room_tp = 'deluxe';
            ELSEIF f = 5 THEN SET room_tp = 'executive';
            ELSE SET room_tp = 'luxury';
            END IF;

            INSERT IGNORE INTO `imrp_hotel_rooms` (`room_number`, `room_type`, `floor`)
            VALUES (room_num, room_tp, f);

            SET r = r + 1;
        END WHILE;
        SET f = f + 1;
    END WHILE;

    -- Penthouses
    INSERT IGNORE INTO `imrp_hotel_rooms` (`room_number`, `room_type`, `floor`) VALUES ('PH-01', 'penthouse', 7);
    INSERT IGNORE INTO `imrp_hotel_rooms` (`room_number`, `room_type`, `floor`) VALUES ('PH-02', 'penthouse', 7);
    INSERT IGNORE INTO `imrp_hotel_rooms` (`room_number`, `room_type`, `floor`) VALUES ('PH-03', 'penthouse', 7);

    -- Default CCTV cameras
    INSERT IGNORE INTO `imrp_hotel_cctv` (`camera_label`) VALUES ('Lobby');
    INSERT IGNORE INTO `imrp_hotel_cctv` (`camera_label`) VALUES ('Reception');
    INSERT IGNORE INTO `imrp_hotel_cctv` (`camera_label`) VALUES ('Elevator');
    INSERT IGNORE INTO `imrp_hotel_cctv` (`camera_label`) VALUES ('Garage');
    INSERT IGNORE INTO `imrp_hotel_cctv` (`camera_label`) VALUES ('Entrance');
    INSERT IGNORE INTO `imrp_hotel_cctv` (`camera_label`) VALUES ('Hallway 1');
    INSERT IGNORE INTO `imrp_hotel_cctv` (`camera_label`) VALUES ('Penthouse Entrance');
END //
DELIMITER ;

CALL `imrp_populate_rooms`();
DROP PROCEDURE IF EXISTS `imrp_populate_rooms`;
