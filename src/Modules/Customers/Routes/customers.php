<?php

declare(strict_types=1);

use App\Modules\Customers\Controllers\CustomerController;
use App\Infrastructure\Database\CustomerRepository;

// Injection de dépendances
$customerRepository = new CustomerRepository();
$customerController = new CustomerController($customerRepository);

// Routes API pour les clients
$router->get('/api/customers', [$customerController, 'index']);
$router->get('/api/customers/{id}', [$customerController, 'show']);
$router->post('/api/customers', [$customerController, 'store']);
$router->put('/api/customers/{id}', [$customerController, 'update']);
$router->delete('/api/customers/{id}', [$customerController, 'destroy']);