<?php
declare(strict_types=1);
require __DIR__ . '/../includes/bootstrap.php';

// POST /api/auth.php?action=login   {"username": "...", "pasahitza": "..."}
// POST /api/auth.php?action=logout
// GET  /api/auth.php?action=me      (devuelve el usuario de la sesión)
// Nota: el login ya no se admite por GET; se hace por POST con JSON.

/**
 * Comprueba usuario y contraseña. Si son correctos abre la sesión y devuelve
 * los datos del usuario (id, username, rol). Si no, responde 401.
 * Lo usan las dos formas de entrar: POST con JSON y GET con parámetros en la URL.
 */
function saioaIreki(string $username, string $pasahitza): never
{
    if ($username === '' || $pasahitza === '') {
        jsonErrorea('Usuario y contraseña obligatorios', 422);
    }

    // Comprobamos las credenciales contra la base de datos
    $erabiltzailea = (new Erabiltzailea(datuBasea()))->autentifikatu($username, $pasahitza);
    if ($erabiltzailea === null) {
        jsonErrorea('Credenciales incorrectas', 401);
    }

    // Login correcto: iniciamos sesión y guardamos al usuario en ella
    saioaHasi();
    session_regenerate_id(true);          // id de sesión nuevo (evita fijación de sesión)
    $_SESSION['user'] = $erabiltzailea;
    jsonIrten($erabiltzailea);
}

$ekintza = $_GET['action'] ?? '';
$metodoa = $_SERVER['REQUEST_METHOD'];

switch ($ekintza) {
    case 'login':
        if ($metodoa !== 'POST') {
            jsonErrorea('Método no permitido', 405);
        }
        // Usuario y contraseña vienen en el cuerpo JSON
        $sarrera = gorputzaIrakurri();
        saioaIreki(
            is_string($sarrera['username'] ?? null) ? trim($sarrera['username']) : '',
            is_string($sarrera['pasahitza'] ?? null) ? $sarrera['pasahitza'] : ''
        );

    case 'logout':
        if ($metodoa !== 'POST') {
            jsonErrorea('Método no permitido', 405);
        }
        saioaHasi();
        $_SESSION = [];                       // vaciamos los datos de la sesión
        session_destroy();
        jsonIrten(['ok' => true]);

    case 'me':
        if ($metodoa !== 'GET') {
            jsonErrorea('Método no permitido', 405);
        }
        jsonIrten(saioaBeharrezkoa());

    default:
        jsonErrorea('Acción no válida (login, logout, me)', 400);
}