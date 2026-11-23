#!/bin/bash
# 初始化 Docker 掛載目錄
# 此腳本會在家目錄建立 Aurelia 專案所需的 Docker 資料目錄

set -e

# 顏色輸出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 基礎目錄
BASE_DIR="$HOME/.aurelia"
DOCKER_DIR="$BASE_DIR/docker"

echo -e "${YELLOW}正在初始化 Aurelia Docker 資料目錄...${NC}"
echo ""

# 檢查基礎目錄是否已存在
if [ -d "$BASE_DIR" ]; then
  echo -e "${BLUE}✓ 目錄 $BASE_DIR 已存在，跳過建立${NC}"
else
  echo "建立基礎目錄: $BASE_DIR"
  mkdir -p "$BASE_DIR"
fi

# 檢查並建立 MySQL 資料目錄
if [ -d "$DOCKER_DIR/mysql/data" ]; then
  echo -e "${BLUE}✓ MySQL 資料目錄已存在，跳過建立${NC}"
else
  echo "建立 MySQL 資料目錄: $DOCKER_DIR/mysql/data"
  mkdir -p "$DOCKER_DIR/mysql/data"
fi

# 檢查並建立日誌目錄
if [ -d "$DOCKER_DIR/logs" ]; then
  echo -e "${BLUE}✓ 日誌目錄已存在，跳過建立${NC}"
else
  echo "建立日誌目錄: $DOCKER_DIR/logs"
  mkdir -p "$DOCKER_DIR/logs"
fi

# 設定權限（MySQL 需要特定權限）
echo "設定目錄權限..."
chmod -R 755 "$DOCKER_DIR"

echo ""
echo -e "${GREEN}✓ Docker 資料目錄初始化完成！${NC}"
echo ""
echo "目錄結構："
echo "  - $DOCKER_DIR/mysql/data  (MySQL 資料檔案)"
echo "  - $DOCKER_DIR/logs         (日誌檔案)"
echo ""
