<?php

declare(strict_types=1);

use App\Modules\Reports\Controllers\ReportController;
use App\Infrastructure\Database\DatabaseConnection;

// Injection de dépendances
$db = new DatabaseConnection();
$reportController = new ReportController($db);

// Routes API pour les rapports
$router->get('/api/reports/dashboard', [$reportController, 'dashboard']);
$router->get('/api/reports/sales', [$reportController, 'sales']);
$router->get('/api/reports/customers', [$reportController, 'customers']);
$router->get('/api/reports/services', [$reportController, 'services']);
$router->get('/api/reports/export/{type}', [$reportController, 'export']);