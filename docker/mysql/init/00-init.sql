-- 初始化腳本
-- 此檔案會在 MySQL 容器首次啟動時自動執行

-- 確保資料庫使用 UTF-8
ALTER DATABASE aurelia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 設定時區
SET GLOBAL time_zone = '+8:00';
