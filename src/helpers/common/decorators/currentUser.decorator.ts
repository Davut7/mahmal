import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

export function CurrentUser() {
  return createParamDecorator((_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    const user = request.currentUser;

    return user;
  })();
}
