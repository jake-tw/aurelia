import type { Telegraf } from 'telegraf';
import { TelegrafLifecycle } from './telegraf.lifecycle.js';

describe('TelegrafLifecycle', () => {
  let bot: {
    catch: ReturnType<typeof vi.fn>;
    launch: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
    telegram: { getMe: ReturnType<typeof vi.fn> };
  };
  let lifecycle: TelegrafLifecycle;

  beforeEach(() => {
    bot = {
      catch: vi.fn(),
      launch: vi.fn().mockReturnValue(new Promise(() => {})), // 與真實 launch 一樣一直 pending
      stop: vi.fn(),
      telegram: { getMe: vi.fn().mockResolvedValue({ username: 'real_bot' }) },
    };
    lifecycle = new TelegrafLifecycle(bot as unknown as Telegraf);
  });

  it('getMe 成功後才 launch，且不等待 launch 結束', async () => {
    await lifecycle.onApplicationBootstrap();
    expect(bot.telegram.getMe).toHaveBeenCalled();
    expect(bot.launch).toHaveBeenCalledTimes(1);
    expect(bot.catch).toHaveBeenCalledTimes(1);
  });

  it('getMe 失敗時啟動失敗且不 launch', async () => {
    bot.telegram.getMe.mockRejectedValue(new Error('401 Unauthorized'));
    await expect(lifecycle.onApplicationBootstrap()).rejects.toThrow('401');
    expect(bot.launch).not.toHaveBeenCalled();
  });

  it('launch 的 rejection 被攔截，不會變成 unhandled rejection', async () => {
    bot.launch.mockRejectedValue(new Error('polling died'));
    await expect(lifecycle.onApplicationBootstrap()).resolves.toBeUndefined();
    await new Promise((r) => setImmediate(r));
  });

  it('shutdown 時以 signal 呼叫 stop', async () => {
    await lifecycle.onApplicationBootstrap();
    lifecycle.onApplicationShutdown('SIGTERM');
    expect(bot.stop).toHaveBeenCalledWith('SIGTERM');
  });

  it('未 launch 就 shutdown 不呼叫 stop', () => {
    lifecycle.onApplicationShutdown('SIGTERM');
    expect(bot.stop).not.toHaveBeenCalled();
  });

  it('bot.catch 的 handler 不會再拋出例外', async () => {
    await lifecycle.onApplicationBootstrap();
    const handler = bot.catch.mock.calls[0][0];
    expect(() => handler(new Error('boom'), { update: { update_id: 1 } })).not.toThrow();
  });
});
