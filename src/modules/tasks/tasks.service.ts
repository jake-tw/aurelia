import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

// 固定任務 Jobs
import { FetchRemoteLogJob } from './jobs/index.js';

/**
 * Tasks Service
 *
 * 職責：
 * 1. 定時執行任務（使用 @Cron 裝飾器）
 * 2. Try-catch 錯誤處理
 * 3. 記錄開始/結束日誌與執行時間
 */
@Injectable()
export class TasksService implements OnModuleInit {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly fetchRemoteLogJob: FetchRemoteLogJob,
  ) { }

  onModuleInit() {
    void this.scheduledFetchRemoteLog();
  }

  @Cron('*/10 * * * *', { name: 'fetch-remote-log', timeZone: 'Asia/Taipei', })
  async scheduledFetchRemoteLog() {
    await this.runJob('fetch-remote-log', () => this.fetchRemoteLogJob.execute());
  }

  private async runJob(jobName: string, task: () => Promise<void>) {
    const startTime = Date.now();
    try {
      this.logger.log(`Starting job: ${jobName}`);
      await task();
      const duration = Date.now() - startTime;
      this.logger.log(`Job completed: ${jobName} (took ${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`Job failed: ${jobName} (took ${duration}ms)`, error);
    }
  }
}
