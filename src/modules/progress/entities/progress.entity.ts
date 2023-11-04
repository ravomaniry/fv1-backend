import { TeachingEntity } from 'src/modules/teaching/entities/teaching.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class ProgressScore {
  @ApiProperty()
  correctAnswersPercentage: number;
}

@Entity('progress')
export class ProgressEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @ManyToOne(() => TeachingEntity, (teaching) => teaching.progresses)
  teaching: TeachingEntity;

  @ManyToOne(() => UserEntity, (user) => user.progresses)
  user: UserEntity;

  @ApiProperty({ type: ProgressScore, isArray: true })
  @Column('simple-json')
  scores: ProgressScore[];

  @ApiProperty()
  @Column()
  clientTimestamp: number;
}
