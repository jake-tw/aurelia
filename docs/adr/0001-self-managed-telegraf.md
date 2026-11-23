# ADR-0001：直接使用原生 telegraf，不使用 nestjs-telegraf

- 狀態：已採納
- 日期：2026-11-19

## 背景

專案使用 NestJS v12。`nestjs-telegraf` 的 peer dependency 目前只宣告支援到 NestJS v11，安裝在 v12 上會有版本衝突。

## 決定

直接使用原生 `telegraf`（^4.16.3），不使用 `nestjs-telegraf`。

- `src/infrastructure/telegraf/` 以 `Telegraf` 類別為 token 提供唯一實例，並負責生命週期。
- `integrations/telegram/` 的 `TelegramService` 注入 `Telegraf`，只負責發送。
- `modules/bot/` 的 `BotUpdate` 注入 `Telegraf`，在 `onModuleInit` 註冊 handler。
- 使用 long polling。啟動時先呼叫 `getMe()` 驗證 token，失敗就讓應用程式啟動失敗，成功才 `launch()`。
- `main.ts` 呼叫 `enableShutdownHooks()`，讓關閉時能 `bot.stop()`。

## 替代方案

- **降級到 NestJS v11**：能用 `nestjs-telegraf`，但要放棄框架升級，被否決。
- **等 `nestjs-telegraf` 支援 v12**：沒有時程，會卡住開發，被否決。
- **用 `--legacy-peer-deps` 強裝**：版本宣告之外的相容性沒有保證，被否決。

## 後果

- 沒有 `@Update`、`@Start`、`@On` 等裝飾器，handler 要手動註冊。
- 生命週期（啟動、關閉、錯誤處理）要自己管，已集中在 `TelegrafLifecycle`。
- 日後若 `nestjs-telegraf` 支援 NestJS v12，可以重新評估，但目前沒有遷移的理由。

## 已知風險

**目前沒有存取控制。** 任何知道 bot 帳號的人都能使用它。現在只有 echo 和固定文字回覆，影響有限。**在接上 `shell/` 或 `claude-code/` 等能執行動作的整合之前，必須先補上存取白名單**（例如 `TELEGRAM_ALLOWED_USER_IDS` 加上 middleware）。現有的 `AdminGuard` 只處理 HTTP，不適用於 Telegraf 的 `ctx`。
