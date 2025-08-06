<?php

declare(strict_types=1);

use App\Modules\Tracking\Controllers\TrackingController;
use App\Infrastructure\Database\DatabaseConnection;

// Injection de dépendances
$db = new DatabaseConnection();
$trackingController = new TrackingController($db);

// Routes du tracking
$router->get('/tracking', [$trackingController, 'index']);
$router->get('/api/tracking/search', [$trackingController, 'searchOrder']);
$router->put('/api/tracking/orders/{id}/status', [$trackingController, 'updateStatus']);
$router->get('/api/tracking/orders/{id}/history', [$trackingController, 'getOrderHistory']); 