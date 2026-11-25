/**
 * Telegram Bot 指令配置
 *
 * 定義所有 bot 指令，供：
 * 1. Telegram setMyCommands API 使用
 * 2. 程式碼中 handler 註冊參考
 */

export interface CommandConfig {
  /** 指令名稱（不含 /） */
  command: string;
  /** 指令說明（顯示在 Telegram 指令選單） */
  description: string;
}

/**
 * 所有可用指令的定義
 */
export const TELEGRAM_COMMANDS: readonly CommandConfig[] = [
  {
    command: 'start',
    description: '開始使用',
  },
  {
    command: 'help',
    description: '顯示幫助訊息',
  },
  {
    command: 'status',
    description: '查看系統狀態',
  },
] as const;
