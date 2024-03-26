import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { BaseEntity } from '../../../helpers/entities/abstract.entity';

@Entity({ name: 'tokens' })
export class TokenEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 500, nullable: false })
  refreshToken: string;

  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @OneToOne(() => UserEntity, (user) => user.token, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: UserEntity;
}
