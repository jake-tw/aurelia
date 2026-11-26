import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service.js';
import { SchedulerModule } from '../../infrastructure/scheduler/scheduler.module.js';
import { DatabaseModule } from '../../infrastructure/database/database.module.js';
import { ShellModule } from '../../integrations/shell/shell.module.js';
import { FetchRemoteLogJob } from './jobs/index.js';

/**
 * Tasks 模組 - 業務邏輯層
 *
 * 定義固定的定時任務
 */
@Module({
  imports: [
    SchedulerModule,  // 依賴基礎設施層的 Scheduler
    DatabaseModule,   // 依賴資料庫
    ShellModule,      // 依賴 Shell 腳本執行服務
  ],
  providers: [
    TasksService,
    FetchRemoteLogJob,
  ],
})
export class TasksModule { }
