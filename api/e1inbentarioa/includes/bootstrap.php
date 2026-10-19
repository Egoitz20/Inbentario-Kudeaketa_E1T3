<?php
declare(strict_types=1);

// Los errores no se muestran al cliente (solo se guardan en el log del servidor)
ini_set('display_errors', '0');

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/helpers.php';

// Carga automática de clases: al escribir "new Gailua(...)" PHP busca classes/Gailua.php
spl_autoload_register(function (string $klasea): void {
    $fitxategia = __DIR__ . '/../classes/' . $klasea . '.php';
    if (preg_match('/^[A-Za-z]+$/', $klasea) && is_file($fitxategia)) {
        require $fitxategia;
    }
});

// ---------- CORS ----------
// Permite que el frontend (otro origen) llame a la API usando cookies.
// Solo se aceptan los orígenes de BAIMENDUTAKO_JATORRIAK (nunca "*").
$jatorria = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($jatorria, BAIMENDUTAKO_JATORRIAK, true)) {
    header('Access-Control-Allow-Origin: ' . $jatorria);
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Max-Age: 600');
}
header('Vary: Origin');

// Antes de enviar JSON entre orígenes distintos, el navegador hace una petición OPTIONS de prueba
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ---------- Manejo central de errores ----------
// Las clases lanzan excepciones (throw) y aquí se convierten en respuestas JSON.
set_exception_handler(function (Throwable $e): void {
    if ($e instanceof ApiErrorea) {
        jsonErrorea($e->getMessage(), $e->getCode(), $e->xehetasunak);   // errores controlados (404, 422...)
    }
    if ($e instanceof PDOException) {
        datuBaseErrorea($e);                                              // errores de MySQL
    }
    error_log($e->getMessage());
    jsonErrorea('Error interno del servidor', 500);                       // cualquier otro error
});