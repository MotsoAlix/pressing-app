<?php

declare(strict_types=1);

namespace App\Infrastructure\Security;

use App\Infrastructure\Web\Request;
use App\Infrastructure\Web\Middleware\MiddlewareInterface;

class SessionMiddleware implements MiddlewareInterface
{
    public function process(Request $request): Request
    {
        // La session est déjà démarrée dans le bootstrap
        // Ce middleware peut être utilisé pour des vérifications supplémentaires
        
        // Vérifier si la session n'est pas expirée
        if (SessionManager::has('last_activity')) {
            $lastActivity = SessionManager::get('last_activity');
            $timeout = 30 * 60; // 30 minutes
            
            if (time() - $lastActivity > $timeout) {
                SessionManager::destroy();
                throw new \RuntimeException('Session expirée');
            }
        }
        
        // Mettre à jour l'activité
        SessionManager::set('last_activity', time());
        
        return $request;
    }
}