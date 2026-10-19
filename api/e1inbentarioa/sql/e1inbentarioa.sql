-- ============================================================
-- DATU-BASEAREN ESKEMA: Eskolako Inbentario Kudeatzailea
-- Motorra: MariaDB 10.2+ / MySQL 8.0.16+
-- ============================================================

CREATE DATABASE IF NOT EXISTS e1inbentarioa
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE e1inbentarioa;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. kategoriak
DROP TABLE IF EXISTS kategoriak;
CREATE TABLE kategoriak (
    id    INT AUTO_INCREMENT PRIMARY KEY,
    izena VARCHAR(100) NOT NULL,
    CONSTRAINT uq_kategoriak_izena UNIQUE (izena)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. baliabideak (ekipo-eredua)
DROP TABLE IF EXISTS baliabideak;
CREATE TABLE baliabideak (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    kategoriaId  INT NOT NULL,
    izena        VARCHAR(150) NOT NULL,
    deskribapena TEXT NULL,
    marka        VARCHAR(100) NULL,
    modeloa      VARCHAR(100) NULL,
    CONSTRAINT fk_baliabideak_kategoriak
        FOREIGN KEY (kategoriaId) REFERENCES kategoriak(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. gailuak (unitate fisikoak; erosketaData = erosketa-data)
DROP TABLE IF EXISTS gailuak;
CREATE TABLE gailuak (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    baliabideId  INT NOT NULL,
    etiketa      VARCHAR(50) NOT NULL,
    erosketaData DATE NULL,
    egoera       ENUM('Operatiboa', 'Matxuratua', 'Baja') NOT NULL DEFAULT 'Operatiboa',
    CONSTRAINT uq_gailuak_etiketa UNIQUE (etiketa),
    CONSTRAINT ck_gailuak_etiketa CHECK (CHAR_LENGTH(TRIM(etiketa)) > 0),
    CONSTRAINT fk_gailuak_baliabideak
        FOREIGN KEY (baliabideId) REFERENCES baliabideak(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. gelak
DROP TABLE IF EXISTS gelak;
CREATE TABLE gelak (
    id     INT AUTO_INCREMENT PRIMARY KEY,
    izena  VARCHAR(100) NOT NULL,
    taldea VARCHAR(100) NULL,
    CONSTRAINT uq_gelak_izena UNIQUE (izena)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. erabiltzaileak (roles: admin / user)
DROP TABLE IF EXISTS erabiltzaileak;
CREATE TABLE erabiltzaileak (
    id        INT AUTO_INCREMENT PRIMARY KEY,
    username  VARCHAR(50) NOT NULL,
    pasahitza VARCHAR(255) NOT NULL, -- bcrypt
    rol       ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    CONSTRAINT uq_erabiltzaileak_username UNIQUE (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. mugimenduak (kokapen-historia; amaieraData NULL = uneko kokapena)
DROP TABLE IF EXISTS mugimenduak;
CREATE TABLE mugimenduak (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    gelaId         INT NOT NULL,
    gailuId        INT NOT NULL,
    erabiltzaileId INT NOT NULL,
    hasieraData    DATE NOT NULL,
    amaieraData    DATE NULL,
    -- Gailu bakoitzak kokapen aktibo bakarra: indize bakarra, NULL anitz onartzen ditu
    gailuAktiboId  INT AS (IF(amaieraData IS NULL, gailuId, NULL)) STORED,
    CONSTRAINT uq_mugimenduak_aktiboa UNIQUE (gailuAktiboId),
    CONSTRAINT ck_mugimenduak_datak CHECK (amaieraData IS NULL OR amaieraData >= hasieraData),
    CONSTRAINT fk_mugimenduak_gelak
        FOREIGN KEY (gelaId) REFERENCES gelak(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    -- RESTRICT: MySQL-k ez du CASCADE uzten STORED zutabe baten oinarrizko zutabean
    CONSTRAINT fk_mugimenduak_gailuak
        FOREIGN KEY (gailuId) REFERENCES gailuak(id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_mugimenduak_erabiltzaileak
        FOREIGN KEY (erabiltzaileId) REFERENCES erabiltzaileak(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------
-- Hasierako datuak (GELA_ALMAZENA = 'Almacén' db.php-n)
-- ------------------------------------------------------------

-- Lehen administratzailea: erabiltzailea 'admin', pasahitza 'admin1234'
-- (bcrypt hash-a; aldatu pasahitza lehen saio-hasieraren ondoren)
INSERT INTO erabiltzaileak (username, pasahitza, rol) VALUES
    ('admin', '$2y$10$MVNcsjHKmmpwXw4TedvMj.fC4J1QI2wsbgsTQB4iZqoYFxlM9Xy.W', 'admin');