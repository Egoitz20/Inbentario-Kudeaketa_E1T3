<?php
declare(strict_types=1);

/**
 * Tabla mugimenduak: historial de ubicaciones de los equipos.
 * amaieraData = NULL significa "ubicación actual".
 * Un equipo solo puede tener una ubicación activa a la vez.
 */
class Mugimendua
{
    // Consulta base con JOIN para devolver también el nombre del aula, la etiqueta y el usuario
    private const SELECT =
        'SELECT m.id, m.gelaId, g.izena AS gela, m.gailuId, d.etiketa,
                m.erabiltzaileId, u.username, m.hasieraData, m.amaieraData
         FROM mugimenduak m
         JOIN gelak g          ON g.id = m.gelaId
         JOIN gailuak d        ON d.id = m.gailuId
         JOIN erabiltzaileak u ON u.id = m.erabiltzaileId';

    public function __construct(private PDO $pdo)
    {
    }

    /**
     * READ: devuelve el historial. Filtros opcionales:
     * gailuId (un equipo), gelaId (un aula), active (true = solo ubicaciones actuales).
     */
    public function guztiak(array $iragazkiak = []): array
    {
        $baldintzak  = [];
        $parametroak = [];

        if (isset($iragazkiak['gailuId'])) {
            $baldintzak[]  = 'm.gailuId = ?';
            $parametroak[] = $iragazkiak['gailuId'];
        }
        if (isset($iragazkiak['gelaId'])) {
            $baldintzak[]  = 'm.gelaId = ?';
            $parametroak[] = $iragazkiak['gelaId'];
        }
        if (!empty($iragazkiak['active'])) {
            $baldintzak[] = 'm.amaieraData IS NULL';
        }

        $sql = self::SELECT;
        if ($baldintzak) {
            $sql .= ' WHERE ' . implode(' AND ', $baldintzak);
        }
        $sql .= ' ORDER BY m.hasieraData DESC, m.id DESC';

        $st = $this->pdo->prepare($sql);
        $st->execute($parametroak);
        return $st->fetchAll();
    }

    /** READ: devuelve un movimiento, o null si no existe. */
    public function bilatu(int $id): ?array
    {
        $st = $this->pdo->prepare(self::SELECT . ' WHERE m.id = ?');
        $st->execute([$id]);
        return $st->fetch() ?: null;
    }

    /**
     * CREATE: mueve un equipo a otra aula.
     * Cierra la ubicación activa anterior y abre la nueva, todo en una transacción.
     * El usuario sale de la sesión (nunca lo envía el cliente).
     */
    public function sortu(array $sarrera, int $erabiltzaileId): array
    {
        // --- Validación de los datos recibidos ---
        $erroreak = [];
        $gelaId  = zenbakiaLortu($sarrera, 'gelaId', $erroreak, true);
        $gailuId = zenbakiaLortu($sarrera, 'gailuId', $erroreak, true);
        $data    = dataLortu($sarrera, 'hasieraData', $erroreak) ?? date('Y-m-d');   // por defecto, hoy
        if ($erroreak) {
            throw new ApiErrorea('Datos no válidos', 422, $erroreak);
        }

        $this->pdo->beginTransaction();
        try {
            // 1. El equipo debe existir y no estar de baja (FOR UPDATE bloquea la fila mientras dura la transacción)
            $st = $this->pdo->prepare('SELECT id, egoera FROM gailuak WHERE id = ? FOR UPDATE');
            $st->execute([$gailuId]);
            $gailua = $st->fetch();
            if (!$gailua) {
                throw new ApiErrorea('El equipo no existe', 404);
            }
            if ($gailua['egoera'] === 'Baja') {
                throw new ApiErrorea('Un equipo dado de baja no se puede mover', 422);
            }

            // 2. El aula de destino debe existir
            $st = $this->pdo->prepare('SELECT id FROM gelak WHERE id = ?');
            $st->execute([$gelaId]);
            if (!$st->fetch()) {
                throw new ApiErrorea('El aula no existe', 422);
            }

            // 3. Buscamos su ubicación activa actual y la cerramos
            $st = $this->pdo->prepare(
                'SELECT id, gelaId, hasieraData FROM mugimenduak
                 WHERE gailuId = ? AND amaieraData IS NULL FOR UPDATE'
            );
            $st->execute([$gailuId]);
            $aktiboa = $st->fetch();

            if ($aktiboa) {
                if ((int)$aktiboa['gelaId'] === $gelaId) {
                    throw new ApiErrorea('El equipo ya está en esa aula', 409);
                }
                if ($data < $aktiboa['hasieraData']) {
                    throw new ApiErrorea('La fecha no puede ser anterior al inicio de la ubicación actual', 422);
                }
                $st = $this->pdo->prepare('UPDATE mugimenduak SET amaieraData = ? WHERE id = ?');
                $st->execute([$data, $aktiboa['id']]);
            }

            // 4. Abrimos la nueva ubicación (amaieraData queda en NULL)
            $st = $this->pdo->prepare(
                'INSERT INTO mugimenduak (gelaId, gailuId, erabiltzaileId, hasieraData) VALUES (?, ?, ?, ?)'
            );
            $st->execute([$gelaId, $gailuId, $erabiltzaileId, $data]);
            $berriaId = (int)$this->pdo->lastInsertId();

            $this->pdo->commit();
        } catch (Throwable $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();   // algo falló: se deshace todo
            }
            throw $e;
        }

        return $this->bilatu($berriaId);
    }

    /** UPDATE (corregir fechas): comprueba el orden de las fechas y que no haya dos ubicaciones activas. */
    public function eguneratu(int $id, array $sarrera): array
    {
        $unekoa = $this->bilatu($id);
        if ($unekoa === null) {
            throw new ApiErrorea('No encontrado', 404);
        }
        if (!$sarrera) {
            throw new ApiErrorea('No hay campos que actualizar', 400);
        }

        // Mezclamos lo que ya había con lo nuevo y validamos las dos fechas
        $datuak   = array_merge($unekoa, $sarrera);
        $erroreak = [];
        $hasiera  = dataLortu($datuak, 'hasieraData', $erroreak, true);
        $amaiera  = dataLortu($datuak, 'amaieraData', $erroreak);   // null = ubicación actual
        if ($erroreak) {
            throw new ApiErrorea('Datos no válidos', 422, $erroreak);
        }

        // La fecha de fin no puede ser anterior a la de inicio
        if ($amaiera !== null && $amaiera < $hasiera) {
            throw new ApiErrorea('La fecha de fin no puede ser anterior a la de inicio', 422);
        }

        // Si queda sin fecha de fin, no puede haber otra ubicación activa del mismo equipo
        if ($amaiera === null) {
            $st = $this->pdo->prepare(
                'SELECT COUNT(*) FROM mugimenduak WHERE gailuId = ? AND amaieraData IS NULL AND id <> ?'
            );
            $st->execute([$unekoa['gailuId'], $id]);
            if ((int)$st->fetchColumn() > 0) {
                throw new ApiErrorea('El equipo ya tiene otra ubicación activa', 409);
            }
        }

        $st = $this->pdo->prepare('UPDATE mugimenduak SET hasieraData = ?, amaieraData = ? WHERE id = ?');
        $st->execute([$hasiera, $amaiera, $id]);

        return $this->bilatu($id);
    }

    /** DELETE: borra un movimiento del historial. */
    public function ezabatu(int $id): void
    {
        if ($this->bilatu($id) === null) {
            throw new ApiErrorea('No encontrado', 404);
        }

        $st = $this->pdo->prepare('DELETE FROM mugimenduak WHERE id = ?');
        $st->execute([$id]);
    }
}