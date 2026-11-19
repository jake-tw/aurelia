import Joi from 'joi';

export const validationSchema = Joi.object({
  // Application
  NODE_ENV: Joi.string().valid('local', 'dev', 'prod').default('dev'),
  PORT: Joi.number().default(3000),
  API_PREFIX: Joi.string().default('api'),

  // Database
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(3306),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),

  // Telegram
  TELEGRAM_BOT_TOKEN: Joi.string().required(),

  // Worker
  MAX_CONCURRENT_QUERY_JOBS: Joi.number().default(3),

  // Timing
  MIN_TELEGRAM_EDIT_INTERVAL: Joi.number().default(6000),
  QUERY_JOB_TIMEOUT: Joi.number().default(300000),
  FIX_JOB_TIMEOUT: Joi.number().default(600000),

  // Logging
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),

  // AI
  ANTHROPIC_API_KEY: Joi.string().optional(),
  ANTHROPIC_API_URL: Joi.string().optional(),

  // Security
  JWT_SECRET: Joi.string().optional(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
});
