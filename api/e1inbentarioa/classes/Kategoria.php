<?php
declare(strict_types=1);

/** Tabla kategoriak: categorías de equipamiento (Portátil, Sobremesa, Periféricos, Otros). */
class Kategoria
{
    public function __construct(private PDO $pdo)
    {
    }

    /** READ: devuelve todas las categorías. */
    public function guztiak(): array
    {
        return $this->pdo->query('SELECT id, izena FROM kategoriak ORDER BY id')->fetchAll();
    }

    /** READ: devuelve una categoría, o null si no existe. */
    public function bilatu(int $id): ?array
    {
        $st = $this->pdo->prepare('SELECT id, izena FROM kategoriak WHERE id = ?');
        $st->execute([$id]);
        return $st->fetch() ?: null;
    }

    /** CREATE: valida los datos, inserta y devuelve la fila creada. */
    public function sortu(array $sarrera): array
    {
        $datuak = $this->balidatu($sarrera);

        $st = $this->pdo->prepare('INSERT INTO kategoriak (izena) VALUES (?)');
        $st->execute([$datuak['izena']]);

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

        $st = $this->pdo->prepare('UPDATE kategoriak SET izena = ? WHERE id = ?');
        $st->execute([$datuak['izena'], $id]);

        return $this->bilatu($id);
    }

    /** DELETE: si la categoría tiene recursos, MySQL lo impide (clave foránea) y la API responde 409. */
    public function ezabatu(int $id): void
    {
        if ($this->bilatu($id) === null) {
            throw new ApiErrorea('No encontrado', 404);
        }

        $st = $this->pdo->prepare('DELETE FROM kategoriak WHERE id = ?');
        $st->execute([$id]);
    }

    /** Valida los campos. Si hay errores lanza un 422 con el detalle por campo. */
    private function balidatu(array $sarrera): array
    {
        $erroreak = [];

        $izena = testuaLortu($sarrera, 'izena', 100, $erroreak, true);

        if ($erroreak) {
            throw new ApiErrorea('Datos no válidos', 422, $erroreak);
        }
        return ['izena' => $izena];
    }
}