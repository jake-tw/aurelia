import type { Telegraf } from 'telegraf';
import { TelegramService } from './telegram.service.js';

describe('TelegramService', () => {
  let service: TelegramService;
  let telegram: {
    sendMessage: ReturnType<typeof vi.fn>;
    sendPhoto: ReturnType<typeof vi.fn>;
    editMessageText: ReturnType<typeof vi.fn>;
    getMe: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    telegram = {
      sendMessage: vi.fn().mockResolvedValue({ message_id: 10 }),
      sendPhoto: vi.fn().mockResolvedValue({ message_id: 11 }),
      editMessageText: vi.fn().mockResolvedValue(true),
      getMe: vi.fn().mockResolvedValue({ username: 'real_bot' }),
    };
    service = new TelegramService({ telegram } as unknown as Telegraf);
  });

  it('sendMessage 回傳 Message，呼叫端可取得 message_id', async () => {
    const result = await service.sendMessage(1, 'hi');
    expect(telegram.sendMessage).toHaveBeenCalledWith(1, 'hi');
    expect(result.message_id).toBe(10);
  });

  it('sendPhoto 回傳 Message', async () => {
    const result = await service.sendPhoto(1, 'https://example.com/a.png');
    expect(telegram.sendPhoto).toHaveBeenCalledWith(1, 'https://example.com/a.png');
    expect(result.message_id).toBe(11);
  });

  it('editMessageText 以 chatId 與 messageId 編輯，回傳 void', async () => {
    const result = await service.editMessageText(1, 10, 'new');
    expect(telegram.editMessageText).toHaveBeenCalledWith(1, 10, undefined, 'new');
    expect(result).toBeUndefined();
  });

  it('sendMarkdown 使用 MarkdownV2', async () => {
    await service.sendMarkdown(1, '*bold*');
    expect(telegram.sendMessage).toHaveBeenCalledWith(1, '*bold*', {
      parse_mode: 'MarkdownV2',
    });
  });

  it('getBotInfo 回傳 getMe 的結果', async () => {
    await expect(service.getBotInfo()).resolves.toEqual({ username: 'real_bot' });
  });
});
