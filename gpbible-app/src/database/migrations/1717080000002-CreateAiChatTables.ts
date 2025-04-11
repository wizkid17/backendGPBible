import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAiChatTables1717080000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear el tipo enum para los tipos de mensaje
    await queryRunner.query(`
      CREATE TYPE message_type_enum AS ENUM (
        'text',
        'verse',
        'prayer',
        'recommendation',
        'resource',
        'suggestion'
      )
    `);

    // Crear la tabla de mensajes del chat
    await queryRunner.query(`
      CREATE TABLE ai_chat_messages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        content TEXT NOT NULL,
        type message_type_enum DEFAULT 'text',
        is_ai_message BOOLEAN NOT NULL DEFAULT false,
        user_id UUID NOT NULL,
        verse_reference VARCHAR(255),
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Crear índices
    await queryRunner.query(`
      CREATE INDEX idx_ai_chat_messages_user_id ON ai_chat_messages(user_id);
      CREATE INDEX idx_ai_chat_messages_created_at ON ai_chat_messages(created_at);
      CREATE INDEX idx_ai_chat_messages_type ON ai_chat_messages(type);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices
    await queryRunner.query(`DROP INDEX IF EXISTS idx_ai_chat_messages_type`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_ai_chat_messages_created_at`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_ai_chat_messages_user_id`);

    // Eliminar tabla
    await queryRunner.query(`DROP TABLE IF EXISTS ai_chat_messages`);

    // Eliminar tipo enum
    await queryRunner.query(`DROP TYPE IF EXISTS message_type_enum`);
  }
} 