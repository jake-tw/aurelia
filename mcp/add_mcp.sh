#!/usr/bin/env bash

SERVICE="company-mcp-server"
URL="http://127.0.0.1:19500/mcp/query-tools"
DESC="公司專案的資料庫存取工具（MySQL/Redis）"
TOKEN="<token>" # 替換為真實 token

echo "設定 MCP 服務：${SERVICE}"
echo "URL：${URL}"
echo "DESC：${DESC}"

# 註冊 MCP 服務
claude mcp add-json \
--scope project \
$SERVICE \
"{\"type\":\"http\",\"url\":\"${URL}\",\"description\":\"${DESC}\",\"headers\":{\"Authorization\":\"Bearer ${TOKEN}\"}}"

# 刪除 MCP 指令：claude mcp remove $SERVICE
