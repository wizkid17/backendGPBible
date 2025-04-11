import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserSettingsTable1717080000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tipos enum
    await queryRunner.query(`
      CREATE TYPE text_size_enum AS ENUM ('small', 'medium', 'large');
      CREATE TYPE language_enum AS ENUM ('english', 'spanish', 'portuguese');
    `);

    // Crear tabla de configuraciones
    await queryRunner.query(`
      CREATE TABLE user_settings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        language language_enum DEFAULT 'english',
        text_size text_size_enum DEFAULT 'medium',
        notifications BOOLEAN DEFAULT true,
        additional_preferences JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Crear índices
    await queryRunner.query(`
      CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
      CREATE INDEX idx_user_settings_language ON user_settings(language);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices
    await queryRunner.query(`DROP INDEX IF EXISTS idx_user_settings_language`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_user_settings_user_id`);

    // Eliminar tabla
    await queryRunner.query(`DROP TABLE IF EXISTS user_settings`);

    // Eliminar tipos enum
    await queryRunner.query(`DROP TYPE IF EXISTS language_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS text_size_enum`);
  }
} 