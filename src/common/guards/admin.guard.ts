import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ADMIN_ONLY_KEY } from '../decorators/admin-only.decorator.js';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isAdminOnly = this.reflector.getAllAndOverride<boolean>(ADMIN_ONLY_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!isAdminOnly) {
      return true;
    }

    // TODO: 實作實際的管理員驗證邏輯
    // const request = context.switchToHttp().getRequest();
    // return request.user?.isAdmin === true;

    // 暫時允許所有請求（本地開發）
    return true;
  }
}
