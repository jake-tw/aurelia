import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { Telegraf } from 'telegraf';

@Injectable()
export class TelegrafLifecycle
  implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(TelegrafLifecycle.name);
  private launched = false;

  constructor(private readonly bot: Telegraf) { }

  async onApplicationBootstrap(): Promise<void> {
    // handler 內的例外只記 log，不讓 polling 中斷
    this.bot.catch((err, ctx) => {
      this.logger.error(
        `Handler error (update ${ctx.update.update_id})`,
        err instanceof Error ? err.stack : String(err),
      );
    });

    // fail fast：token 無效時讓應用程式啟動失敗
    const me = await this.bot.telegram.getMe();
    this.logger.log(`Telegram bot @${me.username} verified`);

    // launch() 會一直 pending 到 bot 停止，所以不 await
    this.launched = true;
    this.bot
      .launch()
      .catch((err: unknown) =>
        this.logger.error(
          'Telegraf polling stopped unexpectedly',
          err instanceof Error ? err.stack : String(err),
        ),
      );
  }

  onApplicationShutdown(signal?: string): void {
    // 未 launch 就呼叫 stop() 會拋 "Bot is not running!"
    if (!this.launched) return;
    this.launched = false;
    this.bot.stop(signal);
    this.logger.log(`Telegraf stopped (${signal ?? 'no signal'})`);
  }
}
