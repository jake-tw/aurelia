import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { BotService } from './bot.service.js';
import { BotCommand } from './bot.command.js';

/**
 * Bot 訊息入口
 *
 * 只從 ctx 取出原始值交給 BotService，不放業務邏輯。
 * handler 在 onModuleInit 註冊，早於 polling 開始（onApplicationBootstrap）。
 */
@Injectable()
export class BotUpdate implements OnModuleInit {
  private readonly logger = new Logger(BotUpdate.name);
  private readonly whitelistPrivate: number[];
  private readonly whitelistGroup: number[];
  private readonly whitelistGroupMember: number[];

  constructor(
    private readonly bot: Telegraf,
    private readonly botService: BotService,
    private readonly botCommand: BotCommand,
    private readonly config: ConfigService,
  ) {
    this.whitelistPrivate = this.config.get<number[]>('telegram.whitelistPrivate', []);
    this.whitelistGroup = this.config.get<number[]>('telegram.whitelistGroup', []);
    this.whitelistGroupMember = this.config.get<number[]>('telegram.whitelistGroupMember', []);
  }

  /**
   * 檢查聊天是否在白名單中
   */
  private isWhitelisted(chatId: number, chatType: string, userId?: number): boolean {
    // 私聊檢查
    if (chatType === 'private') {
      // 白名單為空表示允許所有私聊
      if (this.whitelistPrivate.length === 0) {
        return true;
      }
      return this.whitelistPrivate.includes(chatId);
    }

    // 群組檢查
    if (chatType === 'group' || chatType === 'supergroup') {
      // 兩個白名單都為空表示允許所有群組的所有成員
      if (this.whitelistGroup.length === 0 && this.whitelistGroupMember.length === 0) {
        return true;
      }

      // 群組白名單為空但成員白名單有設定，表示不限制群組但限制成員
      if (this.whitelistGroup.length === 0 && this.whitelistGroupMember.length > 0) {
        if (userId !== undefined) {
          return this.whitelistGroupMember.includes(userId);
        }
        // 沒有 userId 資訊時拒絕
        return false;
      }

      // 群組白名單有設定，先檢查群組
      if (!this.whitelistGroup.includes(chatId)) {
        return false;
      }

      // 群組在白名單中，檢查成員白名單
      // 成員白名單為空表示允許該群組的所有成員
      if (this.whitelistGroupMember.length === 0) {
        return true;
      }

      // 檢查發送者是否在成員白名單中
      if (userId !== undefined) {
        return this.whitelistGroupMember.includes(userId);
      }

      // 沒有 userId 資訊時拒絕（不應該發生）
      return false;
    }

    // 其他類型（如 channel）一律拒絕
    return false;
  }

  onModuleInit(): void {
    this.bot.start((ctx) => {
      if (!this.isWhitelisted(ctx.chat.id, ctx.chat.type, ctx.from?.id)) {
        this.logger.warn(
          `Rejected /start from non-whitelisted ${ctx.chat.type} chat ${ctx.chat.id}` +
          (ctx.from?.id ? ` (user ${ctx.from.id})` : ''),
        );
        return;
      }
      return this.botCommand.handleStart(ctx.chat.id, ctx.from?.username);
    });

    this.bot.command('help', (ctx) => {
      if (!this.isWhitelisted(ctx.chat.id, ctx.chat.type, ctx.from?.id)) {
        this.logger.warn(
          `Rejected /help from non-whitelisted ${ctx.chat.type} chat ${ctx.chat.id}` +
          (ctx.from?.id ? ` (user ${ctx.from.id})` : ''),
        );
        return;
      }
      return this.botCommand.handleHelp(ctx.chat.id);
    });

    this.bot.command('status', (ctx) => {
      if (!this.isWhitelisted(ctx.chat.id, ctx.chat.type, ctx.from?.id)) {
        this.logger.warn(
          `Rejected /status from non-whitelisted ${ctx.chat.type} chat ${ctx.chat.id}` +
          (ctx.from?.id ? ` (user ${ctx.from.id})` : ''),
        );
        return;
      }
      return this.botCommand.handleStatus(ctx.chat.id);
    });

    // 指令 handler 已先註冊，命中的指令不會走到這裡
    this.bot.on(message('text'), (ctx) => {
      // 未知指令（例如 /foo）不 echo
      if (ctx.message.entities?.some((e) => e.type === 'bot_command' && e.offset === 0)) {
        return;
      }

      const chatId = ctx.chat.id;
      const chatType: string = ctx.chat.type;
      const text = ctx.message.text;
      const userId = ctx.from?.id;

      // 白名單檢查
      if (!this.isWhitelisted(chatId, chatType, userId)) {
        this.logger.warn(
          `Rejected message from non-whitelisted ${chatType} chat ${chatId}` +
          (userId ? ` (user ${userId})` : ''),
        );
        return;
      }

      switch (chatType) {
        case 'private':
          return this.botService.handlePrivateText(chatId, ctx.message.message_id, text);
        case 'group':
        case 'supergroup': {
          // 群組中只在以下情況回應：
          // 1. 訊息中有 mention bot（entities 包含 mention 且文字是 bot username）
          // 2. 訊息是回覆 bot 的訊息
          const botInfo = this.bot.botInfo;
          const isMentioned = ctx.message.entities?.some(
            (e) => e.type === 'mention' &&
              text.substring(e.offset, e.offset + e.length) === `@${botInfo?.username}`
          );
          const isReplyToBot = ctx.message.reply_to_message?.from?.id === botInfo?.id;

          if (!isMentioned && !isReplyToBot) {
            this.logger.debug(
              `Ignored group message from ${chatId} (bot not mentioned or replied to)`
            );
            return;
          }

          return this.botService.handleGroupText(chatId, ctx.message.message_id, text);
        }
        default:
          // channel 等其他類型忽略
          this.logger.debug(`Ignored message from ${chatType} chat ${chatId}`);
      }
    });
  }
}
