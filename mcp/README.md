# MCP Toolbox 部署（MySQL / Redis）

在遠端**測試機器**部署 [Google MCP Toolbox for Databases](https://github.com/googleapis/genai-toolbox)，讓 AI 透過 MCP 查詢測試環境資料，協助開發與除錯。

## 架構

```
本機 AI 用戶端 ──HTTP / HTTPS──> Nginx ──Nginx 白名單──> 測試機 toolbox (Docker, host network)
                                                         ├─> MySQL
                                                         └─> Redis
```

- toolbox 監聽 `0.0.0.0:19500`，透過 Nginx 白名單控制存取來源；toolbox 本身沒有認證，存取控制完全靠 Nginx。
- 資料庫帳號一律使用唯讀帳號。
- MongoDB：專案版本為 4.0，MCP Toolbox 要求 4.2 以上，故暫不支援。

## 目錄

| 檔案 | 說明 |
| --- | --- |
| `tools.yaml` | toolbox 設定：2 個 source（MySQL/Redis）、tools、toolset `query-tools` |
| `.env.example` | 版本、連線資訊範本 |
| `docker-compose.yml` | toolbox 容器定義（`network_mode: host`） |
| `install.sh` | 遠端執行，檢查 Docker、檢查連線、啟動容器 |
| `sql/create-readonly-user.sql` | MySQL 與 Redis 的唯讀帳號建立範例 |
| `add_mcp.sh` | 本機執行，將 MCP 服務註冊到專案（效果等同手動編輯 `.mcp.json`） |
| `.mcp.json.example` | 用戶端 MCP 設定範例 (放置到專案根目錄 .mcp.json 後啟用 mcp server ) |
| `skills/*/SKILL.md` | 核心技能 (放置到專案根目錄 .claude/skills/*/SKILL.md) |
| `nginx.conf.example` | Nginx 設定範例 |

## 部署流程

1. **前置條件**：測試機為 Linux（`network_mode: host` 僅支援 Linux），已安裝 Docker 與 Docker Compose v2；測試機可連到 MySQL 與 Redis；已設定 Nginx 白名單。
2. **建立唯讀帳號**：依 `sql/create-readonly-user.sql` 建立 `mcp_user`。
3. **設定環境變數**
   ```bash
   cd mcp
   cp .env.example .env   # 填入主機、帳密、資料庫名稱
   ```
4. **調整 `tools.yaml`**：依需求新增查詢 tools（例如 Redis 的其他指令、MySQL 預寫查詢）。
5. **部署到測試機**：將整個 `mcp` 目錄複製到測試機後，在測試機執行
   ```bash
   ./install.sh
   ```
   過程會顯示 MySQL 與 Redis 的 TCP 連線結果（`FAIL` 請先排查網路 / 防火牆），並以 `docker compose up -d` 啟動容器。
6. **設定用戶端**（本機）：
   - 方法一：執行 `./add_mcp.sh` 自動註冊服務到專案的 `.mcp.json`
   - 方法二：手動將 `.mcp.json.example` 的內容合併到專案目錄的 `.mcp.json`
   
   toolbox 本身無認證，安全性靠 Nginx 白名單保障。URL `/mcp/query-tools` 載入 toolset `query-tools`；`/mcp` 載入全部 tools。
7. **驗證**：執行 `claude mcp list` 應顯示 connected，再請 AI 列出資料表、讀一個 Redis key。

## 安全注意事項

- 僅用於**測試環境**，不要指向正式資料庫。
- `mysql-execute-sql` 可執行任意 SQL，工具沒有內建唯讀保護，**防線是唯讀資料庫帳號**，請勿給 mcp_user 寫入權限。
- `.env` 含密碼，遠端權限為 600，且已列入 `.gitignore`。
- AI 能看到查詢結果，測試資料請避免含真實個資。
- toolbox 透過 Nginx 白名單控制存取來源，請確保白名單僅包含可信任的 IP。

## 升級與維運

- 升級：到 [release 頁面](https://github.com/googleapis/genai-toolbox/releases) 取得新版本號，更新 `.env` 的 `TOOLBOX_VERSION` 後重新 `./deploy.sh`。
- 改 `tools.yaml` 後重新 `./deploy.sh`（容器會重建）。
- 查看日誌：`docker logs -f mcp-toolbox`
- 本地測試服務是否存活：在測試機執行 `curl -s http://127.0.0.1:19500/mcp -o /dev/null -w '%{http_code}\n'`。

## 尚未驗證事項

此環境無法連到您的測試機，以下內容**未實際執行**，首次部署請留意：

- 所有腳本只依文件撰寫，未在真實機器跑過。
- compose 的 `--address` / `--port` 參數，請用 `docker run --rm <image> --help` 確認該版本支援。
- 映像檔路徑 `us-central1-docker.pkg.dev/database-toolbox/toolbox/toolbox:1.15.0` 已確認存在，但容器內 `tools.yaml` 掛載位置 `/app/tools.yaml` 未實測。
- `${VAR}` 替換依官方 sources 文件；若變數未被替換，改為直接寫死值。

## 查詢範例

1. 查詢工具列表

```sh
curl -X POST http://127.0.0.1:19500/mcp/query-tools \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "tools/list",
    "params": {
    }
  }'
```

2. 查詢 company 用戶總數

```sh
curl -X POST http://127.0.0.1:19500/mcp/query-tools \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "tools/call",
    "params": {
      "name": "mysql_execute_sql",
      "arguments": {
        "sql": "SELECT count(1) FROM company.ums_member;"
      }
    }
  }'
```
