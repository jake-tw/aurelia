-- 建立 Telegram 訊息日誌表
CREATE TABLE IF NOT EXISTS `telegram_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `chatId` BIGINT NOT NULL COMMENT 'Telegram Chat ID',
  `messageId` BIGINT NULL COMMENT 'Telegram Message ID',
  `direction` ENUM('incoming', 'outgoing') NOT NULL COMMENT '訊息方向：incoming=收到, outgoing=發送',
  `content` TEXT NOT NULL COMMENT '訊息內容',
  `username` VARCHAR(255) NULL COMMENT '用戶名稱',
  `chatType` ENUM('private', 'group', 'supergroup', 'channel') NULL COMMENT '聊天類型',
  `metadata` JSON NULL COMMENT '額外元數據（指令類型、錯誤訊息等）',
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '建立時間',
  PRIMARY KEY (`id`),
  INDEX `IDX_chatId_createdAt` (`chatId`, `createdAt`),
  INDEX `IDX_direction_createdAt` (`direction`, `createdAt`),
  INDEX `IDX_chatId` (`chatId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Telegram 訊息日誌表';
