import type { ConfigService } from '@nestjs/config';
import type { Telegraf } from 'telegraf';
import { BotUpdate } from './bot.update.js';
import type { BotService } from './bot.service.js';

type Handler = (ctx: unknown) => unknown;

describe('BotUpdate', () => {
  let start: Handler;
  let commands: Record<string, Handler>;
  let onText: Handler;
  let service: {
    handleStart: ReturnType<typeof vi.fn>;
    handleHelp: ReturnType<typeof vi.fn>;
    handleStatus: ReturnType<typeof vi.fn>;
    handlePrivateText: ReturnType<typeof vi.fn>;
    handleGroupText: ReturnType<typeof vi.fn>;
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
    };
    service = {
      handleStart: vi.fn(),
      handleHelp: vi.fn(),
      handleStatus: vi.fn(),
      handlePrivateText: vi.fn(),
      handleGroupText: vi.fn(),
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

  it('/start 傳入 chatId 與 username', () => {
    start({ chat: { id: 1, type: 'private' }, from: { username: 'jake' } });
    expect(service.handleStart).toHaveBeenCalledWith(1, 'jake');
  });

  it('/start 沒有 from 時 username 為 undefined', () => {
    start({ chat: { id: 1, type: 'private' } });
    expect(service.handleStart).toHaveBeenCalledWith(1, undefined);
  });

  it('/help 與 /status 轉給 BotService', () => {
    commands.help({ chat: { id: 2, type: 'private' } });
    commands.status({ chat: { id: 3, type: 'private' } });
    expect(service.handleHelp).toHaveBeenCalledWith(2);
    expect(service.handleStatus).toHaveBeenCalledWith(3);
  });

  it('私聊文字走 handlePrivateText', () => {
    onText(textCtx('private', 'hello'));
    expect(service.handlePrivateText).toHaveBeenCalledWith(42, 'hello');
    expect(service.handleGroupText).not.toHaveBeenCalled();
  });

  it.each(['group', 'supergroup'])('%s 文字走 handleGroupText', (type) => {
    onText(textCtx(type, 'hello'));
    expect(service.handleGroupText).toHaveBeenCalledWith(42, 'hello');
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
      start({ chat: { id: 999, type: 'private' }, from: { username: 'anyone' } });
      expect(service.handleStart).toHaveBeenCalledWith(999, 'anyone');
    });

    it('白名單為空時允許所有群組', () => {
      createBotUpdate([], []);
      onText(textCtx('group', 'hello'));
      expect(service.handleGroupText).toHaveBeenCalledWith(42, 'hello');
    });

    it('私聊白名單：允許列表中的用戶', () => {
      createBotUpdate([123, 456], []);
      start({ chat: { id: 123, type: 'private' }, from: { username: 'alice' } });
      expect(service.handleStart).toHaveBeenCalledWith(123, 'alice');
    });

    it('私聊白名單：拒絕不在列表中的用戶', () => {
      createBotUpdate([123, 456], []);
      start({ chat: { id: 999, type: 'private' }, from: { username: 'bob' } });
      expect(service.handleStart).not.toHaveBeenCalled();
    });

    it('群組白名單：允許列表中的群組', () => {
      createBotUpdate([], [-1001234567890]);
      onText({ chat: { id: -1001234567890, type: 'group' }, message: { text: 'hello' } });
      expect(service.handleGroupText).toHaveBeenCalledWith(-1001234567890, 'hello');
    });

    it('群組白名單：拒絕不在列表中的群組', () => {
      createBotUpdate([], [-1001234567890]);
      onText({ chat: { id: -999, type: 'group' }, message: { text: 'hello' } });
      expect(service.handleGroupText).not.toHaveBeenCalled();
    });

    it('私聊和群組白名單獨立運作', () => {
      createBotUpdate([123], [-1001234567890]);

      // 私聊：允許 123
      start({ chat: { id: 123, type: 'private' } });
      expect(service.handleStart).toHaveBeenCalledWith(123, undefined);

      // 私聊：拒絕 999
      service.handleStart.mockClear();
      start({ chat: { id: 999, type: 'private' } });
      expect(service.handleStart).not.toHaveBeenCalled();

      // 群組：允許 -1001234567890
      onText({ chat: { id: -1001234567890, type: 'group' }, message: { text: 'hi' } });
      expect(service.handleGroupText).toHaveBeenCalledWith(-1001234567890, 'hi');

      // 群組：拒絕 -999
      service.handleGroupText.mockClear();
      onText({ chat: { id: -999, type: 'group' }, message: { text: 'hi' } });
      expect(service.handleGroupText).not.toHaveBeenCalled();
    });

    it('白名單檢查適用於所有指令', () => {
      createBotUpdate([100], []);

      // 允許的用戶
      commands.help({ chat: { id: 100, type: 'private' } });
      expect(service.handleHelp).toHaveBeenCalledWith(100);

      // 拒絕的用戶
      service.handleHelp.mockClear();
      commands.help({ chat: { id: 200, type: 'private' } });
      expect(service.handleHelp).not.toHaveBeenCalled();

      commands.status({ chat: { id: 200, type: 'private' } });
      expect(service.handleStatus).not.toHaveBeenCalled();
    });

    it('supergroup 也使用群組白名單', () => {
      createBotUpdate([], [-1001234567890]);
      onText({ chat: { id: -1001234567890, type: 'supergroup' }, message: { text: 'test' } });
      expect(service.handleGroupText).toHaveBeenCalledWith(-1001234567890, 'test');
    });
  });

  describe('群組成員白名單功能', () => {
    it('成員白名單為空時允許群組內所有成員', () => {
      createBotUpdate([], [-100], []);
      onText({
        chat: { id: -100, type: 'group' },
        message: { text: 'hello' },
        from: { id: 999 }
      });
      expect(service.handleGroupText).toHaveBeenCalledWith(-100, 'hello');
    });

    it('成員白名單有值時僅允許列表中的成員', () => {
      createBotUpdate([], [-100], [111, 222]);

      // 允許的成員
      onText({
        chat: { id: -100, type: 'group' },
        message: { text: 'hello' },
        from: { id: 111 }
      });
      expect(service.handleGroupText).toHaveBeenCalledWith(-100, 'hello');

      // 拒絕的成員
      service.handleGroupText.mockClear();
      onText({
        chat: { id: -100, type: 'group' },
        message: { text: 'hello' },
        from: { id: 999 }
      });
      expect(service.handleGroupText).not.toHaveBeenCalled();
    });

    it('群組不在白名單時，不檢查成員白名單', () => {
      createBotUpdate([], [-100], [111]);

      // 群組 -200 不在白名單中，即使成員 111 在成員白名單中也拒絕
      onText({
        chat: { id: -200, type: 'group' },
        message: { text: 'hello' },
        from: { id: 111 }
      });
      expect(service.handleGroupText).not.toHaveBeenCalled();
    });

    it('群組白名單為空但成員白名單有值時，允許所有群組但只允許特定成員', () => {
      createBotUpdate([], [], [111]);

      // 成員 111 在白名單中，允許
      onText({
        chat: { id: -999, type: 'group' },
        message: { text: 'hello' },
        from: { id: 111 }
      });
      expect(service.handleGroupText).toHaveBeenCalledWith(-999, 'hello');

      // 成員 999 不在白名單中，拒絕
      service.handleGroupText.mockClear();
      onText({
        chat: { id: -999, type: 'group' },
        message: { text: 'hello' },
        from: { id: 999 }
      });
      expect(service.handleGroupText).not.toHaveBeenCalled();

      // 不同群組，但成員 111 仍然允許
      service.handleGroupText.mockClear();
      onText({
        chat: { id: -888, type: 'group' },
        message: { text: 'hi' },
        from: { id: 111 }
      });
      expect(service.handleGroupText).toHaveBeenCalledWith(-888, 'hi');
    });

    it('群組和成員都設定白名單時，兩者都需要匹配', () => {
      createBotUpdate([], [-100, -200], [111, 222]);

      // 群組 -100 + 成員 111：允許
      onText({
        chat: { id: -100, type: 'group' },
        message: { text: 'msg1' },
        from: { id: 111 }
      });
      expect(service.handleGroupText).toHaveBeenCalledWith(-100, 'msg1');

      // 群組 -100 + 成員 999：拒絕
      service.handleGroupText.mockClear();
      onText({
        chat: { id: -100, type: 'group' },
        message: { text: 'msg2' },
        from: { id: 999 }
      });
      expect(service.handleGroupText).not.toHaveBeenCalled();

      // 群組 -300 + 成員 111：拒絕（群組不在白名單）
      onText({
        chat: { id: -300, type: 'group' },
        message: { text: 'msg3' },
        from: { id: 111 }
      });
      expect(service.handleGroupText).not.toHaveBeenCalled();
    });

    it('沒有 userId 時拒絕（群組成員白名單啟用時）', () => {
      createBotUpdate([], [-100], [111]);

      onText({
        chat: { id: -100, type: 'group' },
        message: { text: 'hello' }
        // 沒有 from 欄位
      });
      expect(service.handleGroupText).not.toHaveBeenCalled();
    });
  });
});
