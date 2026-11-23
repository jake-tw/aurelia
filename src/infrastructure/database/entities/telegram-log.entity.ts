import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

/**
 * Telegram 訊息日誌 Entity
 *
 * 記錄所有與 Telegram Bot 互動的訊息，包含：
 * - 用戶發送的訊息（incoming）
 * - Bot 回覆的訊息（outgoing）
 */
@Entity('telegram_logs')
@Index(['chatId', 'createdAt']) // 優化按聊天室和時間查詢
@Index(['direction', 'createdAt']) // 優化按方向和時間查詢
export class TelegramLog {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  /**
   * Telegram Chat ID
   */
  @Column({ type: 'bigint' })
  @Index()
  chatId: number;

  /**
   * Telegram Message ID（可選）
   */
  @Column({ type: 'bigint', nullable: true })
  messageId?: number;

  /**
   * 訊息方向
   * - incoming: 用戶發送給 Bot
   * - outgoing: Bot 發送給用戶
   */
  @Column({ type: 'enum', enum: ['incoming', 'outgoing'] })
  direction: 'incoming' | 'outgoing';

  /**
   * 訊息內容
   */
  @Column({ type: 'text' })
  content: string;

  /**
   * 用戶名稱（可選）
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  username?: string;

  /**
   * 聊天類型
   * - private: 私聊
   * - group: 群組
   * - supergroup: 超級群組
   * - channel: 頻道
   */
  @Column({ type: 'enum', enum: ['private', 'group', 'supergroup', 'channel'], nullable: true })
  chatType?: 'private' | 'group' | 'supergroup' | 'channel';

  /**
   * 額外的元數據（JSON 格式）
   * 可存放：指令類型、錯誤訊息、處理時長等
   */
  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  /**
   * 建立時間
   */
  @CreateDateColumn()
  createdAt: Date;
}
