import { BotCommand } from './bot.command.js';
import type { TelegramService } from '../../integrations/telegram/telegram.service.js';
import type { Repository } from 'typeorm';
import type { TelegramLog } from '../../infrastructure/database/entities/index.js';

describe('BotCommand', () => {
  let command: BotCommand;
  let telegram: { sendMessage: ReturnType<typeof vi.fn> };
  let telegramLogRepo: { save: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    telegram = { sendMessage: vi.fn().mockResolvedValue({}) };
    telegramLogRepo = { save: vi.fn().mockResolvedValue({}) };
    command = new BotCommand(
      telegramLogRepo as unknown as Repository<TelegramLog>,
      telegram as unknown as TelegramService,
    );
  });

  it('handleStart 回覆歡迎訊息到指定 chat', async () => {
    await command.handleStart(1, 'jake');
    expect(telegram.sendMessage).toHaveBeenCalledWith(1, expect.stringContaining('歡迎'));
    expect(telegramLogRepo.save).toHaveBeenCalledWith(expect.objectContaining({
      chatId: 1,
      content: '/start',
      direction: 'incoming',
      username: 'jake',
    }));
    expect(telegramLogRepo.save).toHaveBeenCalledWith(expect.objectContaining({
      direction: 'outgoing',
    }));
  });

  it('handleStart 可不帶 username', async () => {
    await command.handleStart(1);
    expect(telegram.sendMessage).toHaveBeenCalledTimes(1);
    expect(telegramLogRepo.save).toHaveBeenCalledWith(expect.objectContaining({
      chatId: 1,
      content: '/start',
      direction: 'incoming',
    }));
  });

  it('handleHelp 顯示使用說明', async () => {
    await command.handleHelp(2);
    expect(telegram.sendMessage).toHaveBeenCalledWith(2, expect.stringContaining('使用說明'));
    expect(telegramLogRepo.save).toHaveBeenCalled();
  });

  it('handleStatus 回覆狀態', async () => {
    await command.handleStatus(3);
    expect(telegram.sendMessage).toHaveBeenCalledWith(3, expect.stringContaining('系統狀態'));
    expect(telegramLogRepo.save).toHaveBeenCalled();
  });
});
