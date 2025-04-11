import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBibleTables1717080000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla de libros
    await queryRunner.query(`
      CREATE TABLE bible_books (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        short_name VARCHAR(50) NOT NULL,
        testament ENUM('old', 'new') NOT NULL,
        order_number INT NOT NULL,
        description TEXT,
        cover_image_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de capítulos
    await queryRunner.query(`
      CREATE TABLE bible_chapters (
        id INT PRIMARY KEY AUTO_INCREMENT,
        chapter_number INT NOT NULL,
        title VARCHAR(255),
        audio_url VARCHAR(255),
        book_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (book_id) REFERENCES bible_books(id)
      )
    `);

    // Crear tabla de versículos
    await queryRunner.query(`
      CREATE TABLE bible_verses (
        id INT PRIMARY KEY AUTO_INCREMENT,
        verse_number INT NOT NULL,
        text TEXT NOT NULL,
        audio_url VARCHAR(255),
        chapter_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (chapter_id) REFERENCES bible_chapters(id)
      )
    `);

    // Crear índices
    await queryRunner.query(`
      CREATE INDEX idx_book_order ON bible_books(order_number);
      CREATE INDEX idx_chapter_number ON bible_chapters(chapter_number);
      CREATE INDEX idx_verse_number ON bible_verses(verse_number);
      CREATE FULLTEXT INDEX idx_verse_text ON bible_verses(text);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices
    await queryRunner.query(`DROP INDEX idx_verse_text ON bible_verses`);
    await queryRunner.query(`DROP INDEX idx_verse_number ON bible_verses`);
    await queryRunner.query(`DROP INDEX idx_chapter_number ON bible_chapters`);
    await queryRunner.query(`DROP INDEX idx_book_order ON bible_books`);

    // Eliminar tablas
    await queryRunner.query(`DROP TABLE bible_verses`);
    await queryRunner.query(`DROP TABLE bible_chapters`);
    await queryRunner.query(`DROP TABLE bible_books`);
  }
} 