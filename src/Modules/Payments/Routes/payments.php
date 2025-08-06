<?php

declare(strict_types=1);

use App\Modules\Payments\Controllers\PaymentController;
use App\Infrastructure\Database\DatabaseConnection;

// Injection de dépendances
$db = new DatabaseConnection();
$paymentController = new PaymentController($db);

// Routes des paiements
$router->get('/api/payments', [$paymentController, 'index']);
$router->get('/api/payments/{id}', [$paymentController, 'show']);
$router->post('/api/payments', [$paymentController, 'store']);
$router->get('/api/payments/stats', [$paymentController, 'stats']);
$router->get('/api/payments/{id}/invoice', [$paymentController, 'generateInvoice']);

// Les routes HTML sont gérées dans public/index.php