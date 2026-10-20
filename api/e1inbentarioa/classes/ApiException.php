<?php
declare(strict_types=1);

/**
 * Error de la API: lleva el código HTTP (404, 422, 409...) y el detalle por campo.
 * Las clases lo lanzan con "throw" y bootstrap.php lo convierte en JSON.
 */
class ApiErrorea extends Exception
{
    public function __construct(string $mezua, int $egoera = 400, public readonly array $xehetasunak = [])
    {
        parent::__construct($mezua, $egoera);
    }
}