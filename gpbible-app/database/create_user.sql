-- Crear usuario si no existe
CREATE USER IF NOT EXISTS 'admin2024'@'localhost' IDENTIFIED BY 'Pa$$w0rd2019';

-- Otorgar todos los privilegios sobre la base de datos gpbible
GRANT ALL PRIVILEGES ON gpbible.* TO 'admin2024'@'localhost';

-- Actualizar privilegios
FLUSH PRIVILEGES; 