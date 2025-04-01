import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddContactEntities1716581000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla de contactos
    await queryRunner.query(`
      CREATE TABLE contacts (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        owner_id VARCHAR(36) NOT NULL,
        contact_user_id VARCHAR(36),
        name VARCHAR(255) NOT NULL,
        second_name VARCHAR(255),
        email VARCHAR(255),
        phone_number VARCHAR(50),
        suffix VARCHAR(50),
        nickname VARCHAR(100),
        job_title VARCHAR(100),
        department VARCHAR(100),
        custom_fields JSON,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (contact_user_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);

    // Crear tabla de definiciones de campos personalizados
    await queryRunner.query(`
      CREATE TABLE custom_field_definitions (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE custom_field_definitions`);
    await queryRunner.query(`DROP TABLE contacts`);
  }
} 