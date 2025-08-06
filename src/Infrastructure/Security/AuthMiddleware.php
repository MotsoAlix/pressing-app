<?php

declare(strict_types=1);

namespace App\Infrastructure\Security;

use App\Infrastructure\Web\Request;
use App\Infrastructure\Web\Response;
use App\Infrastructure\Web\Middleware\MiddlewareInterface;

class AuthMiddleware implements MiddlewareInterface
{
    private SessionManager $sessionManager;

    public function __construct(SessionManager $sessionManager)
    {
        $this->sessionManager = $sessionManager;
    }

    public function process(Request $request): Request
    {
        $userId = $this->sessionManager->get('user_id');
        
        if (!$userId) {
            // Rediriger vers la page de login si pas authentifié
            header('Location: /login');
            exit;
        }
        
        return $request;
    }
} 