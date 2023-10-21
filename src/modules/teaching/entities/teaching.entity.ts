import { ApiProperty } from '@nestjs/swagger';
import { ProgressEntity } from 'src/modules/progress/entities/progress.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

export class TeachingSection {
  @ApiProperty()
  subtitle: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  audioId: string;
}

export class TeachingQuestion {
  @ApiProperty()
  key: string;

  @ApiProperty()
  question: string;

  @ApiProperty()
  options: string[];

  @ApiProperty()
  response: string;
}

export class TeachingChapter {
  @ApiProperty()
  title: string;

  @ApiProperty({ type: TeachingSection, isArray: true })
  sections: TeachingSection[];

  @ApiProperty({ type: TeachingQuestion, isArray: true })
  questions: TeachingQuestion[];
}

@Entity('teachings')
export class TeachingEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ nullable: false })
  title: string;

  @ApiProperty()
  @Column({ nullable: false })
  subtitle: string;

  @ApiProperty({ type: TeachingChapter, isArray: true })
  @Column('simple-json', { nullable: false })
  chapters: TeachingChapter[];

  @OneToMany(() => ProgressEntity, (progress) => progress.teaching)
  progresses: ProgressEntity[];
}
