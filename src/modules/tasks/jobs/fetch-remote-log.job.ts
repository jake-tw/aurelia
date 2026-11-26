import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ShellService } from '../../../integrations/shell/shell.service.js';

/**
 * 拉取遠端日誌任務 Job（固定任務）
 *
 * 職責：從遠端伺服器拉取日誌並儲存到本地
 * 執行間隔：每 10 分鐘一次（由 TasksService 調度）
 */
@Injectable()
export class FetchRemoteLogJob {
  private readonly logger = new Logger(FetchRemoteLogJob.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly shellService: ShellService,
  ) { }

  /**
   * 執行拉取日誌任務
   */
  async execute(): Promise<void> {
    const scriptPath = this.configService.get<string>('FETCH_REMOTE_LOG_SCRIPT_PATH');

    if (!scriptPath) {
      this.logger.warn('FETCH_REMOTE_LOG_SCRIPT_PATH is not configured, skipping fetch-remote-log job');
      return;
    }

    this.logger.log(`Fetching remote log from script: ${scriptPath}`);

    const { stderr } = await this.shellService.executeScript(scriptPath);

    if (stderr) {
      this.logger.error(`Failed to fetch remote log: script returned stderr. stderr: ${stderr}`);
      return;
    }

    this.logger.log('Successfully executed fetch-remote-log script');
  }
}
