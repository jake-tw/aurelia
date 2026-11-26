import { Injectable, Logger } from '@nestjs/common';

/**
 * AI 服務 - 封裝外部 AI API 呼叫
 * 採用一問一答的同步方式
 */
@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  /**
   * 發送單次聊天請求並取得回應
   * @param message 用戶訊息
   * @param _context 可選的上下文資訊
   * @returns AI 回應文字
   */
  async chat(message: string, _context?: string): Promise<string> {
    this.logger.log(`Sending chat request: ${message.substring(0, 50)}...`);

    // TODO: 實作外部 AI API 呼叫
    // 例如：Anthropic Claude API、OpenAI API 等

    return '此為 AI 服務佔位回應';
  }

  /**
   * 發送帶有系統提示的聊天請求
   * @param _message 用戶訊息
   * @param _systemPrompt 系統提示詞
   * @returns AI 回應文字
   */
  async chatWithSystem(
    _message: string,
    _systemPrompt: string,
  ): Promise<string> {
    this.logger.log(`Sending chat with system prompt`);

    // TODO: 實作帶系統提示的 API 呼叫

    return '此為 AI 服務佔位回應';
  }

  /**
   * 串流方式取得 AI 回應
   * @param message 用戶訊息
   * @param onChunk 每收到一個回應片段時的回調函數
   */
  async chatStream(
    message: string,
    onChunk: (chunk: string) => void,
  ): Promise<void> {
    this.logger.log(`Starting streaming chat`);

    // TODO: 實作串流 API 呼叫

    onChunk('此為串流佔位回應');
  }

  /**
   * 取得模型資訊
   * @returns 目前使用的模型名稱與版本
   */
  async getModelInfo(): Promise<{ model: string; version: string }> {
    this.logger.log(`Getting model info`);

    // TODO: 實作模型資訊查詢

    return {
      model: 'placeholder',
      version: '1.0.0',
    };
  }
}
