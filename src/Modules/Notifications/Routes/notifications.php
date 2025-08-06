<?php

declare(strict_types=1);

use App\Modules\Notifications\Controllers\NotificationController;
use App\Infrastructure\Database\NotificationRepository;
use App\Infrastructure\Database\UserRepository;

// Injection de dépendances
$notificationRepository = new NotificationRepository();
$userRepository = new UserRepository();
$notificationController = new NotificationController($notificationRepository, $userRepository);

// Routes API pour les notifications
$router->get('/api/notifications', [$notificationController, 'index']);
$router->get('/api/notifications/{id}', [$notificationController, 'show']);
$router->post('/api/notifications', [$notificationController, 'store']);
$router->put('/api/notifications/{id}/read', [$notificationController, 'markAsRead']);
$router->post('/api/notifications/mark-all-read', [$notificationController, 'markAllAsRead']);
$router->get('/api/notifications/unread-count', [$notificationController, 'getUnreadCount']);
$router->delete('/api/notifications/{id}', [$notificationController, 'delete']);
$router->get('/api/notifications/statistics', [$notificationController, 'getStatistics']);
$router->post('/api/notifications/broadcast', [$notificationController, 'sendToAllClients']);
