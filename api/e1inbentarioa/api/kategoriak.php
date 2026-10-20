<?php
declare(strict_types=1);
require __DIR__ . '/../includes/bootstrap.php';

// Categorías de equipamiento.
// GET [?id=]   lista todos o devuelve uno   (cualquier usuario logueado)
// POST         crea                         (solo admin)
// PUT ?id=     edita                        (solo admin)
// DELETE ?id=  borra                        (solo admin)

saioaBeharrezkoa();                  // sin sesión → 401
$kategoria = new Kategoria(datuBasea());
$id = idUrlan();                    // el ?id= de la URL (o null)

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        if ($id === null) {
            jsonIrten($kategoria->guztiak());
        }
        $lerroa = $kategoria->bilatu($id);
        $lerroa ? jsonIrten($lerroa) : jsonErrorea('No encontrado', 404);

    case 'POST':
        rolaBeharrezkoa('admin');
        jsonIrten($kategoria->sortu(gorputzaIrakurri()), 201);

    case 'PUT':
        rolaBeharrezkoa('admin');
        jsonIrten($kategoria->eguneratu(idBeharrezkoa($id), gorputzaIrakurri()));

    case 'DELETE':
        rolaBeharrezkoa('admin');
        $kategoria->ezabatu(idBeharrezkoa($id));
        jsonIrten(['ok' => true]);

    default:
        jsonErrorea('Método no permitido', 405);
}