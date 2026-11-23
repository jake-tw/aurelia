# Aurelia 架構說明

## 📐 分層架構

本專案採用清晰的分層架構，遵循依賴反向原則。

```
src/
├── main.ts                          # 應用程式入口
├── app.module.ts                    # 根模組
├── app.controller.ts                # 根控制器
├── app.service.ts                   # 根服務
│
├── modules/                         # 🔵 業務邏輯層（頂層）
│   └── bot/                         # Telegram Bot 業務邏輯
│       ├── bot.module.ts            # Bot 模組定義
│       ├── bot.service.ts           # Bot 業務邏輯（處理指令與文字訊息）
│       └── bot.update.ts            # Bot 訊息入口（註冊 handler、依聊天類型分流）
│
├── integrations/                    # 🟢 外部服務整合層（中層）
│   └── telegram/                    # Telegram API 封裝
│       ├── telegram.module.ts       # Telegram 模組
│       └── telegram.service.ts      # Telegram API（發送訊息）
│
├── infrastructure/                  # 🟡 基礎設施層（底層）
│   ├── telegraf/                    # Telegraf 實例與生命週期
│   │   ├── telegraf.module.ts       # 提供唯一的 Telegraf 實例
│   │   └── telegraf.lifecycle.ts    # 啟動（polling）與關閉
│   └── database/                    # 資料庫連接
│       ├── database.module.ts       # 資料庫模組
│       └── database.service.ts      # 資料庫操作
│
└── common/                          # ⚪ 共用工具層（無狀態）
    ├── config/                      # 配置管理
    │   ├── configuration.ts         # 環境變數配置
    │   └── validation.schema.ts     # 配置驗證規則
    │
    ├── decorators/                  # 自定義裝飾器
    │   └── admin-only.decorator.ts
    │
    ├── filters/                     # 異常過濾器
    │   └── all-exceptions.filter.ts
    │
    ├── guards/                      # 路由守衛
    │   └── admin.guard.ts
    │
    ├── interceptors/                # 攔截器
    │   └── logging.interceptor.ts
    │
    ├── pipes/                       # 管道
    │   └── validation.pipe.ts
    │
    └── utils/                       # 工具函數
        ├── index.ts
        ├── async.util.ts            # 異步工具
        ├── logger.util.ts           # 日誌工具
        ├── string.util.ts           # 字串處理
        └── validation.util.ts       # 驗證工具
```

---

## 🎯 分層規則

### 依賴方向（單向依賴）

```
modules/         (業務邏輯 - 頂層)
  ↓ 可以依賴
integrations/    (外部整合 - 中層)
  ↓ 可以依賴
infrastructure/  (基礎設施 - 底層)
  ↓ 可以依賴
common/          (共用工具 - 無狀態)

❌ 反向依賴是禁止的
```

### 實際範例

```typescript
// ✅ 允許的依賴
BotService → TelegramService (業務 → 整合)
BotService → DatabaseService (業務 → 基礎設施)
TelegramService → ConfigService (整合 → 共用)

// ❌ 禁止的依賴
TelegramService → BotService (整合 ❌→ 業務)
DatabaseService → TelegramService (基礎設施 ❌→ 整合)
```

---

## 📦 模組職責

### modules/ - 業務邏輯層

**特徵：**
- 特定於本專案的業務邏輯
- 不可直接複用到其他專案
- 可以依賴下層所有模組

**範例：**
```typescript
// modules/bot/bot.service.ts
@Injectable()
export class BotService {
  constructor(
    private telegramService: TelegramService,  // 使用整合層
    private databaseService: DatabaseService,  // 使用基礎設施層
  ) {}

  async handleStart(userId: number) {
    // 業務邏輯編排
    await this.databaseService.saveUser(userId);
    await this.telegramService.sendMessage(userId, 'Welcome!');
  }
}
```

### integrations/ - 外部服務整合層

**特徵：**
- 封裝第三方 API/SDK
- 技術性，可複用
- 不包含業務邏輯
- 只依賴基礎設施層和共用工具

**範例：**
```typescript
// integrations/telegram/telegram.service.ts
@Injectable()
export class TelegramService {
  // 純粹的 API 封裝
  async sendMessage(chatId: number, text: string) {
    // 調用 Telegram API
  }
}
```

**典型模組：**
- `telegram/` - Telegram Bot API
- `ai/` - Anthropic Claude API
- `shell/` - Shell 命令執行
- `claude-code/` - Claude Code CLI

### infrastructure/ - 基礎設施層

**特徵：**
- 技術基礎設施
- 完全可複用
- 不依賴業務邏輯
- 只依賴共用工具

**範例：**
```typescript
// infrastructure/database/database.service.ts
@Injectable()
export class DatabaseService {
  async query(sql: string) {
    // 資料庫查詢
  }
}
```

**典型模組：**
- `database/` - 資料庫連接
- `cache/` - 快取服務
- `queue/` - 訊息佇列

### common/ - 共用工具層

**特徵：**
- 純函數、工具類
- 無狀態
- 不依賴任何其他層
- 完全可複用

**範例：**
```typescript
// common/utils/async.util.ts
export async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

---

## 🔄 Telegram 模組的特殊處理

### 問題：Telegram 有雙重角色

1. **接收訊息**（入口 - 頂層）- 處理用戶指令
2. **發送訊息**（工具 - 底層）- 被其他模組調用

### 解決方案：拆成三個模組，共用同一個 Telegraf 實例

本專案直接使用原生 `telegraf`，不使用 `nestjs-telegraf`（原因見 [ADR-0001](./adr/0001-self-managed-telegraf.md)）。

```
infrastructure/telegraf/        # 底層：持有唯一的 Telegraf 實例
├── telegraf.module.ts          # 以 Telegraf 類別為 token 提供實例
└── telegraf.lifecycle.ts       # getMe() 驗證 token → launch() → stop()

integrations/telegram/          # 中層：API 封裝
├── telegram.module.ts
└── telegram.service.ts         # sendMessage(), sendPhoto()

modules/bot/                    # 頂層：業務邏輯
├── bot.module.ts
├── bot.service.ts              # 處理業務邏輯
└── bot.update.ts               # 註冊 handler，從 ctx 取值後交給 BotService
```

**依賴關係：**
```
BotUpdate → BotService → TelegramService
   ↓                          ↓
   └────→ Telegraf ←──────────┘   (infrastructure/telegraf)
```

**生命週期：**
1. `onModuleInit`：`BotUpdate` 向 `Telegraf` 註冊 handler。
2. `onApplicationBootstrap`：`TelegrafLifecycle` 先呼叫 `getMe()`。token 無效時應用程式啟動失敗，成功才 `launch()` 開始 long polling。
3. `onApplicationShutdown`：呼叫 `bot.stop(signal)`。`main.ts` 需要 `enableShutdownHooks()`，否則收不到 SIGINT/SIGTERM。

**優點：**
- ✅ 避免循環依賴
- ✅ 職責清晰分離
- ✅ TelegramService 可被其他模組安全使用
- ✅ Bot 業務邏輯集中在 modules/bot/
- ✅ 不受 `nestjs-telegraf` 的 NestJS 版本宣告限制

**聊天類型分流：** `BotUpdate` 依 `ctx.chat.type` 分流文字訊息。`private` 走 `handlePrivateText`，`group` 與 `supergroup` 走 `handleGroupText`，其他類型忽略。`/start`、`/help`、`/status` 不分流。群組預設的 privacy mode 下 bot 只收得到指令和 @ 提及，要收一般文字需在 BotFather 用 `/setprivacy` 關閉。

---

## 🛠️ 開發指南

### 添加新的業務功能

```bash
# 在 modules/ 下創建
nest g module modules/tasks
nest g service modules/tasks
nest g controller modules/tasks
```

### 添加新的外部整合

```bash
# 在 integrations/ 下創建
nest g module integrations/ai
nest g service integrations/ai
```

### 添加新的基礎設施

```bash
# 在 infrastructure/ 下創建
nest g module infrastructure/cache
nest g service infrastructure/cache
```

### 使用工具函數

```typescript
import { delay, retry, truncate } from '../../common/utils/index.js';

// 延遲
await delay(1000);

// 重試
await retry(() => apiCall(), { maxAttempts: 3 });

// 字串處理
const short = truncate('Long text', 10);
```

---

## 📋 檢查清單

在添加新模組時，問自己：

1. **這是業務邏輯嗎？** → `modules/`
2. **這是外部 API 封裝嗎？** → `integrations/`
3. **這是技術基礎設施嗎？** → `infrastructure/`
4. **這是純工具函數嗎？** → `common/utils/`

### 依賴檢查

- [ ] 底層模組沒有依賴上層模組
- [ ] 沒有循環依賴
- [ ] Service 職責單一
- [ ] 業務邏輯不在底層模組

---

## 🔍 範例：完整流程

**場景：用戶發送訊息給 Bot，Bot 調用 AI 回覆**

```
1. Telegram 發送訊息
   ↓
2. BotUpdate 接收 (bot.on(message('text')))
   ↓
3. BotService.handleTextMessage()
   ├─→ DatabaseService.getUserHistory()    # 基礎設施層
   ├─→ AiService.chat()                    # 整合層
   ├─→ DatabaseService.saveMessage()       # 基礎設施層
   └─→ TelegramService.sendMessage()       # 整合層
```

**代碼：**
```typescript
// modules/bot/bot.update.ts
@Injectable()
export class BotUpdate implements OnModuleInit {
  constructor(private bot: Telegraf, private botService: BotService) {}

  onModuleInit() {
    this.bot.on(message('text'), (ctx) =>
      this.botService.handlePrivateText(ctx.chat.id, ctx.message.text),
    );
  }
}

// modules/bot/bot.service.ts
async handlePrivateText(chatId: number, text: string) {
  const history = await this.databaseService.getUserHistory(chatId);
  const response = await this.aiService.chat(text, history);
  await this.databaseService.saveMessage(chatId, text, response);
  await this.telegramService.sendMessage(chatId, response);
}
```

---

## 📚 相關文檔

- [NestJS 文檔](https://docs.nestjs.com)
- [NestJS LLM 文檔](https://docs.nestjs.com/llms.txt)
