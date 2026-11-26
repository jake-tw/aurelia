import { Injectable, Logger } from '@nestjs/common';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

/**
 * Shell 腳本執行服務
 */
@Injectable()
export class ShellService {
  private readonly logger = new Logger(ShellService.name);

  /**
   * 執行腳本
   * @param scriptPath 腳本路徑
   * @param args 可選的腳本參數
   * @returns 腳本執行結果
   */
  async executeScript(
    scriptPath: string,
    args: string[] = [],
  ): Promise<{ stdout: string; stderr: string }> {
    this.logger.log(`Executing script: ${scriptPath} with args: ${JSON.stringify(args)}`);

    try {
      const { stdout, stderr } = await execFileAsync(scriptPath, args, {
        timeout: 30000, // 30 秒超時
      });

      return { stdout, stderr };
    } catch (error) {
      this.logger.error(`Script execution failed: ${scriptPath}`, error);
      throw error;
    }
  }
}
