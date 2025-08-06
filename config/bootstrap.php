<?php

declare(strict_types=1);

// Charger les variables d'environnement
if (file_exists(__DIR__ . '/../.env')) {
    $env = parse_ini_file(__DIR__ . '/../.env');
    foreach ($env as $key => $value) {
        $_ENV[$key] = $value;
    }
}

// Configuration par défaut si .env n'existe pas
if (!isset($_ENV['APP_NAME'])) {
    $_ENV['APP_NAME'] = 'Pressing Pro';
    $_ENV['APP_URL'] = 'http://localhost';
    $_ENV['APP_ENV'] = 'development';
    $_ENV['DB_HOST'] = 'localhost';
    $_ENV['DB_NAME'] = 'pressing_db';
    $_ENV['DB_USER'] = 'root';
    $_ENV['DB_PASS'] = '';
}

// Charger les configurations
$config = [
    'database' => require __DIR__ . '/database.php',
    'app' => require __DIR__ . '/app.php',
];

// Définir les constantes globales
define('APP_ROOT', dirname(__DIR__));
define('CONFIG_PATH', __DIR__);
define('PUBLIC_PATH', APP_ROOT . '/public');
define('SRC_PATH', APP_ROOT . '/src');

// Configuration d'erreur
if ($_ENV['APP_ENV'] === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', '1');
} else {
    error_reporting(0);
    ini_set('display_errors', '0');
}

// Configuration de timezone
date_default_timezone_set('Europe/Paris');

// Configuration de session
ini_set('session.cookie_httponly', '1');
ini_set('session.use_only_cookies', '1');
if ($_ENV['APP_ENV'] === 'production') {
    ini_set('session.cookie_secure', '1');
}

// Fonction utilitaire pour accéder à la configuration
function config(string $key, $default = null) {
    global $config;
    $keys = explode('.', $key);
    $value = $config;
    
    foreach ($keys as $k) {
        if (isset($value[$k])) {
            $value = $value[$k];
        } else {
            return $default;
        }
    }
    
    return $value;
}