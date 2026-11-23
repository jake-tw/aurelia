import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TelegramService } from '../../integrations/telegram/telegram.service.js';
import { TelegramLog } from '../../infrastructure/database/entities/index.js';

@Injectable()
export class BotService {
  private readonly logger = new Logger(BotService.name);

  constructor(
    @InjectRepository(TelegramLog)
    private telegramLogRepo: Repository<TelegramLog>,
    private telegramService: TelegramService,
  ) {}

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

  /**
   * 處理私聊文字訊息
   *
   * 目前只是 echo，用來驗證收發流程。之後私聊會接上 AI 對話。
   */
  async handlePrivateText(chatId: number, text: string): Promise<void> {
    this.logger.log(`Private chat ${chatId} sent: ${text}`);

    // 記錄收到的訊息
    await this.telegramLogRepo.save({
      chatId,
      messageId: undefined,
      content: text,
      direction: 'incoming',
      chatType: 'private',
    });

    // Echo 回覆
    await this.telegramService.sendMessage(chatId, text);

    // 記錄發送的訊息
    await this.telegramLogRepo.save({
      chatId,
      messageId: undefined,
      content: text,
      direction: 'outgoing',
      chatType: 'private',
      metadata: { type: 'echo' },
    });
  }

  /**
   * 處理群組文字訊息
   *
   * 目前只是 echo，之後會與私聊各自演進。
   */
  async handleGroupText(chatId: number, text: string): Promise<void> {
    this.logger.log(`Group chat ${chatId} sent: ${text}`);

    // 記錄收到的訊息
    await this.telegramLogRepo.save({
      chatId,
      messageId: undefined,
      content: text,
      direction: 'incoming',
      chatType: 'group',
    });

    // Echo 回覆
    await this.telegramService.sendMessage(chatId, text);

    // 記錄發送的訊息
    await this.telegramLogRepo.save({
      chatId,
      messageId: undefined,
      content: text,
      direction: 'outgoing',
      chatType: 'group',
      metadata: { type: 'echo' },
    });
  }
}
