# Telegram Bot 白名單功能

## 概述

Bot 模組現在支援白名單功能，可以限制哪些私聊用戶和群組可以使用 Bot，並且可以進一步控制群組內哪些成員可以發送訊息。白名單透過環境變數配置，分為三種類型：私聊、群組、群組成員。

## 配置方式

在 `.env` 檔案中設定：

```bash
# 私聊白名單（用戶 ID，逗號分隔）
TELEGRAM_WHITELIST_PRIVATE=123456789,987654321

# 群組白名單（群組 ID，逗號分隔，通常是負數）
TELEGRAM_WHITELIST_GROUP=-1001234567890,-1009876543210

# 群組成員白名單（用戶 ID，逗號分隔）
TELEGRAM_WHITELIST_GROUP_MEMBER=123456789,987654321
```

### 取得 Chat ID

**私聊 ID（用戶 ID）：**
- 使用 [@userinfobot](https://t.me/userinfobot) 查詢自己的用戶 ID
- 或在 Bot 日誌中查看收到訊息時的 `chatId`

**群組 ID：**
- 將 Bot 加入群組後，發送訊息
- 在 Bot 日誌中查看 `chatId`（通常是以 `-100` 開頭的負數）
- 或使用 [@getidsbot](https://t.me/getidsbot) 等工具

## 行為說明

### 白名單為空時

- **私聊白名單為空**：允許所有私聊用戶使用 Bot
- **群組白名單為空**：允許所有群組使用 Bot
- **群組成員白名單為空**：允許白名單群組內的所有成員

這是預設行為，適合開發和測試階段。

### 白名單有值時

#### 私聊白名單
- 只有在白名單中的用戶 ID 可以使用 Bot

#### 群組白名單
- 只有在白名單中的群組 ID 可以使用 Bot
- 群組不在白名單中時，該群組的所有訊息都會被拒絕

#### 群組成員白名單
- **前提**：群組必須先在群組白名單中
- **當群組白名單有值且群組成員白名單為空**：該群組的所有成員都可以發送訊息
- **當群組成員白名單有值**：只有在成員白名單中的用戶可以在白名單群組中發送訊息
- **當群組白名單為空**：群組成員白名單不生效（所有群組都允許）

### 群組成員白名單運作邏輯

```
1. 群組白名單為空？
   └─ 是 → ✅ 允許所有群組（成員白名單不生效）
   └─ 否 → 繼續檢查

2. 群組在白名單中？
   └─ 否 → ❌ 拒絕
   └─ 是 → 繼續檢查

3. 群組成員白名單為空？
   └─ 是 → ✅ 允許該群組的所有成員
   └─ 否 → 繼續檢查

4. 發送者在成員白名單中？
   └─ 是 → ✅ 允許
   └─ 否 → ❌ 拒絕
```

### 適用範圍

白名單檢查適用於所有入口：

- `/start` 指令
- `/help` 指令
- `/status` 指令
- 私聊文字訊息
- 群組文字訊息

### 特殊處理

- **Channel（頻道）**：一律拒絕，不受白名單影響
- **Supergroup（超級群組）**：使用群組白名單規則

## 日誌記錄

當白名單拒絕請求時，會記錄 WARN 等級日誌：

```
[Nest] WARN [BotUpdate] Rejected /start from non-whitelisted private chat 999
[Nest] WARN [BotUpdate] Rejected message from non-whitelisted group chat -999
```

## 安全建議

1. **生產環境必須設定白名單**：見 [ADR-0001](../adr/0001-self-managed-telegraf.md)
2. **定期檢查日誌**：查看是否有未授權的訪問嘗試
3. **最小權限原則**：只將真正需要使用的用戶/群組加入白名單
4. **敏感功能上線前**：務必先配置白名單，避免未授權訪問

## 範例配置

### 開發環境（允許所有）

```bash
TELEGRAM_WHITELIST_PRIVATE=
TELEGRAM_WHITELIST_GROUP=
TELEGRAM_WHITELIST_GROUP_MEMBER=
```

### 生產環境（僅允許特定用戶和群組）

```bash
# 只允許管理員 Alice 和 Bob 私聊
TELEGRAM_WHITELIST_PRIVATE=123456789,987654321

# 只允許團隊群組和測試群組
TELEGRAM_WHITELIST_GROUP=-1001234567890,-1009876543210

# 群組內所有成員都可以使用（成員白名單為空）
TELEGRAM_WHITELIST_GROUP_MEMBER=
```

### 嚴格控制（群組 + 成員雙重白名單）

```bash
# 私聊：只允許管理員
TELEGRAM_WHITELIST_PRIVATE=123456789

# 群組：只允許特定群組
TELEGRAM_WHITELIST_GROUP=-1001234567890

# 群組成員：只允許 Alice、Bob、Charlie 在該群組中使用 Bot
TELEGRAM_WHITELIST_GROUP_MEMBER=123456789,987654321,111222333
```

### 允許多個群組，但限制成員

```bash
TELEGRAM_WHITELIST_PRIVATE=

# 允許群組 A 和群組 B
TELEGRAM_WHITELIST_GROUP=-1001111111111,-1002222222222

# 但只有這三個人可以在這些群組中使用 Bot
TELEGRAM_WHITELIST_GROUP_MEMBER=123456789,987654321,111222333
```

### 僅允許私聊（不允許任何群組）

```bash
TELEGRAM_WHITELIST_PRIVATE=123456789
# 群組白名單設為不存在的 ID
TELEGRAM_WHITELIST_GROUP=-1
TELEGRAM_WHITELIST_GROUP_MEMBER=
```

## 測試覆蓋

白名單功能包含完整的單元測試：

**基礎白名單（9 個測試）：**
- 白名單為空時允許所有訪問
- 白名單有值時僅允許列表中的 ID
- 私聊和群組白名單獨立運作
- 所有指令和訊息類型都受保護
- Supergroup 使用群組白名單規則

**群組成員白名單（6 個測試）：**
- 成員白名單為空時允許群組內所有成員
- 成員白名單有值時僅允許列表中的成員
- 群組不在白名單時不檢查成員白名單
- 群組白名單為空時成員白名單不生效
- 群組和成員都設定時兩者都需要匹配
- 沒有 userId 時拒絕（成員白名單啟用時）

執行測試：

```bash
npm run test
```

## 日誌記錄

當白名單拒絕請求時，會記錄 WARN 等級日誌：

```
[Nest] WARN [BotUpdate] Rejected /start from non-whitelisted private chat 999
[Nest] WARN [BotUpdate] Rejected message from non-whitelisted group chat -999
[Nest] WARN [BotUpdate] Rejected message from non-whitelisted group chat -100 (user 888)
```

**注意**：無論是否通過白名單檢查，所有訊息都會按照正常流程記錄到資料庫中。白名單只控制是否處理訊息，不影響日誌記錄。
