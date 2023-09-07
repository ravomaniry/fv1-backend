import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
