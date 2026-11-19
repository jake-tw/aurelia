import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  constructor(private config: ConfigService) {
    const botToken = this.config.get<string>('telegram.botToken');
    this.logger.log('TelegramService initialized');
    // TODO: 初始化 Telegraf bot
  }

  /**
   * 發送文字訊息
   */
  async sendMessage(chatId: string | number, text: string): Promise<void> {
    this.logger.log(`Sending message to ${chatId}: ${text}`);
    // TODO: 實作 bot.telegram.sendMessage
  }

  /**
   * 發送圖片
   */
  async sendPhoto(chatId: string | number, photo: string): Promise<void> {
    this.logger.log(`Sending photo to ${chatId}`);
    // TODO: 實作 bot.telegram.sendPhoto
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
    // TODO: 實作 bot.telegram.editMessageText
  }

  /**
   * 發送 Markdown 格式訊息
   */
  async sendMarkdown(chatId: string | number, text: string): Promise<void> {
    this.logger.log(`Sending markdown to ${chatId}`);
    // TODO: 實作帶 parse_mode 的發送
  }

  /**
   * 取得 Bot 資訊
   */
  async getBotInfo(): Promise<any> {
    this.logger.log('Getting bot info');
    // TODO: 實作 bot.telegram.getMe
    return { username: 'aurelia_bot' };
  }
}
