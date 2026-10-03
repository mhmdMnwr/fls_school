import {
  Injectable,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import { IS_PARENT_ROUTE_KEY } from '../decorators/parent-route.decorator.js';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      return super.handleRequest(err, user, info, context);
    }

    const isParentRoute = this.reflector.getAllAndOverride<boolean>(
      IS_PARENT_ROUTE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isParentRoute) {
      if (user.role !== 'parent') {
        throw new ForbiddenException('Accès réservé aux parents');
      }
    } else {
      if (user.role !== 'admin') {
        throw new ForbiddenException('Accès réservé aux administrateurs');
      }
    }

    return user;
  }
}
