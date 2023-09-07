import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProgressTable1694068615109 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`progress\` (
            id int NOT NULL AUTO_INCREMENT,
            scores text NOT NULL NOT NULL,
            teaching_id int NOT NULL,
            user_id int NOT NULL,

            PRIMARY KEY (id),
            CONSTRAINT fkProgressTeaching
                FOREIGN KEY (teaching_id)
                    REFERENCES teachings (id),
            CONSTRAINT fkProgressUser
                FOREIGN KEY (user_id)
                    REFERENCES users (id)
        )
        ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('progress');
  }
}
