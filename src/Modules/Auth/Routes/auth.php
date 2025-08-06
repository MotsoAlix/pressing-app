<?php

declare(strict_types=1);

use App\Modules\Auth\Controllers\AuthController;
use App\Core\UseCases\Authentication\LoginUseCase;
use App\Infrastructure\Security\SessionManager;
use App\Infrastructure\Database\UserRepository;

// Injection de dépendances
$userRepository = new UserRepository();
$loginUseCase = new LoginUseCase($userRepository);
$sessionManager = new SessionManager();
$authController = new AuthController($loginUseCase, $sessionManager);

// Routes d'authentification
$router->get('/login', [$authController, 'login']);
$router->post('/login', [$authController, 'login']);
$router->post('/logout', [$authController, 'logout']);
$router->get('/auth/check', [$authController, 'checkAuth']);

// Routes des dashboards selon le rôle
$router->get('/admin-dashboard', function($request) {
    $filePath = __DIR__ . '/../../../public/admin-dashboard.html';
    if (file_exists($filePath)) {
        $content = file_get_contents($filePath);
        return new \App\Infrastructure\Web\Response($content, 200, ['Content-Type' => 'text/html; charset=UTF-8']);
    }
    return \App\Infrastructure\Web\Response::notFound('Page non trouvée');
});

$router->get('/manager-dashboard', function($request) {
    $filePath = __DIR__ . '/../../../public/manager-dashboard.html';
    if (file_exists($filePath)) {
        $content = file_get_contents($filePath);
        return new \App\Infrastructure\Web\Response($content, 200, ['Content-Type' => 'text/html; charset=UTF-8']);
    }
    return \App\Infrastructure\Web\Response::notFound('Page non trouvée');
});

$router->get('/client-dashboard', function($request) {
    $filePath = __DIR__ . '/../../../public/client-dashboard.html';
    if (file_exists($filePath)) {
        $content = file_get_contents($filePath);
        return new \App\Infrastructure\Web\Response($content, 200, ['Content-Type' => 'text/html; charset=UTF-8']);
    }
    return \App\Infrastructure\Web\Response::notFound('Page non trouvée');
});