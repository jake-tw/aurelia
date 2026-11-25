import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TelegramService } from '../../integrations/telegram/telegram.service.js';
import { TelegramLog } from '../../infrastructure/database/entities/index.js';

/**
 * Bot 訊息處理服務
 *
 * 專門處理一般文字訊息（私聊與群組），不含指令邏輯。
 */
@Injectable()
export class BotService {
  private readonly logger = new Logger(BotService.name);

  constructor(
    @InjectRepository(TelegramLog)
    private telegramLogRepo: Repository<TelegramLog>,
    private telegramService: TelegramService,
  ) {}


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
