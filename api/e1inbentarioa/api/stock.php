<?php
declare(strict_types=1);
require __DIR__ . '/../includes/bootstrap.php';

// GET /api/stock.php → existencias por recurso y ocupación actual por aula
saioaBeharrezkoa();
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonErrorea('Método no permitido', 405);
}
$pdo = datuBasea();

// Por cada recurso: total de equipos, activos (no de baja) y activos sin ubicación actual
$baliabideka = $pdo->query(
    "SELECT b.id AS baliabideId, b.izena, k.izena AS kategoria,
            COUNT(g.id)                                              AS total,
            COALESCE(SUM(g.egoera <> 'Baja'), 0)                     AS activos,
            COALESCE(SUM(g.egoera <> 'Baja' AND m.id IS NULL), 0)    AS sin_ubicar
     FROM baliabideak b
     JOIN kategoriak k       ON k.id = b.kategoriaId
     LEFT JOIN gailuak g     ON g.baliabideId = b.id
     LEFT JOIN mugimenduak m ON m.gailuId = g.id AND m.amaieraData IS NULL
     GROUP BY b.id, b.izena, k.izena
     ORDER BY b.id"
)->fetchAll();

// Por cada aula: cuántos equipos hay ahora mismo (movimientos sin fecha de fin)
$gelaka = $pdo->query(
    "SELECT ge.id AS gelaId, ge.izena, ge.taldea, COUNT(m.id) AS equipos
     FROM gelak ge
     LEFT JOIN mugimenduak m ON m.gelaId = ge.id AND m.amaieraData IS NULL
     GROUP BY ge.id, ge.izena, ge.taldea
     ORDER BY ge.id"
)->fetchAll();

jsonIrten(['por_recurso' => $baliabideka, 'por_aula' => $gelaka]);