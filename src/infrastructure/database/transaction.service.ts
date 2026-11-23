import { Injectable, Logger } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

/**
 * Transaction 服務
 *
 * 提供跨多個 Entity 的 Transaction 管理
 */
@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(private readonly dataSource: DataSource) {
    this.logger.log('TransactionService initialized');
  }

  /**
   * 執行 Transaction
   *
   * @example
   * ```typescript
   * await this.transactionService.run(async (manager) => {
   *   await manager.save(User, userData);
   *   await manager.save(TelegramLog, logData);
   * });
   * ```
   */
  async run<T>(work: (manager: EntityManager) => Promise<T>): Promise<T> {
    this.logger.debug('Starting transaction');
    return this.dataSource.transaction(work);
  }

  /**
   * 檢查資料庫連線狀態
   */
  async isConnected(): Promise<boolean> {
    return this.dataSource.isInitialized;
  }

  /**
   * 獲取 DataSource 實例（進階使用）
   */
  getDataSource(): DataSource {
    return this.dataSource;
  }
}
