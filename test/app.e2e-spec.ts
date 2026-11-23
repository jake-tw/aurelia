import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Telegraf } from 'telegraf';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // 不連真實的 Telegram，也不啟動 polling
      .overrideProvider(Telegraf)
      .useValue({
        start: vi.fn(),
        command: vi.fn(),
        on: vi.fn(),
        catch: vi.fn(),
        launch: vi.fn().mockReturnValue(new Promise(() => {})),
        stop: vi.fn(),
        telegram: { getMe: vi.fn().mockResolvedValue({ username: 'fake_bot' }) },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  afterEach(async () => {
    await app.close();
  });
});
