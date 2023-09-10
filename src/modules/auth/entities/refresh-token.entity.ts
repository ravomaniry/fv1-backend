import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';

@Entity('refresh_tokens')
export class RefreshTokenEntity {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => UserEntity)
  user: UserEntity;

  @Column()
  userId: number;
}
