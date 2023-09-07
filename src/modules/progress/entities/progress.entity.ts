import { TeachingEntity } from 'src/modules/teaching/entities/teaching.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProgressScore } from '../types/score';
import { UserEntity } from 'src/modules/user/entities/user.entity';

@Entity('progress')
export class ProgressEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => TeachingEntity, (teaching) => teaching.progresses)
  @JoinColumn({ name: 'teaching_id' })
  teaching: TeachingEntity;

  @ManyToOne(() => UserEntity, (user) => user.progresses)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column('simple-json')
  scores: ProgressScore[];
}
