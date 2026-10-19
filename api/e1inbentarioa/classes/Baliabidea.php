<?php
declare(strict_types=1);

/** Tabla baliabideak: modelo o perfil de equipo (los equipos físicos de gailuak cuelgan de él). */
class Baliabidea
{
    public function __construct(private PDO $pdo)
    {
    }

    /** READ: devuelve todos los recursos. */
    public function guztiak(): array
    {
        return $this->pdo->query(
            'SELECT id, kategoriaId, izena, deskribapena, marka, modeloa FROM baliabideak ORDER BY id'
        )->fetchAll();
    }

    /** READ: devuelve un recurso, o null si no existe. */
    public function bilatu(int $id): ?array
    {
        $st = $this->pdo->prepare(
            'SELECT id, kategoriaId, izena, deskribapena, marka, modeloa FROM baliabideak WHERE id = ?'
        );
        $st->execute([$id]);
        return $st->fetch() ?: null;
    }

    /** CREATE: valida, inserta y devuelve la fila creada. Si la categoría no existe, MySQL da error 1452 (422). */
    public function sortu(array $sarrera): array
    {
        $datuak = $this->balidatu($sarrera);

        $st = $this->pdo->prepare(
            'INSERT INTO baliabideak (kategoriaId, izena, deskribapena, marka, modeloa) VALUES (?, ?, ?, ?, ?)'
        );
        $st->execute([
            $datuak['kategoriaId'],
            $datuak['izena'],
            $datuak['deskribapena'],
            $datuak['marka'],
            $datuak['modeloa'],
        ]);

        return $this->bilatu((int)$this->pdo->lastInsertId());
    }

    /** UPDATE: los campos que no se envían conservan su valor actual. */
    public function eguneratu(int $id, array $sarrera): array
    {
        $unekoa = $this->bilatu($id);
        if ($unekoa === null) {
            throw new ApiErrorea('No encontrado', 404);
        }
        if (!$sarrera) {
            throw new ApiErrorea('No hay campos que actualizar', 400);
        }

        // Mezclamos lo que ya había con lo nuevo y validamos el resultado completo
        $datuak = $this->balidatu(array_merge($unekoa, $sarrera));

        $st = $this->pdo->prepare(
            'UPDATE baliabideak
             SET kategoriaId = ?, izena = ?, deskribapena = ?, marka = ?, modeloa = ?
             WHERE id = ?'
        );
        $st->execute([
            $datuak['kategoriaId'],
            $datuak['izena'],
            $datuak['deskribapena'],
            $datuak['marka'],
            $datuak['modeloa'],
            $id,
        ]);

        return $this->bilatu($id);
    }

    /** DELETE: si el recurso tiene equipos (gailuak), MySQL lo impide y la API responde 409. */
    public function ezabatu(int $id): void
    {
        if ($this->bilatu($id) === null) {
            throw new ApiErrorea('No encontrado', 404);
        }

        $st = $this->pdo->prepare('DELETE FROM baliabideak WHERE id = ?');
        $st->execute([$id]);
    }

    /** Valida los campos. Si hay errores lanza un 422 con el detalle por campo. */
    private function balidatu(array $sarrera): array
    {
        $erroreak = [];

        $kategoriaId  = zenbakiaLortu($sarrera, 'kategoriaId', $erroreak, true);
        $izena        = testuaLortu($sarrera, 'izena', 150, $erroreak, true);
        $deskribapena = testuaLortu($sarrera, 'deskribapena', 65535, $erroreak);   // opcional
        $marka        = testuaLortu($sarrera, 'marka', 100, $erroreak);            // opcional
        $modeloa      = testuaLortu($sarrera, 'modeloa', 100, $erroreak);          // opcional

        if ($erroreak) {
            throw new ApiErrorea('Datos no válidos', 422, $erroreak);
        }
        return [
            'kategoriaId'  => $kategoriaId,
            'izena'        => $izena,
            'deskribapena' => $deskribapena,
            'marka'        => $marka,
            'modeloa'      => $modeloa,
        ];
    }
}