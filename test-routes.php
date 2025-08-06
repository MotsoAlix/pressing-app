<?php

declare(strict_types=1);

echo "🧪 Test des routes de l'application\n\n";

// Autoloader
require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/config/bootstrap.php';

use App\Infrastructure\Web\Router;
use App\Infrastructure\Web\Request;

// Créer une instance du routeur
$router = new Router();

// Charger les routes des modules
$routeFiles = [
    __DIR__ . '/src/Modules/Auth/Routes/auth.php',
    __DIR__ . '/src/Modules/Orders/Routes/orders.php',
    __DIR__ . '/src/Modules/Customers/Routes/customers.php',
    __DIR__ . '/src/Modules/Payments/Routes/payments.php',
    __DIR__ . '/src/Modules/Reports/Routes/reports.php',
    __DIR__ . '/src/Modules/Tracking/Routes/tracking.php'
];

$loadedRoutes = 0;
foreach ($routeFiles as $routeFile) {
    if (file_exists($routeFile)) {
        require_once $routeFile;
        $loadedRoutes++;
        echo "✅ Route chargée: " . basename($routeFile) . "\n";
    } else {
        echo "❌ Route manquante: " . basename($routeFile) . "\n";
    }
}

echo "\n📊 Résumé: $loadedRoutes fichiers de routes chargés\n";

// Routes pour les pages HTML statiques
$htmlRoutes = [
    '/' => 'dashboard.html',
    '/dashboard' => 'dashboard.html',
    '/orders' => 'orders.html',
    '/customers' => 'customers.html',
    '/tracking' => 'tracking.html',
    '/payments' => 'payments.html',
    '/reports' => 'reports.html',
    '/admin' => 'admin.html',
    '/login' => 'login.html',
    '/design-system' => 'design-system.html'
];

echo "\n📄 Vérification des fichiers HTML:\n";
foreach ($htmlRoutes as $route => $htmlFile) {
    $filePath = __DIR__ . '/public/' . $htmlFile;
    if (file_exists($filePath)) {
        echo "✅ $route -> $htmlFile\n";
    } else {
        echo "❌ $route -> $htmlFile (fichier manquant)\n";
    }
}

echo "\n🎯 Test terminé !\n";
echo "\n💡 Pour démarrer le serveur:\n";
echo "   php -S localhost:8000 -t public\n";
echo "\n🌐 Puis testez les URLs:\n";
echo "   http://localhost:8000/\n";
echo "   http://localhost:8000/dashboard\n";
echo "   http://localhost:8000/orders\n";
echo "   http://localhost:8000/login\n";
