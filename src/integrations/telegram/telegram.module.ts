import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service.js';
import { TelegrafModule } from '../../infrastructure/telegraf/telegraf.module.js';

@Module({
  imports: [TelegrafModule],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
