import { Injectable, Logger } from '@nestjs/common';
import { TelegramService } from '../../integrations/telegram/telegram.service.js';
import { DatabaseService } from '../../infrastructure/database/database.service.js';

@Injectable()
export class BotService {
  private readonly logger = new Logger(BotService.name);

  constructor(
    private telegramService: TelegramService,
    private databaseService: DatabaseService,
  ) {}

  /**
   * 處理 /start 指令
   */
  async handleStart(userId: number, username?: string): Promise<void> {
    this.logger.log(`User ${userId} started the bot`);

    // 儲存用戶資訊
    // await this.databaseService.saveUser(userId, username);

    // 發送歡迎訊息
    await this.telegramService.sendMessage(
      userId,
      '👋 歡迎使用 Aurelia Bot！\n\n' +
      '可用指令：\n' +
      '/help - 查看幫助\n' +
      '/status - 查看狀態',
    );
  }

  /**
   * 處理 /help 指令
   */
  async handleHelp(userId: number): Promise<void> {
    const helpText =
      '📖 Aurelia Bot 使用說明\n\n' +
      '指令列表：\n' +
      '/start - 開始使用\n' +
      '/help - 顯示此幫助訊息\n' +
      '/status - 查看系統狀態\n\n' +
      '直接發送訊息可與 AI 對話。';

    await this.telegramService.sendMessage(userId, helpText);
  }

  /**
   * 處理 /status 指令
   */
  async handleStatus(userId: number): Promise<void> {
    const status =
      '✅ 系統狀態\n\n' +
      '🤖 Bot: 運行中\n' +
      '💾 Database: 已連接\n' +
      '🧠 AI: 就緒';

    await this.telegramService.sendMessage(userId, status);
  }

  /**
   * 處理文字訊息（AI 對話）
   */
  async handleTextMessage(userId: number, text: string): Promise<void> {
    this.logger.log(`User ${userId} sent: ${text}`);

    // TODO: 整合 AI 服務
    // const response = await this.aiService.chat(text);

    // 暫時回覆
    await this.telegramService.sendMessage(
      userId,
      `你說：${text}\n\n(AI 功能尚未整合)`,
    );
  }
}
