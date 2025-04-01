import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFaithfulPersonsTable1716583000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE faithful_persons (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        default_message VARCHAR(255) NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Insertar datos iniciales
    await queryRunner.query(`
      INSERT INTO faithful_persons (id, user_id, title, default_message, is_active)
      SELECT 
        UUID(), 
        id, 
        'Powerful faithful people', 
        'Carla: How can I help you today?', 
        TRUE
      FROM users
      LIMIT 5;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE faithful_persons`);
  }
} 