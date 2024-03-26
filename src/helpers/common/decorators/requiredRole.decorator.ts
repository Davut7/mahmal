import { SetMetadata } from '@nestjs/common';
import { RoleType } from 'src/helpers/constants/user';

export const ROLES_KEY = RoleType;

export const RequiredRole = (...roles: string[]) =>
  SetMetadata(ROLES_KEY, roles);
