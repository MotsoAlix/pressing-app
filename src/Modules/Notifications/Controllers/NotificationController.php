<?php

declare(strict_types=1);

namespace App\Modules\Notifications\Controllers;

use App\Infrastructure\Web\Request;
use App\Infrastructure\Web\Response;
use App\Infrastructure\Database\NotificationRepository;
use App\Infrastructure\Database\UserRepository;
use App\Core\Entities\Notification;

class NotificationController
{
    public function __construct(
        private NotificationRepository $notificationRepository,
        private UserRepository $userRepository
    ) {}

    public function index(Request $request): Response
    {
        try {
            $userId = $request->getQuery('userId');
            
            if ($userId) {
                $notifications = $this->notificationRepository->findByReceiverId((int)$userId);
            } else {
                $notifications = $this->notificationRepository->findRecent();
            }

            return Response::json([
                'success' => true,
                'data' => array_map(fn($notification) => $notification->toArray(), $notifications)
            ]);
        } catch (\Exception $e) {
            return Response::json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function show(Request $request, array $params): Response
    {
        try {
            $id = (int) $params['id'];
            $notification = $this->notificationRepository->findById($id);

            if (!$notification) {
                return Response::json([
                    'success' => false,
                    'message' => 'Notification non trouvée'
                ], 404);
            }

            return Response::json([
                'success' => true,
                'data' => $notification->toArray()
            ]);
        } catch (\Exception $e) {
            return Response::json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request): Response
    {
        try {
            $data = json_decode($request->getBody(), true);

            // Validation
            if (empty($data['receiverId']) || empty($data['type']) || empty($data['title']) || empty($data['message'])) {
                return Response::json([
                    'success' => false,
                    'message' => 'Données manquantes'
                ], 400);
            }

            // Vérifier que le destinataire existe
            $receiver = $this->userRepository->findById((int)$data['receiverId']);
            if (!$receiver) {
                return Response::json([
                    'success' => false,
                    'message' => 'Destinataire non trouvé'
                ], 404);
            }

            $notification = new Notification(
                (int)($data['senderId'] ?? 1), // Par défaut admin
                (int)$data['receiverId'],
                $data['type'],
                $data['title'],
                $data['message'],
                $data['data'] ?? []
            );

            $savedNotification = $this->notificationRepository->save($notification);

            return Response::json([
                'success' => true,
                'data' => $savedNotification->toArray(),
                'message' => 'Notification envoyée avec succès'
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
            
            if ($this->notificationRepository->markAsRead($id)) {
                return Response::json([
                    'success' => true,
                    'message' => 'Notification marquée comme lue'
                ]);
            } else {
                return Response::json([
                    'success' => false,
                    'message' => 'Notification non trouvée'
                ], 404);
            }
        } catch (\Exception $e) {
            return Response::json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function markAllAsRead(Request $request): Response
    {
        try {
            $data = json_decode($request->getBody(), true);
            $userId = (int)($data['userId'] ?? 0);

            if (!$userId) {
                return Response::json([
                    'success' => false,
                    'message' => 'ID utilisateur requis'
                ], 400);
            }

            $count = $this->notificationRepository->markAllAsReadForUser($userId);

            return Response::json([
                'success' => true,
                'message' => "$count notifications marquées comme lues",
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

            $count = $this->notificationRepository->countUnreadByReceiverId($userId);

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

    public function delete(Request $request, array $params): Response
    {
        try {
            $id = (int) $params['id'];

            if ($this->notificationRepository->delete($id)) {
                return Response::json([
                    'success' => true,
                    'message' => 'Notification supprimée avec succès'
                ]);
            } else {
                return Response::json([
                    'success' => false,
                    'message' => 'Notification non trouvée'
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
            $stats = $this->notificationRepository->getStatistics();

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

    public function sendToAllClients(Request $request): Response
    {
        try {
            $data = json_decode($request->getBody(), true);

            if (empty($data['type']) || empty($data['title']) || empty($data['message'])) {
                return Response::json([
                    'success' => false,
                    'message' => 'Données manquantes'
                ], 400);
            }

            // Récupérer tous les clients
            $clients = $this->userRepository->findByRole('client');
            $senderId = (int)($data['senderId'] ?? 1);
            $count = 0;

            foreach ($clients as $client) {
                $notification = new Notification(
                    $senderId,
                    $client->getId(),
                    $data['type'],
                    $data['title'],
                    $data['message'],
                    $data['data'] ?? []
                );

                $this->notificationRepository->save($notification);
                $count++;
            }

            return Response::json([
                'success' => true,
                'message' => "Notification envoyée à $count clients",
                'count' => $count
            ]);
        } catch (\Exception $e) {
            return Response::json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
