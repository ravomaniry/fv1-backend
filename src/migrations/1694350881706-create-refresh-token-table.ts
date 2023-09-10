import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRefreshTokenTable1694350881706
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE refresh_tokens (
        id VARCHAR(255) NOT NULL,
        user_id INT NOT NULL,
        
        PRIMARY KEY(id),
        
        CONSTRAINT fkRefreshTokenUser
            FOREIGN KEY(user_id)
                REFERENCES users (id)
      )
      ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('refresh_tokens');
  }
}
