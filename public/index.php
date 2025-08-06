<?php

declare(strict_types=1);

// Configuration d'erreur pour le développement
error_reporting(E_ALL);
ini_set('display_errors', '1');

// Autoloader
require_once __DIR__ . '/../vendor/autoload.php';

// Charger la configuration
require_once __DIR__ . '/../config/bootstrap.php';

// Démarrage de la session
session_start();

// Configuration des headers CORS pour le développement
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Gestion des requêtes OPTIONS (preflight CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

use App\Infrastructure\Web\Router;
use App\Infrastructure\Web\Request;
use App\Infrastructure\Web\Response;

// Créer une instance du routeur
$router = new Router();

// Charger les routes des modules
$routeFiles = [
    __DIR__ . '/../src/Modules/Auth/Routes/auth.php',
    __DIR__ . '/../src/Modules/Orders/Routes/orders.php',
    __DIR__ . '/../src/Modules/Customers/Routes/customers.php',
    __DIR__ . '/../src/Modules/Payments/Routes/payments.php',
    __DIR__ . '/../src/Modules/Reports/Routes/reports.php',
    __DIR__ . '/../src/Modules/Tracking/Routes/tracking.php',
    __DIR__ . '/../src/Modules/Notifications/Routes/notifications.php',
    __DIR__ . '/../src/Modules/Chat/Routes/chat.php'
];

foreach ($routeFiles as $routeFile) {
    if (file_exists($routeFile)) {
        require_once $routeFile;
    }
}

// Routes pour les pages HTML statiques
$htmlRoutes = [
    '/' => 'login.html',  // Rediriger vers la page de connexion par défaut
    '/dashboard' => 'dashboard.html',
    '/orders' => 'orders.html',
    '/customers' => 'customers.html',
    '/tracking' => 'tracking.html',
    '/payments' => 'payments.html',
    '/reports' => 'reports.html',
    '/admin' => 'admin.html',
    '/login' => 'login.html',
    '/design-system' => 'design-system.html',
    '/admin-dashboard' => 'admin-dashboard.html',
    '/manager-dashboard' => 'manager-dashboard.html',
    '/client-dashboard' => 'client-dashboard.html'
];

// Ajouter les routes HTML au routeur
foreach ($htmlRoutes as $path => $htmlFile) {
    $router->get($path, function($request) use ($htmlFile) {
        $filePath = __DIR__ . '/' . $htmlFile;

        if (file_exists($filePath)) {
            $content = file_get_contents($filePath);
            return new Response($content, 200, ['Content-Type' => 'text/html; charset=UTF-8']);
        }

        return Response::notFound('Page non trouvée');
    });
}

// Créer la requête à partir des globals
$request = Request::fromGlobals();

try {
    // Dispatcher la requête
    $response = $router->dispatch($request);

    // Envoyer la réponse
    $response->send();

} catch (Exception $e) {
    // Gestion des erreurs
    error_log('Erreur de routage: ' . $e->getMessage());

    if ($_ENV['APP_ENV'] === 'development') {
        echo '<h1>Erreur de routage</h1>';
        echo '<p>' . htmlspecialchars($e->getMessage()) . '</p>';
        echo '<pre>' . htmlspecialchars($e->getTraceAsString()) . '</pre>';
    } else {
        echo '<h1>Une erreur est survenue</h1>';
        echo '<p>Veuillez réessayer plus tard.</p>';
    }

    http_response_code(500);
}