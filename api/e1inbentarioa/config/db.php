<?php
declare(strict_types=1);

const DB_OSTALARIA     = 'localhost';
const DB_IZENA         = 'e1inbentarioa';
const DB_ERABILTZAILEA = 'root';
const DB_PASAHITZA     = 'ikasle123';

// Aula donde se ubican por defecto los equipos nuevos
const GELA_ALMAZENA = 'Almacén';

// Orígenes del frontend autorizados a llamar a la API con cookies (CORS)
const BAIMENDUTAKO_JATORRIAK = [
    'http://localhost',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://talde3.edu',
    'https://talde3.edu',
    'http://www.talde3.edu',
    'https://www.talde3.edu',
    'http://server.talde3.edu',
    'https://server.talde3.edu',
    'http://192.168.207.33',
    'https://192.168.207.33',
];

function datuBasea(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $pdo = new PDO(
            'mysql:host=' . DB_OSTALARIA . ';dbname=' . DB_IZENA . ';charset=utf8mb4',
            DB_ERABILTZAILEA,
            DB_PASAHITZA,
            [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]
        );
    }
    return $pdo;
}