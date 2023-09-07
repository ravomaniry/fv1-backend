import { ProgressEntity } from 'src/modules/progress/entities/progress.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: false })
  hashedPassword: string;

  @OneToMany(() => ProgressEntity, (progress) => progress.user)
  progresses: ProgressEntity[];
}
