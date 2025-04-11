import { Connection } from 'typeorm';
import { BibleVersion } from '../../bible-versions/entities/bible-version.entity';

export const seedBibleVersions = async (connection: Connection) => {
  const bibleVersionRepository = connection.getRepository(BibleVersion);

  // Verificar si ya existen versiones
  const existingVersions = await bibleVersionRepository.find();
  if (existingVersions.length > 0) {
    return;
  }

  // Crear versiones iniciales
  const versions = [
    {
      name: 'New King James Version (NKJV)',
      abbreviation: 'NKJV',
      language: 'English',
      description: 'The New King James Version (NKJV) is an English translation of the Bible first published in 1982.',
      year: 1982,
      copyright: 'Thomas Nelson'
    },
    {
      name: 'New International Version (NIV)',
      abbreviation: 'NIV',
      language: 'English',
      description: 'The New International Version (NIV) is an English translation of the Bible.',
      year: 1978,
      copyright: 'Biblica'
    },
    {
      name: 'New American Standard Version (NASB)',
      abbreviation: 'NASB',
      language: 'English',
      description: 'The New American Standard Bible (NASB) is an English translation of the Bible.',
      year: 1971,
      copyright: 'Lockman Foundation'
    }
  ];

  // Guardar las versiones en la base de datos
  for (const version of versions) {
    const bibleVersion = bibleVersionRepository.create(version);
    await bibleVersionRepository.save(bibleVersion);
  }
}; 