import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddContactPermissionColumns1716582000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users
      ADD COLUMN contact_permission_requested BOOLEAN DEFAULT FALSE,
      ADD COLUMN contact_permission_granted BOOLEAN DEFAULT FALSE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users
      DROP COLUMN contact_permission_requested,
      DROP COLUMN contact_permission_granted;
    `);
  }
} 