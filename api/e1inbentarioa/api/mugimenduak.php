<?php
declare(strict_types=1);
require __DIR__ . '/../includes/bootstrap.php';

// Historial de ubicaciones de los equipos.
// GET [?id=|gailuId=|gelaId=|active=1]   historial        (cualquier usuario logueado)
// POST {gelaId, gailuId, hasieraData?}   mueve un equipo  (admin o user)
// PUT ?id=                               corrige fechas   (solo admin)
// DELETE ?id=                            borra            (solo admin)

$erabiltzailea = saioaBeharrezkoa();     // sin sesión → 401
$mugimendua    = new Mugimendua(datuBasea());
$id            = idUrlan();

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        if ($id !== null) {
            $lerroa = $mugimendua->bilatu($id);
            $lerroa ? jsonIrten($lerroa) : jsonErrorea('No encontrado', 404);
        }
        // Filtros opcionales por la URL
        jsonIrten($mugimendua->guztiak([
            'gailuId' => zenbakiaUrlan('gailuId'),
            'gelaId'  => zenbakiaUrlan('gelaId'),
            'active'  => ($_GET['active'] ?? '') === '1',
        ]));

    case 'POST':
        // Cualquier usuario logueado puede mover equipos; el usuario se toma de la sesión
        jsonIrten($mugimendua->sortu(gorputzaIrakurri(), $erabiltzailea['id']), 201);

    case 'PUT':
        rolaBeharrezkoa('admin');
        jsonIrten($mugimendua->eguneratu(idBeharrezkoa($id), gorputzaIrakurri()));

    case 'DELETE':
        rolaBeharrezkoa('admin');
        $mugimendua->ezabatu(idBeharrezkoa($id));
        jsonIrten(['ok' => true]);

    default:
        jsonErrorea('Método no permitido', 405);
}