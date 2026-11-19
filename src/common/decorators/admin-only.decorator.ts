import { SetMetadata } from '@nestjs/common';

export const ADMIN_ONLY_KEY = 'adminOnly';

/**
 * 標記僅管理員可訪問的路由
 */
export const AdminOnly = () => SetMetadata(ADMIN_ONLY_KEY, true);
