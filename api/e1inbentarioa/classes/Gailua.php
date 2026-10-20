<?php
declare(strict_types=1);

/**
 * Tabla gailuak: unidades físicas inventariadas (cada ordenador, monitor, etc.).
 * Reglas del negocio:
 *  - La etiqueta es obligatoria y única.
 *  - Todo equipo nuevo se ubica en el aula Almacén.
 *  - Al darlo de baja se cierra su ubicación activa.
 */
class Gailua
{
    private const EGOERAK = ['Operatiboa', 'Matxuratua', 'Baja'];

    public function __construct(private PDO $pdo)
    {
    }

    /** READ: devuelve todos los equipos. */
    public function guztiak(): array
    {
        return $this->pdo->query(
            'SELECT id, baliabideId, etiketa, erosketaData, egoera FROM gailuak ORDER BY id'
        )->fetchAll();
    }

    /** READ: devuelve un equipo, o null si no existe. */
    public function bilatu(int $id): ?array
    {
        $st = $this->pdo->prepare(
            'SELECT id, baliabideId, etiketa, erosketaData, egoera FROM gailuak WHERE id = ?'
        );
        $st->execute([$id]);
        return $st->fetch() ?: null;
    }

    /**
     * CREATE: valida (etiqueta obligatoria y única), inserta el equipo y lo ubica en el Almacén.
     * Las dos operaciones van en una transacción: o se hacen las dos o ninguna.
     */
    public function sortu(array $sarrera, int $erabiltzaileId): array
    {
        $datuak = $this->balidatu($sarrera, null);

        $this->pdo->beginTransaction();
        try {
            $st = $this->pdo->prepare(
                'INSERT INTO gailuak (baliabideId, etiketa, erosketaData, egoera) VALUES (?, ?, ?, ?)'
            );
            $st->execute([
                $datuak['baliabideId'],
                $datuak['etiketa'],
                $datuak['erosketaData'],
                $datuak['egoera'],
            ]);
            $id = (int)$this->pdo->lastInsertId();

            // Un equipo dado de baja no tiene ubicación
            if ($datuak['egoera'] !== 'Baja') {
                $this->ubicarEnAlmacen($id, $erabiltzaileId);
            }

            $this->pdo->commit();
        } catch (Throwable $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();   // algo falló: se deshace todo
            }
            throw $e;
        }

        return $this->bilatu($id);
    }

    /** UPDATE: los campos que no se envían conservan su valor actual. Pasar a "Baja" cierra su ubicación activa. */
    public function eguneratu(int $id, array $sarrera): array
    {
        $unekoa = $this->bilatu($id);
        if ($unekoa === null) {
            throw new ApiErrorea('No encontrado', 404);
        }
        if (!$sarrera) {
            throw new ApiErrorea('No hay campos que actualizar', 400);
        }

        // Mezclamos lo que ya había con lo nuevo y validamos el resultado completo.
        // Pasamos $id para que la comprobación de etiqueta única ignore al propio equipo.
        $datuak = $this->balidatu(array_merge($unekoa, $sarrera), $id);

        $this->pdo->beginTransaction();
        try {
            // Si pasa a Baja, se cierra su ubicación activa (amaieraData = hoy)
            if ($datuak['egoera'] === 'Baja') {
                $st = $this->pdo->prepare(
                    'UPDATE mugimenduak SET amaieraData = GREATEST(hasieraData, CURDATE())
                     WHERE gailuId = ? AND amaieraData IS NULL'
                );
                $st->execute([$id]);
            }

            $st = $this->pdo->prepare(
                'UPDATE gailuak SET baliabideId = ?, etiketa = ?, erosketaData = ?, egoera = ? WHERE id = ?'
            );
            $st->execute([
                $datuak['baliabideId'],
                $datuak['etiketa'],
                $datuak['erosketaData'],
                $datuak['egoera'],
                $id,
            ]);

            $this->pdo->commit();
        } catch (Throwable $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            throw $e;
        }

        return $this->bilatu($id);
    }

    /** DELETE: si el equipo tiene movimientos, MySQL lo impide y la API responde 409. */
    public function ezabatu(int $id): void
    {
        if ($this->bilatu($id) === null) {
            throw new ApiErrorea('No encontrado', 404);
        }

        $st = $this->pdo->prepare('DELETE FROM gailuak WHERE id = ?');
        $st->execute([$id]);
    }

    /**
     * Valida los campos y comprueba que la etiqueta no esté repetida.
     * $salbuetsiId = id del propio equipo al editar (para que no choque consigo mismo).
     */
    private function balidatu(array $sarrera, ?int $salbuetsiId): array
    {
        $erroreak = [];

        $baliabideId  = zenbakiaLortu($sarrera, 'baliabideId', $erroreak, true);
        $etiketa      = testuaLortu($sarrera, 'etiketa', 50, $erroreak, true);   // obligatoria
        $erosketaData = dataLortu($sarrera, 'erosketaData', $erroreak);          // opcional
        $egoera       = testuaLortu($sarrera, 'egoera', 50, $erroreak) ?? 'Operatiboa';

        if (!in_array($egoera, self::EGOERAK, true)) {
            $erroreak['egoera'] = 'Valores permitidos: ' . implode(', ', self::EGOERAK);
        }
        if ($erroreak) {
            throw new ApiErrorea('Datos no válidos', 422, $erroreak);
        }

        // Etiqueta única: buscamos otro equipo con la misma etiqueta
        $sql        = 'SELECT id FROM gailuak WHERE etiketa = ?';
        $parametroak = [$etiketa];
        if ($salbuetsiId !== null) {
            $sql         .= ' AND id <> ?';
            $parametroak[] = $salbuetsiId;
        }
        $st = $this->pdo->prepare($sql);
        $st->execute($parametroak);
        if ($st->fetch()) {
            throw new ApiErrorea('Ya existe un equipo con esa etiqueta', 409, ['etiketa' => 'Etiqueta repetida']);
        }

        return [
            'baliabideId'  => $baliabideId,
            'etiketa'      => $etiketa,
            'erosketaData' => $erosketaData,
            'egoera'       => $egoera,
        ];
    }

    /** Crea el primer movimiento del equipo: lo coloca en el aula Almacén (si existe). */
    private function ubicarEnAlmacen(int $gailuId, int $erabiltzaileId): void
    {
        $st = $this->pdo->prepare('SELECT id FROM gelak WHERE izena = ? LIMIT 1');
        $st->execute([GELA_ALMAZENA]);
        $gelaId = $st->fetchColumn();
        if ($gelaId === false) {
            return;
        }

        $st = $this->pdo->prepare(
            'INSERT INTO mugimenduak (gelaId, gailuId, erabiltzaileId, hasieraData)
             VALUES (?, ?, ?, CURDATE())'
        );
        $st->execute([$gelaId, $gailuId, $erabiltzaileId]);
    }
}