import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TelegramService } from '../../integrations/telegram/telegram.service.js';
import { TelegramLog } from '../../infrastructure/database/entities/index.js';

/**
 * Bot 指令處理
 *
 * 專門處理 /start、/help、/status 等指令邏輯。
 */
@Injectable()
export class BotCommand {
  private readonly logger = new Logger(BotCommand.name);

  constructor(
    @InjectRepository(TelegramLog)
    private telegramLogRepo: Repository<TelegramLog>,
    private telegramService: TelegramService,
  ) { }

  /**
   * 處理 /start 指令
   */
  async handleStart(chatId: number, username?: string): Promise<void> {
    this.logger.log(`Chat ${chatId} (${username ?? 'no username'}) started the bot`);

    // 記錄收到的指令
    await this.telegramLogRepo.save({
      chatId,
      messageId: undefined,
      content: '/start',
      direction: 'incoming',
      username,
      chatType: 'private',
      metadata: { command: 'start' },
    });

    // 發送歡迎訊息
    const welcomeMessage =
      '👋 歡迎使用 Aurelia Bot！\n\n' +
      '可用指令：\n' +
      '/help - 查看幫助\n' +
      '/status - 查看狀態';

    await this.telegramService.sendMessage(chatId, welcomeMessage);

    // 記錄發送的訊息
    await this.telegramLogRepo.save({
      chatId,
      messageId: undefined,
      content: welcomeMessage,
      direction: 'outgoing',
      chatType: 'private',
      metadata: { command: 'start' },
    });
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

    // 記錄發送的訊息
    await this.telegramLogRepo.save({
      chatId,
      messageId: undefined,
      content: helpText,
      direction: 'outgoing',
      chatType: 'private',
      metadata: { command: 'help' },
    });
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

    // 記錄發送的訊息
    await this.telegramLogRepo.save({
      chatId,
      messageId: undefined,
      content: status,
      direction: 'outgoing',
      chatType: 'private',
      metadata: { command: 'status' },
    });
  }
}
