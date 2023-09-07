import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserTable1694020315884 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE users (
          id int NOT NULL AUTO_INCREMENT,
          username varchar(255) UNIQUE NOT NULL,
          hashed_password varchar(255) NOT NULL,
          PRIMARY KEY (id, username)
        )
        ENGINE=InnoDB
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
