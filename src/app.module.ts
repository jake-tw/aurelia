import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TelegramModule } from './integrations/telegram/telegram.module.js';
import { DatabaseModule } from './infrastructure/database/database.module.js';
import { SchedulerModule } from './infrastructure/scheduler/scheduler.module.js';
import { BotModule } from './modules/bot/bot.module.js';
import { TasksModule } from './modules/tasks/tasks.module.js';
import configuration from './common/config/configuration.js';
import { validationSchema } from './common/config/validation.schema.js';

@Module({
  imports: [
    // 配置模組（全域）
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),

    // 基礎設施
    DatabaseModule,
    SchedulerModule,

    // 外部整合
    TelegramModule,

    // 業務模組
    BotModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
