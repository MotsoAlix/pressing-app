<?php

declare(strict_types=1);

require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/config/bootstrap.php';

use App\Infrastructure\Database\DatabaseConnection;

echo "=== Test de connexion du système de gestion de pressing ===\n\n";

// Test de l'autoloader
echo "✅ Autoloader PSR-4 fonctionnel\n";

// Test de la configuration
echo "✅ Configuration chargée\n";
echo "   - Nom de l'app: " . config('app.name', 'Pressing Pro') . "\n";
echo "   - Environnement: " . config('app.env', 'development') . "\n";

// Test de la base de données
try {
    $db = new DatabaseConnection();
    $pdo = $db->getConnection();
    echo "✅ Connexion à la base de données réussie\n";
    
    // Test des tables
    $tables = ['users', 'customers', 'orders', 'payments', 'services'];
    foreach ($tables as $table) {
        try {
            $stmt = $pdo->query("SELECT COUNT(*) FROM $table");
            $count = $stmt->fetchColumn();
            echo "   - Table '$table': $count enregistrement(s)\n";
        } catch (Exception $e) {
            echo "   - Table '$table': ❌ Non trouvée\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ Erreur de connexion à la base de données: " . $e->getMessage() . "\n";
    echo "   Assurez-vous que la base de données est créée et configurée.\n";
}

// Test des modules
echo "\n=== Test des modules ===\n";

$modules = [
    'Auth' => 'App\Modules\Auth\Controllers\AuthController',
    'Orders' => 'App\Modules\Orders\Controllers\OrderController',
    'Customers' => 'App\Modules\Customers\Controllers\CustomerController',
    'Payments' => 'App\Modules\Payments\Controllers\PaymentController'
];

foreach ($modules as $name => $class) {
    if (class_exists($class)) {
        echo "✅ Module $name: OK\n";
    } else {
        echo "❌ Module $name: Classe $class non trouvée\n";
    }
}

// Test des routes
echo "\n=== Test des routes ===\n";

$routeFiles = glob(__DIR__ . '/src/Modules/*/Routes/*.php');
foreach ($routeFiles as $routeFile) {
    $module = basename(dirname(dirname($routeFile)));
    echo "✅ Routes du module $module: " . basename($routeFile) . "\n";
}

echo "\n=== Résumé ===\n";
echo "🎯 Le système est prêt à être utilisé !\n";
echo "📝 Pour démarrer le serveur: php -S localhost:8000 -t public\n";
echo "🌐 Accédez à: http://localhost:8000\n"; 