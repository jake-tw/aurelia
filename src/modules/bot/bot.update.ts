import { Logger } from '@nestjs/common';
import { BotService } from './bot.service.js';

/**
 * Bot 訊息處理入口
 *
 * 注意：這個檔案需要安裝 nestjs-telegraf 後才能使用
 * npm install nestjs-telegraf telegraf
 *
 * 使用方式：
 * @Update()
 * export class BotUpdate {
 *   @Start()
 *   async onStart(@Ctx() ctx: Context) { ... }
 * }
 */

export class BotUpdate {
  private readonly logger = new Logger(BotUpdate.name);

  constructor(private botService: BotService) {}

  // TODO: 安裝 nestjs-telegraf 後解除註解

  // @Start()
  // async onStart(@Ctx() ctx: Context) {
  //   const userId = ctx.from.id;
  //   const username = ctx.from.username;
  //   await this.botService.handleStart(userId, username);
  // }

  // @Command('help')
  // async onHelp(@Ctx() ctx: Context) {
  //   await this.botService.handleHelp(ctx.from.id);
  // }

  // @Command('status')
  // async onStatus(@Ctx() ctx: Context) {
  //   await this.botService.handleStatus(ctx.from.id);
  // }

  // @On('text')
  // async onText(@Ctx() ctx: Context, @Message('text') text: string) {
  //   await this.botService.handleTextMessage(ctx.from.id, text);
  // }
}
