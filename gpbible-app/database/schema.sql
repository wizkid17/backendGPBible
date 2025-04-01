-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS gpbible
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE gpbible;

-- Crear la tabla users
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(100),
    lastName VARCHAR(100),
    picture VARCHAR(255),
    googleId VARCHAR(255),
    birthDate DATE,
    resetPasswordToken VARCHAR(255),
    resetPasswordExpires DATETIME,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY UK_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear tabla de denominaciones
CREATE TABLE IF NOT EXISTS denominations (
    id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY UK_denominations_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear tabla de versiones de la Biblia
CREATE TABLE IF NOT EXISTS bible_versions (
    id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    abbreviation VARCHAR(20) NOT NULL,
    language VARCHAR(50) NOT NULL,
    description TEXT,
    year INT,
    copyright TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY UK_bible_versions_name (name),
    UNIQUE KEY UK_bible_versions_abbreviation (abbreviation)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear tabla de preferencias de usuario
CREATE TABLE IF NOT EXISTS user_preferences (
    id VARCHAR(36) NOT NULL,
    userId VARCHAR(36) NOT NULL,
    denominationId VARCHAR(36),
    bibleVersionId VARCHAR(36),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY UK_user_preferences_user (userId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (denominationId) REFERENCES denominations(id) ON DELETE SET NULL,
    FOREIGN KEY (bibleVersionId) REFERENCES bible_versions(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear tabla de respuestas de onboarding
CREATE TABLE IF NOT EXISTS onboarding_responses (
    id VARCHAR(36) NOT NULL,
    userId VARCHAR(36) NOT NULL,
    appMotivations TEXT NOT NULL,
    spiritualJourney TEXT NOT NULL,
    focusAreas TEXT NOT NULL,
    spiritualPractices TEXT NOT NULL,
    dailyDevotionTime VARCHAR(50) NOT NULL,
    prayerFrequency VARCHAR(50) NOT NULL,
    dedicationTime VARCHAR(50) NOT NULL,
    preferredStudyMethods TEXT NOT NULL,
    wantsProgressTracking BOOLEAN DEFAULT FALSE,
    wantsPersonalizedRecommendations BOOLEAN DEFAULT FALSE,
    onboardingCompleted BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY UK_onboarding_responses_user (userId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear tabla de códigos de verificación
CREATE TABLE IF NOT EXISTS verification_codes (
    id VARCHAR(36) NOT NULL,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(5) NOT NULL,
    expiresAt TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX IDX_verification_codes_email (email),
    INDEX IDX_verification_codes_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear tabla de preferencias de notificaciones
CREATE TABLE IF NOT EXISTS notification_preferences (
    id VARCHAR(36) NOT NULL,
    userId VARCHAR(36) NOT NULL,
    enabled BOOLEAN DEFAULT FALSE,
    dailyVersesEnabled BOOLEAN DEFAULT TRUE,
    prayerRemindersEnabled BOOLEAN DEFAULT TRUE,
    studyRemindersEnabled BOOLEAN DEFAULT TRUE,
    eventNotificationsEnabled BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY UK_notification_preferences_user (userId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear tabla de suscripciones
CREATE TABLE IF NOT EXISTS subscriptions (
    id VARCHAR(36) NOT NULL,
    userId VARCHAR(36) NOT NULL,
    type ENUM('free', 'premium') DEFAULT 'free',
    paymentId VARCHAR(255),
    startDate TIMESTAMP NULL,
    endDate TIMESTAMP NULL,
    autoRenew BOOLEAN DEFAULT FALSE,
    isCancelled BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY UK_subscriptions_user (userId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear tabla de donaciones
CREATE TABLE IF NOT EXISTS donations (
    id VARCHAR(36) NOT NULL,
    userId VARCHAR(36),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    transactionId VARCHAR(255),
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    anonymousDonor BOOLEAN DEFAULT FALSE,
    message TEXT,
    email VARCHAR(255),
    name VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear índices adicionales
CREATE INDEX IDX_users_google_id ON users(googleId);
CREATE INDEX IDX_users_reset_token ON users(resetPasswordToken);

-- Insertar algunas denominaciones comunes
INSERT INTO denominations (id, name, description) VALUES
(UUID(), 'Católica', 'Iglesia Católica Romana'),
(UUID(), 'Protestante', 'Iglesias Protestantes'),
(UUID(), 'Evangélica', 'Iglesias Evangélicas'),
(UUID(), 'Pentecostal', 'Iglesias Pentecostales'),
(UUID(), 'Adventista', 'Iglesia Adventista del Séptimo Día'),
(UUID(), 'Otra', 'Otras denominaciones');

-- Insertar algunas versiones comunes de la Biblia
INSERT INTO bible_versions (id, name, abbreviation, language, description, year) VALUES
(UUID(), 'Reina Valera 1960', 'RVR1960', 'Español', 'Versión clásica en español', 1960),
(UUID(), 'Nueva Versión Internacional', 'NVI', 'Español', 'Traducción moderna y accesible', 1999),
(UUID(), 'Biblia de las Américas', 'LBLA', 'Español', 'Traducción literal moderna', 1986),
(UUID(), 'King James Version', 'KJV', 'Inglés', 'Versión clásica en inglés', 1611),
(UUID(), 'Nueva Traducción Viviente', 'NTV', 'Español', 'Traducción dinámica moderna', 2010);

-- Comentarios de las tablas
ALTER TABLE users COMMENT 'Tabla para almacenar la información de usuarios';
ALTER TABLE denominations COMMENT 'Tabla para almacenar las denominaciones religiosas';
ALTER TABLE bible_versions COMMENT 'Tabla para almacenar las diferentes versiones de la Biblia';
ALTER TABLE user_preferences COMMENT 'Tabla para almacenar las preferencias de usuario';
ALTER TABLE onboarding_responses COMMENT 'Tabla para almacenar las respuestas del proceso de onboarding';
ALTER TABLE notification_preferences COMMENT 'Tabla para almacenar las preferencias de notificaciones';
ALTER TABLE subscriptions COMMENT 'Tabla para almacenar las suscripciones de los usuarios';
ALTER TABLE donations COMMENT 'Tabla para almacenar las donaciones realizadas';

-- Permisos básicos
GRANT SELECT, INSERT, UPDATE, DELETE ON gpbible.* TO 'admin2024'@'localhost';
FLUSH PRIVILEGES; 