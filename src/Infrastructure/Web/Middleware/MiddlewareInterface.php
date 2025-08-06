<?php

declare(strict_types=1);

namespace App\Infrastructure\Web\Middleware;

use App\Infrastructure\Web\Request;

interface MiddlewareInterface
{
    public function process(Request $request): Request;
} 