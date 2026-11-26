import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

/**
 * 動態任務配置
 */
export interface DynamicJobConfig {
  /** 任務名稱（唯一識別碼） */
  name: string;
  /** Cron 表達式（例如：'0 2 * * *' 表示每天凌晨 2:00） */
  cronExpression: string;
  /** 要執行的函數 */
  callback: () => void | Promise<void>;
  /** 時區（預設：'Asia/Taipei'） */
  timeZone?: string;
}

/**
 * Scheduler Service - 基礎設施層
 *
 * 提供動態管理定時任務的 API
 * - 新增/移除 Cron 任務
 * - 暫停/恢復任務
 * - 列出所有任務
 * - 新增 Timeout/Interval 任務
 */
@Injectable()
export class SchedulerService {
  constructor(private readonly schedulerRegistry: SchedulerRegistry) {}

  /**
   * 動態新增 Cron 任務
   *
   * @example
   * ```typescript
   * schedulerService.addCronJob({
   *   name: 'cleanup-logs',
   *   cronExpression: '0 2 * * *',
   *   callback: async () => {
   *     await this.cleanupOldLogs();
   *   },
   *   timeZone: 'Asia/Taipei',
   * });
   * ```
   */
  addCronJob(config: DynamicJobConfig): void {
    const job = new CronJob(
      config.cronExpression,
      config.callback,
      null, // onComplete
      true, // start
      config.timeZone || 'Asia/Taipei',
    );

    this.schedulerRegistry.addCronJob(config.name, job);
    job.start();

    console.log(
      `[Scheduler] 已註冊任務: ${config.name} (${config.cronExpression})`,
    );
  }

  /**
   * 移除 Cron 任務
   *
   * @param name 任務名稱
   */
  removeCronJob(name: string): void {
    try {
      this.schedulerRegistry.deleteCronJob(name);
      console.log(`[Scheduler] 已移除任務: ${name}`);
    } catch (error) {
      console.warn(`[Scheduler] 移除任務失敗: ${name}`, error);
    }
  }

  /**
   * 暫停任務（不刪除，可恢復）
   *
   * @param name 任務名稱
   */
  pauseCronJob(name: string): void {
    try {
      const job = this.schedulerRegistry.getCronJob(name);
      void job.stop();
      console.log(`[Scheduler] 已暫停任務: ${name}`);
    } catch (error) {
      console.warn(`[Scheduler] 暫停任務失敗: ${name}`, error);
    }
  }

  /**
   * 恢復任務
   *
   * @param name 任務名稱
   */
  resumeCronJob(name: string): void {
    try {
      const job = this.schedulerRegistry.getCronJob(name);
      job.start();
      console.log(`[Scheduler] 已恢復任務: ${name}`);
    } catch (error) {
      console.warn(`[Scheduler] 恢復任務失敗: ${name}`, error);
    }
  }

  /**
   * 列出所有註冊的 Cron 任務名稱
   *
   * @returns 任務名稱陣列
   */
  listAllJobs(): string[] {
    const jobs = this.schedulerRegistry.getCronJobs();
    return Array.from(jobs.keys());
  }

  /**
   * 檢查任務是否存在
   *
   * @param name 任務名稱
   * @returns 是否存在
   */
  hasJob(name: string): boolean {
    try {
      this.schedulerRegistry.getCronJob(name);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 新增一次性延遲任務（Timeout）
   *
   * @param name 任務名稱
   * @param milliseconds 延遲毫秒數
   * @param callback 要執行的函數
   *
   * @example
   * ```typescript
   * // 10 秒後執行一次
   * schedulerService.addTimeout('send-notification', 10000, () => {
   *   this.sendNotification();
   * });
   * ```
   */
  addTimeout(name: string, milliseconds: number, callback: () => void): void {
    const timeout = setTimeout(callback, milliseconds);
    this.schedulerRegistry.addTimeout(name, timeout);
    console.log(`[Scheduler] 已註冊 Timeout: ${name} (${milliseconds}ms)`);
  }

  /**
   * 移除 Timeout
   *
   * @param name 任務名稱
   */
  removeTimeout(name: string): void {
    try {
      this.schedulerRegistry.deleteTimeout(name);
      console.log(`[Scheduler] 已移除 Timeout: ${name}`);
    } catch (error) {
      console.warn(`[Scheduler] 移除 Timeout 失敗: ${name}`, error);
    }
  }

  /**
   * 新增重複執行任務（Interval）
   *
   * @param name 任務名稱
   * @param milliseconds 間隔毫秒數
   * @param callback 要執行的函數
   *
   * @example
   * ```typescript
   * // 每 5 秒執行一次
   * schedulerService.addInterval('health-check', 5000, () => {
   *   this.checkHealth();
   * });
   * ```
   */
  addInterval(name: string, milliseconds: number, callback: () => void): void {
    const interval = setInterval(callback, milliseconds);
    this.schedulerRegistry.addInterval(name, interval);
    console.log(`[Scheduler] 已註冊 Interval: ${name} (${milliseconds}ms)`);
  }

  /**
   * 移除 Interval
   *
   * @param name 任務名稱
   */
  removeInterval(name: string): void {
    try {
      this.schedulerRegistry.deleteInterval(name);
      console.log(`[Scheduler] 已移除 Interval: ${name}`);
    } catch (error) {
      console.warn(`[Scheduler] 移除 Interval 失敗: ${name}`, error);
    }
  }
}
