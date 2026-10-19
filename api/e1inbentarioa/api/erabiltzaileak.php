<?php
declare(strict_types=1);
require __DIR__ . '/../includes/bootstrap.php';

// Usuarios. TODO este endpoint es solo para el administrador.
// GET [?id=]   lista todos o devuelve uno
// POST         alta de usuario
// PUT ?id=     edita
// DELETE ?id=  borra

$ni            = rolaBeharrezkoa('admin');    // sin sesión → 401; si no es admin → 403
$erabiltzailea = new Erabiltzailea(datuBasea());
$id            = idUrlan();

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        if ($id === null) {
            jsonIrten($erabiltzailea->guztiak());
        }
        $lerroa = $erabiltzailea->bilatu($id);
        $lerroa ? jsonIrten($lerroa) : jsonErrorea('No encontrado', 404);

    case 'POST':
        jsonIrten($erabiltzailea->sortu(gorputzaIrakurri()), 201);

    case 'PUT':
        // Pasamos nuestro id para impedir que el admin se quite el rol a sí mismo
        jsonIrten($erabiltzailea->eguneratu(idBeharrezkoa($id), gorputzaIrakurri(), $ni['id']));

    case 'DELETE':
        // Pasamos nuestro id para impedir que el admin se borre a sí mismo
        $erabiltzailea->ezabatu(idBeharrezkoa($id), $ni['id']);
        jsonIrten(['ok' => true]);

    default:
        jsonErrorea('Método no permitido', 405);
}