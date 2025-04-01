import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAiChatTables1717080000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum for message roles
    await queryRunner.query(`
      CREATE TYPE chat_message_role_enum AS ENUM ('user', 'assistant', 'system')
    `);

    // Create conversations table
    await queryRunner.query(`
      CREATE TABLE "ai_chat_conversations" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "title" varchar NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "last_message_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_ai_chat_conversations_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Create messages table
    await queryRunner.query(`
      CREATE TABLE "ai_chat_messages" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "conversation_id" uuid NOT NULL,
        "role" chat_message_role_enum NOT NULL DEFAULT 'user',
        "content" text NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_ai_chat_messages_conversation" FOREIGN KEY ("conversation_id") REFERENCES "ai_chat_conversations"("id") ON DELETE CASCADE
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX "idx_ai_chat_conversations_user_id" ON "ai_chat_conversations" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_ai_chat_conversations_last_message_at" ON "ai_chat_conversations" ("last_message_at")`);
    await queryRunner.query(`CREATE INDEX "idx_ai_chat_messages_conversation_id" ON "ai_chat_messages" ("conversation_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_ai_chat_messages_conversation_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_ai_chat_conversations_last_message_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_ai_chat_conversations_user_id"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS "ai_chat_messages"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ai_chat_conversations"`);
    
    // Drop enum
    await queryRunner.query(`DROP TYPE IF EXISTS "chat_message_role_enum"`);
  }
} 