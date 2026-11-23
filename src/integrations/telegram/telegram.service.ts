import { Injectable, Logger } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import type { Message, UserFromGetMe } from 'telegraf/types';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  constructor(private readonly bot: Telegraf) {}

  /**
   * 發送文字訊息
   */
  async sendMessage(
    chatId: string | number,
    text: string,
  ): Promise<Message.TextMessage> {
    this.logger.log(`Sending message to ${chatId}: ${text}`);
    return this.bot.telegram.sendMessage(chatId, text);
  }

  /**
   * 發送圖片
   */
  async sendPhoto(
    chatId: string | number,
    photo: string,
  ): Promise<Message.PhotoMessage> {
    this.logger.log(`Sending photo to ${chatId}`);
    return this.bot.telegram.sendPhoto(chatId, photo);
  }

  /**
   * 編輯訊息
   */
  async editMessageText(
    chatId: string | number,
    messageId: number,
    text: string,
  ): Promise<void> {
    this.logger.log(`Editing message ${messageId} in ${chatId}`);
    await this.bot.telegram.editMessageText(
      chatId,
      messageId,
      undefined,
      text,
    );
  }

  /**
   * 發送 MarkdownV2 格式訊息，特殊字元由呼叫端負責跳脫
   */
  async sendMarkdown(
    chatId: string | number,
    text: string,
  ): Promise<Message.TextMessage> {
    this.logger.log(`Sending markdown to ${chatId}`);
    return this.bot.telegram.sendMessage(chatId, text, {
      parse_mode: 'MarkdownV2',
    });
  }

  /**
   * 取得 Bot 資訊
   */
  async getBotInfo(): Promise<UserFromGetMe> {
    this.logger.log('Getting bot info');
    return this.bot.telegram.getMe();
  }
}
