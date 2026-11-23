# Aurelia

基於 NestJS 的多功能整合後端系統，支援 Telegram Bot、資料庫操作、AI 調用等功能。

## 🏗️ 專案架構

```
src/
├── main.ts                      # 應用程式入口
├── app.module.ts                # 根模組
├── app.controller.ts            # 根控制器（Hello World）
├── app.service.ts               # 根服務
│
├── modules/                     # 業務邏輯層
│   ├── bot/                     # Telegram Bot 業務邏輯
│   ├── admin/                   # 管理後台
│   └── tasks/                   # 任務編排
│
├── infrastructure/              # 基礎設施層
│   ├── telegraf/                # Telegraf 實例與生命週期
│   ├── database/                # 資料庫連接
│   ├── cache/                   # 快取服務
│   └── queue/                   # 訊息佇列
│
├── integrations/                # 外部服務整合層
│   ├── telegram/                # Telegram API 封裝
│   ├── ai/                      # AI 服務（Anthropic）
│   ├── shell/                   # Shell 執行
│   └── claude-code/             # Claude Code 整合
│
└── common/                      # 共用工具層
    ├── config/                  # 配置管理
    ├── decorators/              # 自定義裝飾器
    ├── filters/                 # 異常過濾器
    ├── guards/                  # 路由守衛
    ├── interceptors/            # 攔截器
    ├── pipes/                   # 管道
    └── utils/                   # 工具函數
```

## 📐 架構設計原則

### 分層依賴規則

```
modules/ (業務邏輯)
  ↓ 可以依賴
integrations/ (外部整合)
  ↓ 可以依賴
infrastructure/ (基礎設施)
  ↓ 可以依賴
common/ (共用工具)

❌ 反向依賴是禁止的
```

### 模組分類

| 層級 | 用途 | 範例 |
|------|------|------|
| **modules** | 業務邏輯，特定於本專案 | 訂單管理、用戶管理 |
| **integrations** | 外部 API 封裝，可複用 | Telegram Bot、AI SDK |
| **infrastructure** | 技術基礎設施，可複用 | 資料庫、快取、佇列 |
| **common** | 純工具函數，無狀態 | 工具類、裝飾器 |

## 🚀 快速開始

### 環境要求

- Node.js >= 18
- npm >= 9
- MySQL >= 8.0

### 安裝依賴

```bash
npm install
```

### 配置環境變數

複製 `.env.example` 到 `.env` 並填入配置：

```bash
# Application
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=aurelia
DB_PASSWORD=aurelia123
DB_NAME=aurelia

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token_here

# AI
ANTHROPIC_API_KEY=your_api_key_here

# Worker
MAX_CONCURRENT_QUERY_JOBS=3

# Timing (milliseconds)
MIN_TELEGRAM_EDIT_INTERVAL=6000
QUERY_JOB_TIMEOUT=300000
FIX_JOB_TIMEOUT=600000

# Logging
LOG_LEVEL=info
```

### 開發模式

```bash
npm run start:dev
```

### 生產模式

```bash
npm run build
npm run start:prod
```

## 📦 主要功能

### 1. Telegram Bot 整合
- 使用 long polling 接收訊息，啟動時會先驗證 token
- 指令處理：`/start`、`/help`、`/status`
- 文字訊息依聊天類型（私聊、群組）分流，目前都是 echo，用來驗證收發流程
- 對話場景管理（待實作）

> 群組預設為 privacy mode，Bot 只收得到指令和 @ 提及。要收到群組一般文字，需向 BotFather 執行 `/setprivacy` 並選擇 Disable。
>
> 目前沒有存取白名單，知道 Bot 帳號的人都能使用。接上 Shell 或 Claude Code 整合前必須補上，見 ADR-0001。

### 2. 資料庫操作
- TypeORM 整合
- Entity 管理
- 遷移支援

### 3. Shell 執行
- 本地命令執行
- 超時控制
- 錯誤處理

### 4. AI 調用
- Anthropic Claude API
- 一次性對話
- 串流回應

### 5. Claude Code 整合
- CLI 調用
- 任務編排

### 6. 管理後台
- Web 界面
- 系統監控
- 日誌查看

## 🛠️ 開發指南

### 添加新模組

```bash
# 使用 NestJS CLI
nest g module modules/your-module
nest g service modules/your-module
nest g controller modules/your-module
```

### 配置管理

使用 `@nestjs/config` 讀取環境變數：

```typescript
import { ConfigService } from '@nestjs/config';

constructor(private config: ConfigService) {
  const port = this.config.get<number>('port');
  const dbHost = this.config.get<string>('database.host');
}
```

### 日誌記錄

```typescript
import { Logger } from '@nestjs/common';

export class YourService {
  private readonly logger = new Logger(YourService.name);

  someMethod() {
    this.logger.log('Something happened');
    this.logger.error('Something went wrong', error.stack);
  }
}
```

### 使用工具函數

```typescript
import { delay, retry, truncate } from '@/common/utils';

// 延遲執行
await delay(1000);

// 重試機制
const result = await retry(() => apiCall(), { maxAttempts: 3 });

// 字串處理
const short = truncate('Long text...', 10);
```

## 🧪 測試

```bash
# 單元測試
npm run test

# E2E 測試
npm run test:e2e

# 測試覆蓋率
npm run test:cov
```

## 📝 腳本命令

```bash
npm run start          # 啟動應用
npm run start:dev      # 開發模式（熱重載）
npm run start:debug    # 調試模式
npm run start:prod     # 生產模式

npm run build          # 編譯 TypeScript
npm run format         # 格式化代碼
npm run lint           # 程式碼檢查

npm run test           # 執行測試
npm run test:watch     # 監聽模式測試
npm run test:cov       # 測試覆蓋率
npm run test:e2e       # E2E 測試
```

## 🔒 安全性注意事項

1. **本地執行專案** - 無公網暴露風險
2. **環境變數保護** - `.env` 已加入 `.gitignore`
3. **Shell 執行** - 本地使用，注意指令來源
4. **API 密鑰** - 不要提交到版本控制

## 📚 技術棧

- **框架**: NestJS 12.x
- **語言**: TypeScript 6.x
- **模組系統**: ESM
- **測試**: Vitest
- **程式碼檢查**: oxlint
- **格式化**: Prettier
- **ORM**: TypeORM (待整合)
- **Bot**: telegraf（原生，不使用 nestjs-telegraf，見 [ADR-0001](./docs/adr/0001-self-managed-telegraf.md)）
- **AI**: @anthropic-ai/sdk (待整合)

## 🔗 相關文檔

- [NestJS 官方文檔](https://docs.nestjs.com)
- [NestJS LLM 文檔](https://docs.nestjs.com/llms.txt)
- [專案 Agent 指令](./AGENTS.md)
- [NestJS Framework 指南](./docs/agents/nestjs.md)
- [架構說明](./docs/ARCHITECTURE.md)
- [ADR-0001：直接使用原生 telegraf](./docs/adr/0001-self-managed-telegraf.md)
