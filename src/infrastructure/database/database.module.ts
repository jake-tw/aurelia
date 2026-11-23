import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TransactionService } from './transaction.service.js';
import { TelegramLog } from './entities/index.js';

@Module({
  imports: [
    // 設定 TypeORM 連線
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql' as const,
        host: config.get<string>('database.host'),
        port: config.get<number>('database.port'),
        username: config.get<string>('database.username'),
        password: config.get<string>('database.password'),
        database: config.get<string>('database.name'),
        entities: [TelegramLog],
        synchronize: config.get<string>('nodeEnv') === 'development',
        logging: config.get<string>('nodeEnv') === 'development',
      }),
    }),
    // 註冊 Repositories
    TypeOrmModule.forFeature([TelegramLog]),
  ],
  providers: [TransactionService],
  exports: [TransactionService, TypeOrmModule],
})
export class DatabaseModule {}
