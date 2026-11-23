import { BotService } from './bot.service.js';
import type { TelegramService } from '../../integrations/telegram/telegram.service.js';
import type { DatabaseService } from '../../infrastructure/database/database.service.js';

describe('BotService', () => {
  let service: BotService;
  let telegram: { sendMessage: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    telegram = { sendMessage: vi.fn().mockResolvedValue({}) };
    service = new BotService(
      telegram as unknown as TelegramService,
      {} as DatabaseService,
    );
  });

  it('handleStart 回覆歡迎訊息到指定 chat', async () => {
    await service.handleStart(1, 'jake');
    expect(telegram.sendMessage).toHaveBeenCalledWith(1, expect.stringContaining('歡迎'));
  });

  it('handleStart 可不帶 username', async () => {
    await service.handleStart(1);
    expect(telegram.sendMessage).toHaveBeenCalledTimes(1);
  });

  it('handleHelp 說明 echo 行為', async () => {
    await service.handleHelp(2);
    expect(telegram.sendMessage).toHaveBeenCalledWith(2, expect.stringContaining('echo'));
  });

  it('handleStatus 回覆狀態', async () => {
    await service.handleStatus(3);
    expect(telegram.sendMessage).toHaveBeenCalledWith(3, expect.stringContaining('系統狀態'));
  });

  it('handlePrivateText 原文 echo', async () => {
    await service.handlePrivateText(4, 'hello');
    expect(telegram.sendMessage).toHaveBeenCalledWith(4, 'hello');
  });

  it('handleGroupText 原文 echo', async () => {
    await service.handleGroupText(-5, 'hi all');
    expect(telegram.sendMessage).toHaveBeenCalledWith(-5, 'hi all');
  });
});
