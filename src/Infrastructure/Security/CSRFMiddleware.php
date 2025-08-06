<?php

declare(strict_types=1);

namespace App\Infrastructure\Security;

use App\Infrastructure\Web\Request;
use App\Infrastructure\Web\Middleware\MiddlewareInterface;

class CSRFMiddleware implements MiddlewareInterface
{
    public function process(Request $request): Request
    {
        if ($request->isPost()) {
            $token = $request->getPost('csrf_token');
            $sessionToken = SessionManager::get('csrf_token');
            
            if (!$token || !$sessionToken || !hash_equals($sessionToken, $token)) {
                throw new \RuntimeException('Token CSRF invalide');
            }
        }
        
        // Générer un nouveau token si nécessaire
        if (!SessionManager::has('csrf_token')) {
            $this->generateCSRFToken();
        }
        
        return $request;
    }
    
    private function generateCSRFToken(): void
    {
        $token = bin2hex(random_bytes(32));
        SessionManager::set('csrf_token', $token);
    }
}