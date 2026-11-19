import { Logger } from '@nestjs/common';

/**
 * 格式化日誌輸出
 */
export function formatLog(context: string, message: string, data?: any): string {
  const timestamp = new Date().toISOString();
  const logData = data ? ` | ${JSON.stringify(data)}` : '';
  return `[${timestamp}] [${context}] ${message}${logData}`;
}

/**
 * 創建帶前綴的 Logger
 */
export function createLogger(context: string): Logger {
  return new Logger(context);
}

/**
 * 安全地記錄錯誤（避免敏感資訊洩漏）
 */
export function logError(logger: Logger, error: Error, context?: string) {
  const message = context ? `${context}: ${error.message}` : error.message;
  logger.error(message, error.stack);
}
