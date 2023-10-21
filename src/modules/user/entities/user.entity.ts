import { ApiProperty } from '@nestjs/swagger';
import { ProgressEntity } from 'src/modules/progress/entities/progress.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class UserEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ unique: true })
  username: string;

  @Column({ nullable: false })
  hashedPassword: string;

  @OneToMany(() => ProgressEntity, (progress) => progress.user)
  progresses: ProgressEntity[];
}
