<?php
declare(strict_types=1);

// ============================================================
// FUNCIONES AUXILIARES (las usan todos los endpoints y clases)
// ============================================================


// ---------- 1. Respuestas JSON ----------

/** Envía una respuesta JSON con su código HTTP y termina el script. */
function jsonIrten(mixed $datuak, int $kodea = 200): never
{
    http_response_code($kodea);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($datuak, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/** Envía un error en JSON: {"error": "mensaje", "details": {...}} */
function jsonErrorea(string $mezua, int $kodea = 400, array $xehetasunak = []): never
{
    $irteera = ['error' => $mezua];
    if ($xehetasunak) {
        $irteera['details'] = $xehetasunak;
    }
    jsonIrten($irteera, $kodea);
}


// ---------- 2. Datos que llegan del cliente ----------

/** Lee el cuerpo JSON de la petición (POST y PUT) y lo devuelve como array. */
function gorputzaIrakurri(): array
{
    // Exigir application/json dificulta los ataques CSRF desde formularios
    $mota = $_SERVER['CONTENT_TYPE'] ?? '';
    if (stripos($mota, 'application/json') === false) {
        jsonErrorea('Content-Type debe ser application/json', 415);
    }

    $testua = file_get_contents('php://input');
    $datuak = json_decode($testua === false ? '' : $testua, true);
    if (!is_array($datuak)) {
        jsonErrorea('El cuerpo debe ser un objeto JSON válido', 400);
    }
    return $datuak;
}

/** Lee un número entero positivo de la URL (?gailuId=3). Devuelve null si no viene. */
function zenbakiaUrlan(string $izena): ?int
{
    if (!isset($_GET[$izena])) {
        return null;
    }
    $balioa = filter_var($_GET[$izena], FILTER_VALIDATE_INT);
    if ($balioa === false || $balioa < 1) {
        jsonErrorea("$izena no válido", 400);
    }
    return $balioa;
}

/** Lee ?id= de la URL. Devuelve null si no viene. */
function idUrlan(): ?int
{
    return zenbakiaUrlan('id');
}

/** PUT y DELETE necesitan ?id= obligatoriamente. */
function idBeharrezkoa(?int $id): int
{
    if ($id === null) {
        jsonErrorea('Falta el parámetro id', 400);
    }
    return $id;
}


// ---------- 3. Errores de MySQL ----------

/** Convierte los errores de MySQL (claves foráneas, valores únicos) en respuestas HTTP claras. */
function datuBaseErrorea(PDOException $e): never
{
    error_log($e->getMessage());
    $kodea = $e->errorInfo[1] ?? 0;

    if ($kodea === 1062) {
        jsonErrorea('Ya existe un registro con ese valor único (p. ej. etiqueta o nombre de usuario)', 409);
    }
    if ($kodea === 1451) {
        jsonErrorea('No se puede borrar: tiene registros relacionados', 409);
    }
    if ($kodea === 1452) {
        jsonErrorea('Referencia inexistente (clave foránea no válida)', 422);
    }
    jsonErrorea('Error de base de datos', 500);
}


// ---------- 4. Sesión y roles ----------

/** Arranca la sesión PHP con una cookie segura. */
function saioaHasi(): void
{
    if (session_status() === PHP_SESSION_NONE) {
        session_set_cookie_params([
            'lifetime' => 0,
            'path'     => '/',
            'secure'   => true,
            'httponly' => true,
            'samesite' => 'None',
        ]);
        session_start();
    }
}

/** Exige estar logueado (401 si no). Devuelve los datos del usuario: id, username, rol. */
function saioaBeharrezkoa(): array
{
    saioaHasi();
    if (!isset($_SESSION['user'])) {
        jsonErrorea('Debes iniciar sesión', 401);
    }
    return $_SESSION['user'];
}

/** Exige un rol concreto, por ejemplo 'admin' (403 si el usuario no lo tiene). */
function rolaBeharrezkoa(string $rola): array
{
    $erabiltzailea = saioaBeharrezkoa();
    if ($erabiltzailea['rol'] !== $rola) {
        jsonErrorea('No tienes permisos para esta operación', 403);
    }
    return $erabiltzailea;
}


// ---------- 5. Validación de campos ----------
// Cada función lee un campo de $sarrera, lo valida y devuelve el valor limpio.
// Si hay un problema, lo anota en $erroreak y devuelve null.

/** Campo de texto: se recorta con trim y se comprueba la longitud máxima. */
function testuaLortu(array $sarrera, string $eremua, int $max, array &$erroreak, bool $beharrezkoa = false): ?string
{
    $balioa = $sarrera[$eremua] ?? null;
    if (is_string($balioa)) {
        $balioa = trim($balioa);
    }

    if ($balioa === null || $balioa === '') {
        if ($beharrezkoa) {
            $erroreak[$eremua] = 'Campo obligatorio';
        }
        return null;
    }
    if (!is_scalar($balioa) || is_bool($balioa)) {
        $erroreak[$eremua] = 'Valor no válido';
        return null;
    }

    $balioa = (string)$balioa;
    if (mb_strlen($balioa) > $max) {
        $erroreak[$eremua] = "Máximo $max caracteres";
        return null;
    }
    return $balioa;
}

/** Campo numérico: debe ser un entero positivo (por ejemplo, un id). */
function zenbakiaLortu(array $sarrera, string $eremua, array &$erroreak, bool $beharrezkoa = false): ?int
{
    $balioa = $sarrera[$eremua] ?? null;

    if ($balioa === null || $balioa === '') {
        if ($beharrezkoa) {
            $erroreak[$eremua] = 'Campo obligatorio';
        }
        return null;
    }

    $zenbakia = is_bool($balioa) ? false : filter_var($balioa, FILTER_VALIDATE_INT);
    if ($zenbakia === false || $zenbakia < 1) {
        $erroreak[$eremua] = 'Debe ser un entero positivo';
        return null;
    }
    return $zenbakia;
}

/** Campo fecha: formato AAAA-MM-DD y que la fecha exista de verdad. */
function dataLortu(array $sarrera, string $eremua, array &$erroreak, bool $beharrezkoa = false): ?string
{
    $balioa = $sarrera[$eremua] ?? null;
    if (is_string($balioa)) {
        $balioa = trim($balioa);
    }

    if ($balioa === null || $balioa === '') {
        if ($beharrezkoa) {
            $erroreak[$eremua] = 'Campo obligatorio';
        }
        return null;
    }

    $data = is_string($balioa) ? DateTime::createFromFormat('!Y-m-d', $balioa) : false;
    if (!$data || $data->format('Y-m-d') !== $balioa) {
        $erroreak[$eremua] = 'Fecha no válida (formato AAAA-MM-DD)';
        return null;
    }
    return $balioa;
}