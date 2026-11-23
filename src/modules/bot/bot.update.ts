import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { BotService } from './bot.service.js';

/**
 * Bot 訊息入口
 *
 * 只從 ctx 取出原始值交給 BotService，不放業務邏輯。
 * handler 在 onModuleInit 註冊，早於 polling 開始（onApplicationBootstrap）。
 */
@Injectable()
export class BotUpdate implements OnModuleInit {
  private readonly logger = new Logger(BotUpdate.name);

  constructor(
    private readonly bot: Telegraf,
    private readonly botService: BotService,
  ) {}

  onModuleInit(): void {
    this.bot.start((ctx) =>
      this.botService.handleStart(ctx.chat.id, ctx.from?.username),
    );
    this.bot.command('help', (ctx) => this.botService.handleHelp(ctx.chat.id));
    this.bot.command('status', (ctx) =>
      this.botService.handleStatus(ctx.chat.id),
    );

    // 指令 handler 已先註冊，命中的指令不會走到這裡
    this.bot.on(message('text'), (ctx) => {
      // 未知指令（例如 /foo）不 echo
      if (ctx.message.entities?.some((e) => e.type === 'bot_command' && e.offset === 0)) {
        return;
      }

      const chatId = ctx.chat.id;
      const chatType: string = ctx.chat.type;
      const text = ctx.message.text;

      switch (chatType) {
        case 'private':
          return this.botService.handlePrivateText(chatId, text);
        case 'group':
        case 'supergroup':
          return this.botService.handleGroupText(chatId, text);
        default:
          // channel 等其他類型忽略
          this.logger.debug(`Ignored message from ${chatType} chat ${chatId}`);
      }
    });
  }
}
