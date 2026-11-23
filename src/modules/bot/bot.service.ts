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
  async handleStart(chatId: number, username?: string): Promise<void> {
    this.logger.log(`Chat ${chatId} (${username ?? 'no username'}) started the bot`);

    // 儲存用戶資訊
    // await this.databaseService.saveUser(chatId, username);

    // 發送歡迎訊息
    await this.telegramService.sendMessage(
      chatId,
      '👋 歡迎使用 Aurelia Bot！\n\n' +
      '可用指令：\n' +
      '/help - 查看幫助\n' +
      '/status - 查看狀態',
    );
  }

  /**
   * 處理 /help 指令
   */
  async handleHelp(chatId: number): Promise<void> {
    const helpText =
      '📖 Aurelia Bot 使用說明\n\n' +
      '指令列表：\n' +
      '/start - 開始使用\n' +
      '/help - 顯示此幫助訊息\n' +
      '/status - 查看系統狀態\n\n' +
      '目前直接發送訊息，Bot 會原文回覆（echo）。';

    await this.telegramService.sendMessage(chatId, helpText);
  }

  /**
   * 處理 /status 指令
   */
  async handleStatus(chatId: number): Promise<void> {
    const status =
      '✅ 系統狀態\n\n' +
      '🤖 Bot: 運行中\n' +
      '💾 Database: 已連接\n' +
      '🧠 AI: 就緒';

    await this.telegramService.sendMessage(chatId, status);
  }

  /**
   * 處理私聊文字訊息
   *
   * 目前只是 echo，用來驗證收發流程。之後私聊會接上 AI 對話。
   */
  async handlePrivateText(chatId: number, text: string): Promise<void> {
    this.logger.log(`Private chat ${chatId} sent: ${text}`);
    await this.telegramService.sendMessage(chatId, text);
  }

  /**
   * 處理群組文字訊息
   *
   * 目前只是 echo，之後會與私聊各自演進。
   */
  async handleGroupText(chatId: number, text: string): Promise<void> {
    this.logger.log(`Group chat ${chatId} sent: ${text}`);
    await this.telegramService.sendMessage(chatId, text);
  }
}
