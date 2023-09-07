import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTeachingTable1694066670374 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE teachings (
            id int NOT NULL AUTO_INCREMENT,
            title VARCHAR(255) NOT NULL,
            subtitle VARCHAR(255) NOT NULL,
            content JSON NOT NULL,
            PRIMARY KEY (id)
        ) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('teachings');
  }
}
