<?php

declare(strict_types=1);

use App\Modules\Chat\Controllers\ChatController;
use App\Infrastructure\Database\ChatRepository;
use App\Infrastructure\Database\UserRepository;

// Injection de dépendances
$chatRepository = new ChatRepository();
$userRepository = new UserRepository();
$chatController = new ChatController($chatRepository, $userRepository);

// Routes API pour le chat
$router->get('/api/chat/conversations', [$chatController, 'getConversations']);
$router->get('/api/chat/conversation', [$chatController, 'getConversation']);
$router->post('/api/chat/messages', [$chatController, 'sendMessage']);
$router->put('/api/chat/messages/{id}/read', [$chatController, 'markAsRead']);
$router->post('/api/chat/conversation/read', [$chatController, 'markConversationAsRead']);
$router->get('/api/chat/unread-count', [$chatController, 'getUnreadCount']);
$router->get('/api/chat/search', [$chatController, 'searchMessages']);
$router->delete('/api/chat/messages/{id}', [$chatController, 'deleteMessage']);
$router->get('/api/chat/statistics', [$chatController, 'getStatistics']);
