import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../helpers/entities/abstract.entity';
import { AdminEntity } from 'src/admin/users/entities/adminUsers.entity';

@Entity({ name: 'admin_tokens' })
export class AdminTokenEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 500, nullable: false })
  refreshToken: string;

  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @OneToOne(() => AdminEntity, (user) => user.token, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: AdminEntity;
}
