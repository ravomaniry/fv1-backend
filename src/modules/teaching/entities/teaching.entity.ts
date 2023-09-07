import { ProgressEntity } from 'src/modules/progress/entities/progress.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('teachings')
export class TeachingEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  subtitle: string;

  @Column('simple-json', { nullable: false })
  content: any;

  @OneToMany(() => ProgressEntity, (progress) => progress.teaching)
  progresses: ProgressEntity[];
}
