import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTempSelectionsTable1716620100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla para selecciones temporales
    await queryRunner.query(`
      CREATE TABLE "spiritual_path_temp_selections" (
        "id" uuid PRIMARY KEY,
        "user_id" uuid NOT NULL,
        "suggestion_id" uuid NOT NULL,
        "is_selected" boolean NOT NULL DEFAULT true,
        "session_id" varchar(36) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_temp_selection_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE,
        CONSTRAINT "fk_temp_selection_suggestion" FOREIGN KEY ("suggestion_id") REFERENCES "spiritual_path_suggestions" ("id") ON DELETE CASCADE
      )
    `);
    
    // Índice para búsquedas rápidas por usuario
    await queryRunner.query(`
      CREATE INDEX "idx_temp_selection_user" ON "spiritual_path_temp_selections" ("user_id")
    `);
    
    // Índice para búsquedas rápidas por sesión
    await queryRunner.query(`
      CREATE INDEX "idx_temp_selection_session" ON "spiritual_path_temp_selections" ("session_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_temp_selection_session"`);
    await queryRunner.query(`DROP INDEX "idx_temp_selection_user"`);
    await queryRunner.query(`DROP TABLE "spiritual_path_temp_selections"`);
  }
} 