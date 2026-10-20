<?php
declare(strict_types=1);
require __DIR__ . '/../includes/bootstrap.php';

// Recursos: modelos o perfiles de equipo.
// GET [?id=]   lista todos o devuelve uno   (cualquier usuario logueado)
// POST         crea                         (solo admin)
// PUT ?id=     edita                        (solo admin)
// DELETE ?id=  borra                        (solo admin)

saioaBeharrezkoa();                  // sin sesión → 401
$baliabidea = new Baliabidea(datuBasea());
$id = idUrlan();                    // el ?id= de la URL (o null)

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        if ($id === null) {
            jsonIrten($baliabidea->guztiak());
        }
        $lerroa = $baliabidea->bilatu($id);
        $lerroa ? jsonIrten($lerroa) : jsonErrorea('No encontrado', 404);

    case 'POST':
        rolaBeharrezkoa('admin');
        jsonIrten($baliabidea->sortu(gorputzaIrakurri()), 201);

    case 'PUT':
        rolaBeharrezkoa('admin');
        jsonIrten($baliabidea->eguneratu(idBeharrezkoa($id), gorputzaIrakurri()));

    case 'DELETE':
        rolaBeharrezkoa('admin');
        $baliabidea->ezabatu(idBeharrezkoa($id));
        jsonIrten(['ok' => true]);

    default:
        jsonErrorea('Método no permitido', 405);
}