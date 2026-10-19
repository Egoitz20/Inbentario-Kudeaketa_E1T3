<?php
declare(strict_types=1);
require __DIR__ . '/../includes/bootstrap.php';

// Equipos físicos. Etiqueta obligatoria y única; solo el admin escribe.
// GET [?id=]   lista todos o devuelve uno      (cualquier usuario logueado)
// POST         crea y ubica en el Almacén      (solo admin)
// PUT ?id=     edita                           (solo admin)
// DELETE ?id=  borra                           (solo admin)

$erabiltzailea = saioaBeharrezkoa();     // sin sesión → 401
$gailua        = new Gailua(datuBasea());
$id            = idUrlan();

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        if ($id === null) {
            jsonIrten($gailua->guztiak());
        }
        $lerroa = $gailua->bilatu($id);
        $lerroa ? jsonIrten($lerroa) : jsonErrorea('No encontrado', 404);

    case 'POST':
        rolaBeharrezkoa('admin');
        // Pasamos el id del usuario de la sesión: quedará registrado en el movimiento inicial
        jsonIrten($gailua->sortu(gorputzaIrakurri(), $erabiltzailea['id']), 201);

    case 'PUT':
        rolaBeharrezkoa('admin');
        jsonIrten($gailua->eguneratu(idBeharrezkoa($id), gorputzaIrakurri()));

    case 'DELETE':
        rolaBeharrezkoa('admin');
        $gailua->ezabatu(idBeharrezkoa($id));
        jsonIrten(['ok' => true]);

    default:
        jsonErrorea('Método no permitido', 405);
}