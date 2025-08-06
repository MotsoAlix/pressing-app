<?php

declare(strict_types=1);

use App\Modules\Orders\Controllers\OrderController;
use App\Core\UseCases\Order\CreateOrderUseCase;
use App\Infrastructure\Database\DatabaseConnection;
use App\Infrastructure\Database\OrderRepository;
use App\Infrastructure\Database\CustomerRepository;

// Injection de dépendances
$orderRepository = new OrderRepository();
$customerRepository = new CustomerRepository();
$createOrderUseCase = new CreateOrderUseCase($orderRepository, $customerRepository);
$db = new DatabaseConnection();
$orderController = new OrderController($createOrderUseCase, $db);

// Routes des commandes
$router->get('/api/orders', [$orderController, 'index']);
$router->get('/api/orders/{id}', [$orderController, 'show']);
$router->post('/api/orders', [$orderController, 'store']);
$router->put('/api/orders/{id}', [$orderController, 'update']);
$router->delete('/api/orders/{id}', [$orderController, 'destroy']);
$router->get('/api/orders/stats', [$orderController, 'stats']);

// Les routes HTML sont gérées dans public/index.php