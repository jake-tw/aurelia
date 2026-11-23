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

  beforeEach(() => {
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
    new BotUpdate(bot as unknown as Telegraf, service as unknown as BotService).onModuleInit();
  });

  const textCtx = (chatType: string, text: string, entities?: unknown[]) => ({
    chat: { id: 42, type: chatType },
    message: { text, entities },
  });

  it('/start 傳入 chatId 與 username', () => {
    start({ chat: { id: 1 }, from: { username: 'jake' } });
    expect(service.handleStart).toHaveBeenCalledWith(1, 'jake');
  });

  it('/start 沒有 from 時 username 為 undefined', () => {
    start({ chat: { id: 1 } });
    expect(service.handleStart).toHaveBeenCalledWith(1, undefined);
  });

  it('/help 與 /status 轉給 BotService', () => {
    commands.help({ chat: { id: 2 } });
    commands.status({ chat: { id: 3 } });
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
});
