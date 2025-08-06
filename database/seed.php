<?php

declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config/bootstrap.php';

use App\Infrastructure\Database\DatabaseConnection;

echo "🌱 Démarrage du seeding...\n";

try {
    $pdo = DatabaseConnection::getInstance();
    
    // Lire tous les fichiers de seed
    $seedFiles = glob(__DIR__ . '/seeds/*.sql');
    sort($seedFiles);
    
    foreach ($seedFiles as $seedFile) {
        $filename = basename($seedFile);
        echo "🌿 Exécution du seed: $filename\n";
        
        $sql = file_get_contents($seedFile);
        $pdo->exec($sql);
        
        echo "✅ Seed $filename terminé avec succès\n";
    }
    
    echo "\n🎉 Tous les seeds ont été exécutés avec succès!\n";
    echo "📝 Données de test créées:\n";
    echo "   - Utilisateurs: admin, employee1, employee2 (mot de passe: password123)\n";
    echo "   - Services de pressing: 12 services différents\n";
    
} catch (Exception $e) {
    echo "❌ Erreur lors de l'exécution des seeds: " . $e->getMessage() . "\n";
    exit(1);
} 