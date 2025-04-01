import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateWeeklySpiritualPathTables1716591000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla de objetivos semanales
    await queryRunner.createTable(
      new Table({
        name: 'weekly_spiritual_objectives',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true
          },
          {
            name: 'user_id',
            type: 'varchar',
            length: '36'
          },
          {
            name: 'text',
            type: 'varchar',
            length: '255'
          },
          {
            name: 'theme',
            type: 'varchar',
            length: '100',
            isNullable: true
          },
          {
            name: 'week_start_date',
            type: 'timestamp',
            default: 'NOW()'
          },
          {
            name: 'week_end_date',
            type: 'timestamp',
            default: 'NOW()'
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'NOW()'
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'NOW()',
            onUpdate: 'NOW()'
          }
        ]
      }),
      true
    );

    // Crear tabla de oportunidades semanales
    await queryRunner.createTable(
      new Table({
        name: 'weekly_spiritual_opportunities',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true
          },
          {
            name: 'objective_id',
            type: 'varchar',
            length: '36'
          },
          {
            name: 'text',
            type: 'varchar',
            length: '500'
          },
          {
            name: 'description',
            type: 'varchar',
            length: '1000',
            isNullable: true
          },
          {
            name: 'is_completed',
            type: 'boolean',
            default: false
          },
          {
            name: 'completed_at',
            type: 'timestamp',
            isNullable: true
          },
          {
            name: 'order',
            type: 'int',
            default: 0
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'NOW()'
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'NOW()',
            onUpdate: 'NOW()'
          }
        ]
      }),
      true
    );

    // Crear las claves foráneas
    await queryRunner.createForeignKey(
      'weekly_spiritual_objectives',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE'
      })
    );

    await queryRunner.createForeignKey(
      'weekly_spiritual_opportunities',
      new TableForeignKey({
        columnNames: ['objective_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'weekly_spiritual_objectives',
        onDelete: 'CASCADE'
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar las claves foráneas primero
    const opportunitiesTable = await queryRunner.getTable('weekly_spiritual_opportunities');
    const objectivesTable = await queryRunner.getTable('weekly_spiritual_objectives');
    
    if (opportunitiesTable) {
      const opportunitiesForeignKey = opportunitiesTable.foreignKeys.find(
        fk => fk.columnNames.indexOf('objective_id') !== -1
      );
      if (opportunitiesForeignKey) {
        await queryRunner.dropForeignKey('weekly_spiritual_opportunities', opportunitiesForeignKey);
      }
    }
    
    if (objectivesTable) {
      const objectivesForeignKey = objectivesTable.foreignKeys.find(
        fk => fk.columnNames.indexOf('user_id') !== -1
      );
      if (objectivesForeignKey) {
        await queryRunner.dropForeignKey('weekly_spiritual_objectives', objectivesForeignKey);
      }
    }
    
    // Eliminar las tablas
    await queryRunner.dropTable('weekly_spiritual_opportunities', true);
    await queryRunner.dropTable('weekly_spiritual_objectives', true);
  }
} 