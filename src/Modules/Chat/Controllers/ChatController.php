<?php

declare(strict_types=1);

namespace App\Modules\Chat\Controllers;

use App\Infrastructure\Web\Request;
use App\Infrastructure\Web\Response;
use App\Infrastructure\Database\ChatRepository;
use App\Infrastructure\Database\UserRepository;
use App\Core\Entities\ChatMessage;

class ChatController
{
    public function __construct(
        private ChatRepository $chatRepository,
        private UserRepository $userRepository
    ) {}

    public function getConversations(Request $request): Response
    {
        try {
            $userId = (int)$request->getQuery('userId');

            if (!$userId) {
                return Response::json([
                    'success' => false,
                    'message' => 'ID utilisateur requis'
                ], 400);
            }

            $conversations = $this->chatRepository->findUserConversations($userId);
            
            // Enrichir avec les informations utilisateur
            foreach ($conversations as &$conversation) {
                $user = $this->userRepository->findById($conversation['userId']);
                if ($user) {
                    $conversation['user'] = [
                        'id' => $user->getId(),
                        'firstName' => $user->getFirstName(),
                        'lastName' => $user->getLastName(),
                        'fullName' => $user->getFullName(),
                        'role' => $user->getRole()
                    ];
                }
                
                // Convertir le dernier message en array
                $conversation['lastMessage'] = $conversation['lastMessage']->toArray();
            }

            return Response::json([
                'success' => true,
                'data' => $conversations
            ]);
        } catch (\Exception $e) {
            return Response::json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getConversation(Request $request): Response
    {
        try {
            $userId = (int)$request->getQuery('userId');
            $otherUserId = (int)$request->getQuery('otherUserId');

            if (!$userId || !$otherUserId) {
                return Response::json([
                    'success' => false,
                    'message' => 'IDs utilisateurs requis'
                ], 400);
            }

            $messages = $this->chatRepository->findConversation($userId, $otherUserId);
            $otherUser = $this->userRepository->findById($otherUserId);

            if (!$otherUser) {
                return Response::json([
                    'success' => false,
                    'message' => 'Utilisateur non trouvé'
                ], 404);
            }

            return Response::json([
                'success' => true,
                'data' => [
                    'messages' => array_map(fn($message) => $message->toArray(), $messages),
                    'otherUser' => [
                        'id' => $otherUser->getId(),
                        'firstName' => $otherUser->getFirstName(),
                        'lastName' => $otherUser->getLastName(),
                        'fullName' => $otherUser->getFullName(),
                        'role' => $otherUser->getRole()
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return Response::json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function sendMessage(Request $request): Response
    {
        try {
            $data = json_decode($request->getBody(), true);

            if (empty($data['senderId']) || empty($data['receiverId']) || empty($data['message'])) {
                return Response::json([
                    'success' => false,
                    'message' => 'Données manquantes'
                ], 400);
            }

            // Vérifier que les utilisateurs existent
            $sender = $this->userRepository->findById((int)$data['senderId']);
            $receiver = $this->userRepository->findById((int)$data['receiverId']);

            if (!$sender || !$receiver) {
                return Response::json([
                    'success' => false,
                    'message' => 'Utilisateur non trouvé'
                ], 404);
            }

            $message = new ChatMessage(
                (int)$data['senderId'],
                (int)$data['receiverId'],
                $data['message'],
                $data['type'] ?? 'text',
                $data['attachments'] ?? []
            );

            $savedMessage = $this->chatRepository->save($message);

            return Response::json([
                'success' => true,
                'data' => $savedMessage->toArray(),
                'message' => 'Message envoyé avec succès'
            ], 201);
        } catch (\Exception $e) {
            return Response::json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function markAsRead(Request $request, array $params): Response
    {
        try {
            $id = (int) $params['id'];
            
            if ($this->chatRepository->markAsRead($id)) {
                return Response::json([
                    'success' => true,
                    'message' => 'Message marqué comme lu'
                ]);
            } else {
                return Response::json([
                    'success' => false,
                    'message' => 'Message non trouvé'
                ], 404);
            }
        } catch (\Exception $e) {
            return Response::json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function markConversationAsRead(Request $request): Response
    {
        try {
            $data = json_decode($request->getBody(), true);
            $userId = (int)($data['userId'] ?? 0);
            $otherUserId = (int)($data['otherUserId'] ?? 0);

            if (!$userId || !$otherUserId) {
                return Response::json([
                    'success' => false,
                    'message' => 'IDs utilisateurs requis'
                ], 400);
            }

            $count = $this->chatRepository->markConversationAsRead($userId, $otherUserId);

            return Response::json([
                'success' => true,
                'message' => "$count messages marqués comme lus",
                'count' => $count
            ]);
        } catch (\Exception $e) {
            return Response::json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getUnreadCount(Request $request): Response
    {
        try {
            $userId = (int)$request->getQuery('userId');

            if (!$userId) {
                return Response::json([
                    'success' => false,
                    'message' => 'ID utilisateur requis'
                ], 400);
            }

            $count = $this->chatRepository->countUnreadMessages($userId);

            return Response::json([
                'success' => true,
                'count' => $count
            ]);
        } catch (\Exception $e) {
            return Response::json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function searchMessages(Request $request): Response
    {
        try {
            $query = $request->getQuery('q');
            $userId = (int)$request->getQuery('userId');

            if (empty($query)) {
                return Response::json([
                    'success' => false,
                    'message' => 'Terme de recherche requis'
                ], 400);
            }

            $messages = $this->chatRepository->searchMessages($query, $userId ?: null);

            return Response::json([
                'success' => true,
                'data' => array_map(fn($message) => $message->toArray(), $messages)
            ]);
        } catch (\Exception $e) {
            return Response::json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function deleteMessage(Request $request, array $params): Response
    {
        try {
            $id = (int) $params['id'];

            if ($this->chatRepository->delete($id)) {
                return Response::json([
                    'success' => true,
                    'message' => 'Message supprimé avec succès'
                ]);
            } else {
                return Response::json([
                    'success' => false,
                    'message' => 'Message non trouvé'
                ], 404);
            }
        } catch (\Exception $e) {
            return Response::json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getStatistics(Request $request): Response
    {
        try {
            $stats = $this->chatRepository->getStatistics();

            return Response::json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return Response::json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
