import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGroupReportsTable1716590000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear enum para las razones de reporte
    await queryRunner.query(`
      CREATE TYPE report_reason_enum AS ENUM (
        'inappropriate_content',
        'spam',
        'harassment',
        'false_information',
        'other'
      );
    `);

    // Crear tabla de reportes de grupo
    await queryRunner.query(`
      CREATE TABLE group_reports (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        group_id VARCHAR(36) NOT NULL,
        reported_by VARCHAR(36) NOT NULL,
        reason report_reason_enum NOT NULL DEFAULT 'other',
        details TEXT,
        reviewed BOOLEAN NOT NULL DEFAULT FALSE,
        reviewed_by VARCHAR(36),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES chat_groups(id) ON DELETE CASCADE,
        FOREIGN KEY (reported_by) REFERENCES users(id),
        FOREIGN KEY (reviewed_by) REFERENCES users(id)
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE group_reports`);
    await queryRunner.query(`DROP TYPE report_reason_enum`);
  }
} 