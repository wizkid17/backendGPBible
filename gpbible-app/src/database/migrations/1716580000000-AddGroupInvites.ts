import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGroupInvites1716580000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE group_invites (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        code VARCHAR(255) NOT NULL UNIQUE,
        group_id VARCHAR(36) NOT NULL,
        created_by VARCHAR(36) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        FOREIGN KEY (group_id) REFERENCES chat_groups(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE group_invites`);
  }
} 