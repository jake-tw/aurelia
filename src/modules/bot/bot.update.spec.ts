import type { ConfigService } from '@nestjs/config';
import type { Telegraf } from 'telegraf';
import { BotUpdate } from './bot.update.js';
import type { BotService } from './bot.service.js';
import type { BotCommand } from './bot.command.js';

type Handler = (ctx: unknown) => unknown;

describe('BotUpdate', () => {
  let start: Handler;
  let commands: Record<string, Handler>;
  let onText: Handler;
  let service: {
    handlePrivateText: ReturnType<typeof vi.fn>;
    handleGroupText: ReturnType<typeof vi.fn>;
  };
  let command: {
    handleStart: ReturnType<typeof vi.fn>;
    handleHelp: ReturnType<typeof vi.fn>;
    handleStatus: ReturnType<typeof vi.fn>;
  };

  const createBotUpdate = (
    whitelistPrivate: number[] = [],
    whitelistGroup: number[] = [],
    whitelistGroupMember: number[] = [],
  ) => {
    commands = {};
    const bot = {
      start: vi.fn((h: Handler) => (start = h)),
      command: vi.fn((name: string, h: Handler) => (commands[name] = h)),
      on: vi.fn((_filter: unknown, h: Handler) => (onText = h)),
      botInfo: { id: 999, username: 'test_bot' },
    };
    service = {
      handlePrivateText: vi.fn(),
      handleGroupText: vi.fn(),
    };
    command = {
      handleStart: vi.fn(),
      handleHelp: vi.fn(),
      handleStatus: vi.fn(),
    };
    const config = {
      get: vi.fn((key: string, defaultValue?: unknown) => {
        if (key === 'telegram.whitelistPrivate') return whitelistPrivate;
        if (key === 'telegram.whitelistGroup') return whitelistGroup;
        if (key === 'telegram.whitelistGroupMember') return whitelistGroupMember;
        return defaultValue;
      }),
    };
    new BotUpdate(
      bot as unknown as Telegraf,
      service as unknown as BotService,
      command as unknown as BotCommand,
      config as unknown as ConfigService,
    ).onModuleInit();
  };

  beforeEach(() => {
    createBotUpdate();
  });

  const textCtx = (chatType: string, text: string, entities?: unknown[], userId?: number) => ({
    chat: { id: 42, type: chatType },
    message: { text, entities },
    from: userId !== undefined ? { id: userId } : undefined,
  });

  // 建立群組訊息 context，預設包含 mention bot
  const groupTextCtx = (text: string, userId?: number, hasMention = true) => {
    const entities = hasMention ? [{ type: 'mention', offset: 0, length: 9 }] : undefined;
    return {
      chat: { id: 42, type: 'group' },
      message: {
        text: hasMention ? '@test_bot ' + text : text,
        entities,
        reply_to_message: undefined,
      },
      from: userId !== undefined ? { id: userId } : undefined,
    };
  };

  it('/start 傳入 chatId 與 username', () => {
    start({ chat: { id: 1, type: 'private' }, from: { id: 123, username: 'jake' } });
    expect(command.handleStart).toHaveBeenCalledWith(1, 'jake');
  });

  it('/start 沒有 from 時 username 為 undefined', () => {
    start({ chat: { id: 1, type: 'private' } });
    expect(command.handleStart).toHaveBeenCalledWith(1, undefined);
  });

  it('/help 與 /status 轉給 BotCommand', () => {
    commands.help({ chat: { id: 2, type: 'private' }, from: { id: 123 } });
    commands.status({ chat: { id: 3, type: 'private' }, from: { id: 123 } });
    expect(command.handleHelp).toHaveBeenCalledWith(2);
    expect(command.handleStatus).toHaveBeenCalledWith(3);
  });

  it('私聊文字走 handlePrivateText', () => {
    onText(textCtx('private', 'hello'));
    expect(service.handlePrivateText).toHaveBeenCalledWith(42, 'hello');
    expect(service.handleGroupText).not.toHaveBeenCalled();
  });

  it.each(['group', 'supergroup'])('%s 文字在 mention bot 時走 handleGroupText', (type) => {
    onText({
      chat: { id: 42, type },
      message: {
        text: '@test_bot hello',
        entities: [{ type: 'mention', offset: 0, length: 9 }],
      },
      from: { id: 123 },
    });
    expect(service.handleGroupText).toHaveBeenCalledWith(42, '@test_bot hello');
    expect(service.handlePrivateText).not.toHaveBeenCalled();
  });

  it('channel 訊息被忽略', () => {
    onText(textCtx('channel', 'hello'));
    expect(service.handlePrivateText).not.toHaveBeenCalled();
    expect(service.handleGroupText).not.toHaveBeenCalled();
  });

  it('未知指令不 echo', () => {
    onText(textCtx('private', '/foo', [{ type: 'bot_command', offset: 0, length: 4 }]));
    expect(service.handlePrivateText).not.toHaveBeenCalled();
  });

  it('句中出現指令字樣的一般文字仍 echo', () => {
    onText(textCtx('private', 'try /foo', [{ type: 'bot_command', offset: 4, length: 4 }]));
    expect(service.handlePrivateText).toHaveBeenCalledWith(42, 'try /foo');
  });

  describe('白名單功能', () => {
    it('白名單為空時允許所有私聊', () => {
      createBotUpdate([], []);
      start({ chat: { id: 999, type: 'private' }, from: { id: 999, username: 'anyone' } });
      expect(command.handleStart).toHaveBeenCalledWith(999, 'anyone');
    });

    it('白名單為空時允許所有群組', () => {
      createBotUpdate([], []);
      onText(groupTextCtx('hello', 123));
      expect(service.handleGroupText).toHaveBeenCalledWith(42, '@test_bot hello');
    });

    it('私聊白名單：允許列表中的用戶', () => {
      createBotUpdate([123, 456], []);
      start({ chat: { id: 123, type: 'private' }, from: { id: 123, username: 'alice' } });
      expect(command.handleStart).toHaveBeenCalledWith(123, 'alice');
    });

    it('私聊白名單：拒絕不在列表中的用戶', () => {
      createBotUpdate([123, 456], []);
      start({ chat: { id: 999, type: 'private' }, from: { id: 999, username: 'bob' } });
      expect(command.handleStart).not.toHaveBeenCalled();
    });

    it('群組白名單：允許列表中的群組', () => {
      createBotUpdate([], [-1001234567890]);
      onText({
        chat: { id: -1001234567890, type: 'group' },
        message: {
          text: '@test_bot hello',
          entities: [{ type: 'mention', offset: 0, length: 9 }],
        },
        from: { id: 123 },
      });
      expect(service.handleGroupText).toHaveBeenCalledWith(-1001234567890, '@test_bot hello');
    });

    it('群組白名單：拒絕不在列表中的群組', () => {
      createBotUpdate([], [-1001234567890]);
      onText({
        chat: { id: -999, type: 'group' },
        message: {
          text: '@test_bot hello',
          entities: [{ type: 'mention', offset: 0, length: 9 }],
        },
        from: { id: 123 },
      });
      expect(service.handleGroupText).not.toHaveBeenCalled();
    });

    it('私聊和群組白名單獨立運作', () => {
      createBotUpdate([123], [-1001234567890]);

      // 私聊：允許 123
      start({ chat: { id: 123, type: 'private' }, from: { id: 123 } });
      expect(command.handleStart).toHaveBeenCalledWith(123, undefined);

      // 私聊：拒絕 999
      command.handleStart.mockClear();
      start({ chat: { id: 999, type: 'private' }, from: { id: 999 } });
      expect(command.handleStart).not.toHaveBeenCalled();

      // 群組：允許 -1001234567890
      onText({
        chat: { id: -1001234567890, type: 'group' },
        message: {
          text: '@test_bot hi',
          entities: [{ type: 'mention', offset: 0, length: 9 }],
        },
        from: { id: 123 },
      });
      expect(service.handleGroupText).toHaveBeenCalledWith(-1001234567890, '@test_bot hi');

      // 群組：拒絕 -999
      service.handleGroupText.mockClear();
      onText({
        chat: { id: -999, type: 'group' },
        message: {
          text: '@test_bot hi',
          entities: [{ type: 'mention', offset: 0, length: 9 }],
        },
        from: { id: 123 },
      });
      expect(service.handleGroupText).not.toHaveBeenCalled();
    });

    it('白名單檢查適用於所有指令', () => {
      createBotUpdate([100], []);

      // 允許的用戶
      commands.help({ chat: { id: 100, type: 'private' }, from: { id: 100 } });
      expect(command.handleHelp).toHaveBeenCalledWith(100);

      // 拒絕的用戶
      command.handleHelp.mockClear();
      commands.help({ chat: { id: 200, type: 'private' }, from: { id: 200 } });
      expect(command.handleHelp).not.toHaveBeenCalled();

      commands.status({ chat: { id: 200, type: 'private' }, from: { id: 200 } });
      expect(command.handleStatus).not.toHaveBeenCalled();
    });

    it('supergroup 也使用群組白名單', () => {
      createBotUpdate([], [-1001234567890]);
      onText({
        chat: { id: -1001234567890, type: 'supergroup' },
        message: {
          text: '@test_bot test',
          entities: [{ type: 'mention', offset: 0, length: 9 }],
        },
        from: { id: 123 },
      });
      expect(service.handleGroupText).toHaveBeenCalledWith(-1001234567890, '@test_bot test');
    });
  });

  describe('群組成員白名單功能', () => {
    it('成員白名單為空時允許群組內所有成員', () => {
      createBotUpdate([], [-100], []);
      onText({
        chat: { id: -100, type: 'group' },
        message: {
          text: '@test_bot hello',
          entities: [{ type: 'mention', offset: 0, length: 9 }],
        },
        from: { id: 999 }
      });
      expect(service.handleGroupText).toHaveBeenCalledWith(-100, '@test_bot hello');
    });

    it('成員白名單有值時僅允許列表中的成員', () => {
      createBotUpdate([], [-100], [111, 222]);

      // 允許的成員
      onText({
        chat: { id: -100, type: 'group' },
        message: {
          text: '@test_bot hello',
          entities: [{ type: 'mention', offset: 0, length: 9 }],
        },
        from: { id: 111 }
      });
      expect(service.handleGroupText).toHaveBeenCalledWith(-100, '@test_bot hello');

      // 拒絕的成員
      service.handleGroupText.mockClear();
      onText({
        chat: { id: -100, type: 'group' },
        message: {
          text: '@test_bot hello',
          entities: [{ type: 'mention', offset: 0, length: 9 }],
        },
        from: { id: 999 }
      });
      expect(service.handleGroupText).not.toHaveBeenCalled();
    });

    it('群組不在白名單時，不檢查成員白名單', () => {
      createBotUpdate([], [-100], [111]);

      // 群組 -200 不在白名單中，即使成員 111 在成員白名單中也拒絕
      onText({
        chat: { id: -200, type: 'group' },
        message: {
          text: '@test_bot hello',
          entities: [{ type: 'mention', offset: 0, length: 9 }],
        },
        from: { id: 111 }
      });
      expect(service.handleGroupText).not.toHaveBeenCalled();
    });

    it('群組白名單為空但成員白名單有值時，允許所有群組但只允許特定成員', () => {
      createBotUpdate([], [], [111]);

      // 成員 111 在白名單中，允許
      onText({
        chat: { id: -999, type: 'group' },
        message: {
          text: '@test_bot hello',
          entities: [{ type: 'mention', offset: 0, length: 9 }],
        },
        from: { id: 111 }
      });
      expect(service.handleGroupText).toHaveBeenCalledWith(-999, '@test_bot hello');

      // 成員 999 不在白名單中，拒絕
      service.handleGroupText.mockClear();
      onText({
        chat: { id: -999, type: 'group' },
        message: {
          text: '@test_bot hello',
          entities: [{ type: 'mention', offset: 0, length: 9 }],
        },
        from: { id: 999 }
      });
      expect(service.handleGroupText).not.toHaveBeenCalled();

      // 不同群組，但成員 111 仍然允許
      service.handleGroupText.mockClear();
      onText({
        chat: { id: -888, type: 'group' },
        message: {
          text: '@test_bot hi',
          entities: [{ type: 'mention', offset: 0, length: 9 }],
        },
        from: { id: 111 }
      });
      expect(service.handleGroupText).toHaveBeenCalledWith(-888, '@test_bot hi');
    });

    it('群組和成員都設定白名單時，兩者都需要匹配', () => {
      createBotUpdate([], [-100, -200], [111, 222]);

      // 群組 -100 + 成員 111：允許
      onText({
        chat: { id: -100, type: 'group' },
        message: {
          text: '@test_bot msg1',
          entities: [{ type: 'mention', offset: 0, length: 9 }],
        },
        from: { id: 111 }
      });
      expect(service.handleGroupText).toHaveBeenCalledWith(-100, '@test_bot msg1');

      // 群組 -100 + 成員 999：拒絕
      service.handleGroupText.mockClear();
      onText({
        chat: { id: -100, type: 'group' },
        message: {
          text: '@test_bot msg2',
          entities: [{ type: 'mention', offset: 0, length: 9 }],
        },
        from: { id: 999 }
      });
      expect(service.handleGroupText).not.toHaveBeenCalled();

      // 群組 -300 + 成員 111：拒絕（群組不在白名單）
      onText({
        chat: { id: -300, type: 'group' },
        message: {
          text: '@test_bot msg3',
          entities: [{ type: 'mention', offset: 0, length: 9 }],
        },
        from: { id: 111 }
      });
      expect(service.handleGroupText).not.toHaveBeenCalled();
    });

    it('沒有 userId 時拒絕（群組成員白名單啟用時）', () => {
      createBotUpdate([], [-100], [111]);

      onText({
        chat: { id: -100, type: 'group' },
        message: {
          text: '@test_bot hello',
          entities: [{ type: 'mention', offset: 0, length: 9 }],
        }
        // 沒有 from 欄位
      });
      expect(service.handleGroupText).not.toHaveBeenCalled();
    });
  });
});
