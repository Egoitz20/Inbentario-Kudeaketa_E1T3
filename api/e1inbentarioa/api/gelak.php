<?php
declare(strict_types=1);
require __DIR__ . '/../includes/bootstrap.php';

// Aulas y espacios físicos.
// GET [?id=]   lista todos o devuelve uno   (cualquier usuario logueado)
// POST         crea                         (solo admin)
// PUT ?id=     edita                        (solo admin)
// DELETE ?id=  borra                        (solo admin)

saioaBeharrezkoa();                  // sin sesión → 401
$gela = new Gela(datuBasea());
$id = idUrlan();                    // el ?id= de la URL (o null)

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        if ($id === null) {
            jsonIrten($gela->guztiak());
        }
        $lerroa = $gela->bilatu($id);
        $lerroa ? jsonIrten($lerroa) : jsonErrorea('No encontrado', 404);

    case 'POST':
        rolaBeharrezkoa('admin');
        jsonIrten($gela->sortu(gorputzaIrakurri()), 201);

    case 'PUT':
        rolaBeharrezkoa('admin');
        jsonIrten($gela->eguneratu(idBeharrezkoa($id), gorputzaIrakurri()));

    case 'DELETE':
        rolaBeharrezkoa('admin');
        $gela->ezabatu(idBeharrezkoa($id));
        jsonIrten(['ok' => true]);

    default:
        jsonErrorea('Método no permitido', 405);
}