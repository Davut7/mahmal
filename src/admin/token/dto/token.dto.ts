import { AdminEntity } from 'src/admin/users/entities/adminUsers.entity';

export class AdminTokenDto {
  id: string;
  firstName: string;
  lastName: string;
  role: string;

  constructor(entity: AdminEntity) {
    this.id = entity.id;
    this.firstName = entity.firstName;
    this.lastName = entity.lastName;
    this.role = entity.role;
  }
}
