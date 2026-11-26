import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service.js';

/**
 * Scheduler 模組 - 基礎設施層
 *
 * 提供定時任務的基礎能力，封裝 @nestjs/schedule 套件
 * 不包含業務邏輯，完全可複用到其他專案
 */
@Module({
  imports: [
    // 啟用 NestJS 定時任務功能
    ScheduleModule.forRoot(),
  ],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
