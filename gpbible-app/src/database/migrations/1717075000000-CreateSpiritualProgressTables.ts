import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSpiritualProgressTables1717075000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create user_progress table
    await queryRunner.query(`
      CREATE TABLE "user_progress" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "total_completed_opportunities" integer NOT NULL DEFAULT 0,
        "total_assigned_opportunities" integer NOT NULL DEFAULT 0,
        "consecutive_days_active" integer NOT NULL DEFAULT 0,
        "last_active_date" date,
        "best_consecutive_days" integer NOT NULL DEFAULT 0,
        "overall_completion_percentage" decimal(5,2) NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_user_progress_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Create weekly_progress table
    await queryRunner.query(`
      CREATE TABLE "weekly_progress" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_progress_id" uuid NOT NULL,
        "start_date" date NOT NULL,
        "end_date" date NOT NULL,
        "week_label" varchar NOT NULL,
        "completed_opportunities" integer NOT NULL DEFAULT 0,
        "assigned_opportunities" integer NOT NULL DEFAULT 0,
        "completion_percentage" decimal(5,2) NOT NULL DEFAULT 0,
        "active_days_in_week" integer NOT NULL DEFAULT 0,
        "is_current_week" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_weekly_progress_user_progress" FOREIGN KEY ("user_progress_id") REFERENCES "user_progress"("id") ON DELETE CASCADE
      )
    `);

    // Create monthly_progress table
    await queryRunner.query(`
      CREATE TABLE "monthly_progress" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_progress_id" uuid NOT NULL,
        "year" integer NOT NULL,
        "month" integer NOT NULL,
        "month_label" varchar NOT NULL,
        "completed_opportunities" integer NOT NULL DEFAULT 0,
        "assigned_opportunities" integer NOT NULL DEFAULT 0,
        "completion_percentage" decimal(5,2) NOT NULL DEFAULT 0,
        "active_days_in_month" integer NOT NULL DEFAULT 0,
        "is_current_month" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_monthly_progress_user_progress" FOREIGN KEY ("user_progress_id") REFERENCES "user_progress"("id") ON DELETE CASCADE
      )
    `);

    // Create opportunity_completions table
    await queryRunner.query(`
      CREATE TABLE "opportunity_completions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "opportunity_id" uuid,
        "completion_date" date NOT NULL,
        "week_id" uuid,
        "month_id" uuid,
        "opportunity_details" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_opportunity_completions_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX "idx_user_progress_user_id" ON "user_progress" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_weekly_progress_user_progress_id" ON "weekly_progress" ("user_progress_id")`);
    await queryRunner.query(`CREATE INDEX "idx_weekly_progress_start_date" ON "weekly_progress" ("start_date")`);
    await queryRunner.query(`CREATE INDEX "idx_weekly_progress_is_current" ON "weekly_progress" ("is_current_week")`);
    await queryRunner.query(`CREATE INDEX "idx_monthly_progress_user_progress_id" ON "monthly_progress" ("user_progress_id")`);
    await queryRunner.query(`CREATE INDEX "idx_monthly_progress_year_month" ON "monthly_progress" ("year", "month")`);
    await queryRunner.query(`CREATE INDEX "idx_monthly_progress_is_current" ON "monthly_progress" ("is_current_month")`);
    await queryRunner.query(`CREATE INDEX "idx_opportunity_completions_user_id" ON "opportunity_completions" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_opportunity_completions_completion_date" ON "opportunity_completions" ("completion_date")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_opportunity_completions_completion_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_opportunity_completions_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_monthly_progress_is_current"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_monthly_progress_year_month"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_monthly_progress_user_progress_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_weekly_progress_is_current"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_weekly_progress_start_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_weekly_progress_user_progress_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_progress_user_id"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS "opportunity_completions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "monthly_progress"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "weekly_progress"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_progress"`);
  }
} 