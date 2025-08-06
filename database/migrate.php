<?php

declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config/bootstrap.php';

use App\Infrastructure\Database\DatabaseConnection;

echo "🚀 Démarrage des migrations...\n";

try {
    $pdo = DatabaseConnection::getInstance();
    
    // Lire tous les fichiers de migration
    $migrationFiles = glob(__DIR__ . '/migrations/*.sql');
    sort($migrationFiles);
    
    foreach ($migrationFiles as $migrationFile) {
        $filename = basename($migrationFile);
        echo "📦 Exécution de la migration: $filename\n";
        
        $sql = file_get_contents($migrationFile);
        $pdo->exec($sql);
        
        echo "✅ Migration $filename terminée avec succès\n";
    }
    
    echo "\n🎉 Toutes les migrations ont été exécutées avec succès!\n";
    
} catch (Exception $e) {
    echo "❌ Erreur lors de l'exécution des migrations: " . $e->getMessage() . "\n";
    exit(1);
}