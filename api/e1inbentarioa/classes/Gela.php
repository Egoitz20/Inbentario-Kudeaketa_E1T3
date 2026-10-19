<?php
declare(strict_types=1);

/** Tabla gelak: aulas y espacios físicos (Almacén, Departamento, aulas de grupo...). */
class Gela
{
    public function __construct(private PDO $pdo)
    {
    }

    /** READ: devuelve todas las aulas. */
    public function guztiak(): array
    {
        return $this->pdo->query('SELECT id, izena, taldea FROM gelak ORDER BY id')->fetchAll();
    }

    /** READ: devuelve un aula, o null si no existe. */
    public function bilatu(int $id): ?array
    {
        $st = $this->pdo->prepare('SELECT id, izena, taldea FROM gelak WHERE id = ?');
        $st->execute([$id]);
        return $st->fetch() ?: null;
    }

    /** CREATE: valida los datos, inserta y devuelve la fila creada. */
    public function sortu(array $sarrera): array
    {
        $datuak = $this->balidatu($sarrera);

        $st = $this->pdo->prepare('INSERT INTO gelak (izena, taldea) VALUES (?, ?)');
        $st->execute([$datuak['izena'], $datuak['taldea']]);

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

        $st = $this->pdo->prepare('UPDATE gelak SET izena = ?, taldea = ? WHERE id = ?');
        $st->execute([$datuak['izena'], $datuak['taldea'], $id]);

        return $this->bilatu($id);
    }

    /** DELETE: si el aula tiene movimientos, MySQL lo impide y la API responde 409. */
    public function ezabatu(int $id): void
    {
        if ($this->bilatu($id) === null) {
            throw new ApiErrorea('No encontrado', 404);
        }

        $st = $this->pdo->prepare('DELETE FROM gelak WHERE id = ?');
        $st->execute([$id]);
    }

    /** Valida los campos. Si hay errores lanza un 422 con el detalle por campo. */
    private function balidatu(array $sarrera): array
    {
        $erroreak = [];

        $izena  = testuaLortu($sarrera, 'izena', 100, $erroreak, true);
        $taldea = testuaLortu($sarrera, 'taldea', 100, $erroreak);   // opcional

        if ($erroreak) {
            throw new ApiErrorea('Datos no válidos', 422, $erroreak);
        }
        return ['izena' => $izena, 'taldea' => $taldea];
    }
}