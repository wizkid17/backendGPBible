import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSpiritualPathTables1716620000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla de preguntas espirituales
    await queryRunner.query(`
      CREATE TABLE "spiritual_path_questions" (
        "id" uuid PRIMARY KEY,
        "question_text" text NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Crear tabla de sugerencias espirituales
    await queryRunner.query(`
      CREATE TABLE "spiritual_path_suggestions" (
        "id" uuid PRIMARY KEY,
        "suggestion_text" text NOT NULL,
        "description" text,
        "category" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Crear tabla de selecciones de camino espiritual de usuario
    await queryRunner.query(`
      CREATE TABLE "user_spiritual_path" (
        "id" uuid PRIMARY KEY,
        "user_id" uuid NOT NULL,
        "suggestion_id" uuid NOT NULL,
        "is_completed" boolean NOT NULL DEFAULT false,
        "is_favorite" boolean NOT NULL DEFAULT false,
        "completed_at" TIMESTAMP,
        "reminder_time" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_user_spiritual_path_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE,
        CONSTRAINT "fk_user_spiritual_path_suggestion" FOREIGN KEY ("suggestion_id") REFERENCES "spiritual_path_suggestions" ("id")
      )
    `);

    // Crear tabla de preguntas espirituales de usuario
    await queryRunner.query(`
      CREATE TABLE "user_spiritual_questions" (
        "id" uuid PRIMARY KEY,
        "user_id" uuid NOT NULL,
        "question_text" text NOT NULL,
        "response_text" text,
        "is_answered" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_user_spiritual_questions_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
      )
    `);

    // Insertar algunas sugerencias predeterminadas
    await queryRunner.query(`
      INSERT INTO "spiritual_path_suggestions" (id, suggestion_text, description, category, is_active) VALUES 
      (uuid_generate_v4(), 'Set aside 10 minutes each day to pray specifically about feeling God''s presence', 'Focus on moments when you''ve felt connected to the divine or the holy.', 1, true),
      (uuid_generate_v4(), 'Read a Bible verse each morning and reflect on it during the day', 'Start with short passages from Psalms or the Gospels.', 2, true),
      (uuid_generate_v4(), 'Dedicate one meal a day to eat mindfully while reflecting on your blessings', 'Practice gratitude for your food and those who prepared it.', 3, true),
      (uuid_generate_v4(), 'Journal about your spiritual journey for 5 minutes before bed', 'Record moments of connection, challenges, and growth.', 4, true),
      (uuid_generate_v4(), 'Attend a worship service or spiritual gathering weekly', 'Connect with a community that shares your spiritual values.', 5, true),
      (uuid_generate_v4(), 'Practice forgiveness meditation once a week', 'Release grudges and hurts through prayer and reflection.', 1, true),
      (uuid_generate_v4(), 'Volunteer for a cause that aligns with your spiritual values', 'Put your faith into action through service to others.', 3, true),
      (uuid_generate_v4(), 'Have a deep conversation with Him', 'Set aside time for uninterrupted prayer and spiritual reflection.', 1, true),
      (uuid_generate_v4(), 'Fast from social media one day per week', 'Replace scrolling with prayer, meditation, or spiritual reading.', 4, true),
      (uuid_generate_v4(), 'Listen to worship music or spiritual podcasts during commute', 'Transform routine time into an opportunity for spiritual growth.', 5, true)
    `);

    // Insertar algunas preguntas predeterminadas
    await queryRunner.query(`
      INSERT INTO "spiritual_path_questions" (id, question_text, is_active) VALUES 
      (uuid_generate_v4(), 'What is one action you can take or practice you can cultivate to be more spiritually intentional every week or every day?', true),
      (uuid_generate_v4(), 'How can I deepen my prayer life in small, consistent ways?', true),
      (uuid_generate_v4(), 'What spiritual discipline would help me feel closer to God right now?', true),
      (uuid_generate_v4(), 'How can I bring more mindfulness to my spiritual practices?', true),
      (uuid_generate_v4(), 'What aspect of my spiritual life needs the most attention right now?', true)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_spiritual_questions"`);
    await queryRunner.query(`DROP TABLE "user_spiritual_path"`);
    await queryRunner.query(`DROP TABLE "spiritual_path_suggestions"`);
    await queryRunner.query(`DROP TABLE "spiritual_path_questions"`);
  }
} 