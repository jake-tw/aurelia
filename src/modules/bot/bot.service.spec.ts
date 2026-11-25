import { BotService } from './bot.service.js';
import type { TelegramService } from '../../integrations/telegram/telegram.service.js';
import type { Repository } from 'typeorm';
import type { TelegramLog } from '../../infrastructure/database/entities/index.js';

describe('BotService', () => {
  let service: BotService;
  let telegram: { sendMessage: ReturnType<typeof vi.fn> };
  let telegramLogRepo: { save: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    telegram = { sendMessage: vi.fn().mockResolvedValue({ message_id: 999 }) };
    telegramLogRepo = { save: vi.fn().mockResolvedValue({}) };
    service = new BotService(
      telegramLogRepo as unknown as Repository<TelegramLog>,
      telegram as unknown as TelegramService,
    );
  });

  it('handlePrivateText 原文 echo', async () => {
    await service.handlePrivateText(4, 123, 'hello');
    expect(telegram.sendMessage).toHaveBeenCalledWith(4, 'hello');
    expect(telegramLogRepo.save).toHaveBeenCalledWith(expect.objectContaining({
      chatId: 4,
      messageId: 123,
      content: 'hello',
      direction: 'incoming',
      chatType: 'private',
    }));
    expect(telegramLogRepo.save).toHaveBeenCalledWith(expect.objectContaining({
      messageId: 999,
      direction: 'outgoing',
    }));
  });

  it('handleGroupText 原文 echo', async () => {
    await service.handleGroupText(-5, 456, 'hi all');
    expect(telegram.sendMessage).toHaveBeenCalledWith(-5, 'hi all');
    expect(telegramLogRepo.save).toHaveBeenCalledWith(expect.objectContaining({
      chatId: -5,
      messageId: 456,
      content: 'hi all',
      direction: 'incoming',
      chatType: 'group',
    }));
    expect(telegramLogRepo.save).toHaveBeenCalledWith(expect.objectContaining({
      messageId: 999,
      direction: 'outgoing',
    }));
  });
});
