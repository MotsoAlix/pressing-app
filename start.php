<?php

declare(strict_types=1);

echo "🚀 Démarrage du système de gestion de pressing...\n\n";

// Vérifier PHP
echo "📋 Vérification de l'environnement PHP...\n";
if (version_compare(PHP_VERSION, '8.0.0', '>=')) {
    echo "✅ PHP " . PHP_VERSION . " - OK\n";
} else {
    echo "❌ PHP " . PHP_VERSION . " - Version 8.0+ requise\n";
    exit(1);
}

// Vérifier les extensions
$requiredExtensions = ['pdo', 'pdo_mysql', 'json', 'mbstring'];
foreach ($requiredExtensions as $ext) {
    if (extension_loaded($ext)) {
        echo "✅ Extension $ext - OK\n";
    } else {
        echo "❌ Extension $ext - Manquante\n";
        exit(1);
    }
}

// Vérifier Composer
echo "\n📦 Vérification de Composer...\n";
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    echo "✅ Autoloader Composer - OK\n";
} else {
    echo "❌ Autoloader Composer - Manquant\n";
    echo "💡 Exécutez: composer install\n";
    exit(1);
}

// Vérifier la configuration
echo "\n⚙️ Vérification de la configuration...\n";
if (file_exists(__DIR__ . '/config/bootstrap.php')) {
    echo "✅ Configuration - OK\n";
} else {
    echo "❌ Configuration - Manquante\n";
    exit(1);
}

// Vérifier la base de données
echo "\n🗄️ Test de connexion à la base de données...\n";

require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/config/bootstrap.php';

use App\Infrastructure\Database\DatabaseConnection;

try {
    $db = new DatabaseConnection();
    $pdo = $db->getConnection();
    echo "✅ Connexion à la base de données - OK\n";
    
    // Vérifier les tables
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
    echo "💡 Vérifiez votre configuration dans .env\n";
    exit(1);
}

// Vérifier les modules
echo "\n🔧 Vérification des modules...\n";
$modules = [
    'Auth' => 'App\Modules\Auth\Controllers\AuthController',
    'Orders' => 'App\Modules\Orders\Controllers\OrderController',
    'Customers' => 'App\Modules\Customers\Controllers\CustomerController',
    'Payments' => 'App\Modules\Payments\Controllers\PaymentController',
    'Reports' => 'App\Modules\Reports\Controllers\ReportController',
    'Tracking' => 'App\Modules\Tracking\Controllers\TrackingController'
];

foreach ($modules as $name => $class) {
    if (class_exists($class)) {
        echo "✅ Module $name - OK\n";
    } else {
        echo "❌ Module $name - Manquant\n";
    }
}

// Vérifier les fichiers HTML
echo "\n📄 Vérification des pages HTML...\n";
$htmlFiles = [
    'login.html',
    'dashboard.html',
    'orders.html',
    'customers.html',
    'payments.html',
    'tracking.html',
    'reports.html',
    'admin.html'
];

foreach ($htmlFiles as $file) {
    if (file_exists(__DIR__ . '/public/' . $file)) {
        echo "✅ $file - OK\n";
    } else {
        echo "❌ $file - Manquant\n";
    }
}

echo "\n🎯 Configuration terminée !\n";
echo "\n📝 Pour démarrer le serveur:\n";
echo "   php -S localhost:8000 -t public\n";
echo "\n🌐 Accédez à l'application:\n";
echo "   http://localhost:8000\n";
echo "\n🔐 Identifiants par défaut:\n";
echo "   Email: admin@pressing.com\n";
echo "   Mot de passe: admin123\n";
echo "\n💡 Si vous avez des problèmes:\n";
echo "   - Vérifiez que MySQL/MariaDB est démarré\n";
echo "   - Vérifiez votre fichier .env\n";
echo "   - Exécutez: php database/migrate.php\n";
echo "   - Exécutez: php database/seed.php\n"; 