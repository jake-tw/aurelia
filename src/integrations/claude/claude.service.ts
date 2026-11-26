import { Injectable, Logger } from '@nestjs/common';
// import { exec } from 'node:child_process';
// import { promisify } from 'node:util';

// const execAsync = promisify(exec);

/**
 * Claude Code 服務 - 封裝本地 claude -p 命令呼叫
 */
@Injectable()
export class ClaudeService {
  private readonly logger = new Logger(ClaudeService.name);

  /**
   * 使用 Claude Code CLI 執行提示詞
   * @param prompt 要執行的提示詞
   * @param _options 可選的執行選項
   * @returns Claude 的回應
   */
  async execute(
    prompt: string,
    _options?: {
      workDir?: string;
      timeout?: number;
    },
  ): Promise<string> {
    this.logger.log(`Executing Claude prompt: ${prompt.substring(0, 50)}...`);

    // TODO: 實作 claude -p 命令執行
    // 需要處理：
    // 1. 命令建構
    // 2. 工作目錄切換
    // 3. 超時控制
    // 4. 錯誤處理

    return '此為 Claude Code 佔位回應';
  }

  /**
   * 檢查 Claude Code CLI 是否可用
   * @returns 是否已安裝且可執行
   */
  async isAvailable(): Promise<boolean> {
    this.logger.log('Checking Claude Code CLI availability');

    try {
      // TODO: 實作可用性檢查
      // 例如：執行 claude --version
      return false;
    } catch (error) {
      this.logger.warn('Claude Code CLI not available', error);
      return false;
    }
  }

  /**
   * 取得 Claude Code CLI 版本
   * @returns 版本字串，若無法取得則返回 null
   */
  async getVersion(): Promise<string | null> {
    this.logger.log('Getting Claude Code version');

    try {
      // TODO: 實作版本查詢
      // 執行 claude --version 並解析輸出
      return null;
    } catch (error) {
      this.logger.error('Failed to get Claude Code version', error);
      return null;
    }
  }

  /**
   * 使用特定專案執行 Claude 提示詞
   * @param prompt 提示詞
   * @param projectPath 專案路徑
   * @returns Claude 的回應
   */
  async executeInProject(
    prompt: string,
    projectPath: string,
  ): Promise<string> {
    this.logger.log(
      `Executing in project: ${projectPath}, prompt: ${prompt.substring(0, 50)}...`,
    );

    // TODO: 實作專案內執行
    // 切換到專案目錄後執行 claude -p

    return '此為專案內執行佔位回應';
  }
}
