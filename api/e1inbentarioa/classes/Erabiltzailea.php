<?php
declare(strict_types=1);

/**
 * Tabla erabiltzaileak: usuarios del sistema (roles admin y user).
 * Las contraseñas se guardan cifradas con bcrypt y nunca se devuelven en la API.
 */
class Erabiltzailea
{
    public function __construct(private PDO $pdo)
    {
    }

    /** READ: devuelve todos los usuarios (sin contraseña). */
    public function guztiak(): array
    {
        return $this->pdo->query('SELECT id, username, rol FROM erabiltzaileak ORDER BY id')->fetchAll();
    }

    /** READ: devuelve un usuario (sin contraseña), o null si no existe. */
    public function bilatu(int $id): ?array
    {
        $st = $this->pdo->prepare('SELECT id, username, rol FROM erabiltzaileak WHERE id = ?');
        $st->execute([$id]);
        return $st->fetch() ?: null;
    }

    /** LOGIN: si usuario y contraseña son correctos devuelve los datos de sesión; si no, null. */
    public function autentifikatu(string $username, string $pasahitza): ?array
    {
        $st = $this->pdo->prepare('SELECT id, username, pasahitza, rol FROM erabiltzaileak WHERE username = ?');
        $st->execute([$username]);
        $erabiltzailea = $st->fetch();

        // password_verify compara la contraseña con el hash bcrypt guardado
        if (!$erabiltzailea || !password_verify($pasahitza, $erabiltzailea['pasahitza'])) {
            usleep(300000);   // pausa de 0,3 s para frenar ataques de fuerza bruta
            return null;
        }

        return [
            'id'       => (int)$erabiltzailea['id'],
            'username' => $erabiltzailea['username'],
            'rol'      => $erabiltzailea['rol'],
        ];
    }

    /** CREATE (alta de usuario): el endpoint ya exige rol admin. La contraseña es obligatoria. */
    public function sortu(array $sarrera): array
    {
        $datuak = $this->balidatu($sarrera, true);

        $st = $this->pdo->prepare('INSERT INTO erabiltzaileak (username, pasahitza, rol) VALUES (?, ?, ?)');
        $st->execute([
            $datuak['username'],
            password_hash($datuak['pasahitza'], PASSWORD_BCRYPT),   // guardamos el hash, nunca la contraseña
            $datuak['rol'],
        ]);

        return $this->bilatu((int)$this->pdo->lastInsertId());
    }

    /**
     * UPDATE: los campos que no se envían conservan su valor actual.
     * La contraseña solo se cambia si se envía. Un admin no puede quitarse a sí mismo el rol admin.
     */
    public function eguneratu(int $id, array $sarrera, int $unekoErabiltzaileId): array
    {
        $unekoa = $this->bilatu($id);
        if ($unekoa === null) {
            throw new ApiErrorea('No encontrado', 404);
        }
        if (!$sarrera) {
            throw new ApiErrorea('No hay campos que actualizar', 400);
        }

        // Mezclamos lo que ya había con lo nuevo y validamos (contraseña opcional)
        $datuak = $this->balidatu(array_merge($unekoa, $sarrera), false);

        if ($id === $unekoErabiltzaileId && $datuak['rol'] !== 'admin') {
            throw new ApiErrorea('No puedes quitarte a ti mismo el rol admin', 400);
        }

        if ($datuak['pasahitza'] !== null) {
            // Se envió una contraseña nueva: se cifra y se guarda
            $st = $this->pdo->prepare('UPDATE erabiltzaileak SET username = ?, rol = ?, pasahitza = ? WHERE id = ?');
            $st->execute([
                $datuak['username'],
                $datuak['rol'],
                password_hash($datuak['pasahitza'], PASSWORD_BCRYPT),
                $id,
            ]);
        } else {
            $st = $this->pdo->prepare('UPDATE erabiltzaileak SET username = ?, rol = ? WHERE id = ?');
            $st->execute([$datuak['username'], $datuak['rol'], $id]);
        }

        return $this->bilatu($id);
    }

    /** DELETE: no se puede borrar el propio usuario; si tiene movimientos, MySQL lo impide (409). */
    public function ezabatu(int $id, int $unekoErabiltzaileId): void
    {
        if ($this->bilatu($id) === null) {
            throw new ApiErrorea('No encontrado', 404);
        }
        if ($id === $unekoErabiltzaileId) {
            throw new ApiErrorea('No puedes borrar tu propio usuario', 400);
        }

        $st = $this->pdo->prepare('DELETE FROM erabiltzaileak WHERE id = ?');
        $st->execute([$id]);
    }

    /**
     * Valida los campos. Si hay errores lanza un 422 con el detalle por campo.
     * $pasahitzaBeharrezkoa = true al crear (obligatoria), false al editar (opcional).
     */
    private function balidatu(array $sarrera, bool $pasahitzaBeharrezkoa): array
    {
        $erroreak = [];

        // Nombre de usuario: 3-50 caracteres (letras, números, _ . -)
        $username = testuaLortu($sarrera, 'username', 50, $erroreak, true);
        if ($username !== null && !preg_match('/^[A-Za-z0-9_.-]{3,50}$/', $username)) {
            $erroreak['username'] = 'Entre 3 y 50 caracteres: letras, números, _ . -';
        }

        // Rol: solo admin o user (por defecto user)
        $rol = testuaLortu($sarrera, 'rol', 30, $erroreak) ?? 'user';
        if (!in_array($rol, ['admin', 'user'], true)) {
            $erroreak['rol'] = 'Valores permitidos: admin, user';
        }

        // Contraseña: 8-72 caracteres (72 es el límite de bcrypt). No se recorta con trim.
        $pasahitza = $sarrera['pasahitza'] ?? null;
        if ($pasahitza === null || $pasahitza === '') {
            if ($pasahitzaBeharrezkoa) {
                $erroreak['pasahitza'] = 'Campo obligatorio';
            }
            $pasahitza = null;
        } elseif (!is_string($pasahitza) || strlen($pasahitza) < 8 || strlen($pasahitza) > 72) {
            $erroreak['pasahitza'] = 'Debe tener entre 8 y 72 caracteres';
            $pasahitza = null;
        }

        if ($erroreak) {
            throw new ApiErrorea('Datos no válidos', 422, $erroreak);
        }
        return ['username' => $username, 'rol' => $rol, 'pasahitza' => $pasahitza];
    }
}