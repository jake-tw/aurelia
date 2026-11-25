export default () => ({
  // Application
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || 'api',

  // Database
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'aurelia',
  },

  // Telegram Bot
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    whitelistPrivate: process.env.TELEGRAM_WHITELIST_PRIVATE
      ? process.env.TELEGRAM_WHITELIST_PRIVATE.split(',').map((id) => parseInt(id.trim(), 10))
      : [],
    whitelistGroup: process.env.TELEGRAM_WHITELIST_GROUP
      ? process.env.TELEGRAM_WHITELIST_GROUP.split(',').map((id) => parseInt(id.trim(), 10))
      : [],
    whitelistGroupMember: process.env.TELEGRAM_WHITELIST_GROUP_MEMBER
      ? process.env.TELEGRAM_WHITELIST_GROUP_MEMBER.split(',').map((id) => parseInt(id.trim(), 10))
      : [],
  },

  // Worker Configuration
  worker: {
    maxConcurrentQueryJobs: parseInt(process.env.MAX_CONCURRENT_QUERY_JOBS || '3', 10),
  },

  // Timing Configuration (in milliseconds)
  timing: {
    minTelegramEditInterval: parseInt(process.env.MIN_TELEGRAM_EDIT_INTERVAL || '6000', 10),
    queryJobTimeout: parseInt(process.env.QUERY_JOB_TIMEOUT || '300000', 10),
    fixJobTimeout: parseInt(process.env.FIX_JOB_TIMEOUT || '600000', 10),
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },

  // AI
  ai: {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
    anthropicApiUrl: process.env.ANTHROPIC_API_URL || '',
  },

  // Security
  security: {
    jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
});
