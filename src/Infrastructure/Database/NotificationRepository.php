<?php

declare(strict_types=1);

namespace App\Infrastructure\Database;

use App\Core\Entities\Notification;

class NotificationRepository
{
    private array $notifications = [];
    private int $nextId = 1;

    public function __construct()
    {
        // Notifications de test
        $this->notifications = [
            1 => new Notification(
                2, // manager1
                4, // client1
                'order_ready',
                'Commande prête',
                'Vos chemises sont prêtes à être récupérées',
                ['orderId' => 1, 'orderNumber' => 'CMD-001']
            ),
            2 => new Notification(
                2, // manager1
                4, // client1
                'order_progress',
                'Commande en cours',
                'Votre costume est actuellement en nettoyage',
                ['orderId' => 2, 'orderNumber' => 'CMD-002']
            ),
            3 => new Notification(
                2, // manager1
                5, // client2
                'loyalty_points',
                'Points fidélité',
                'Vous avez gagné 15 points avec votre dernière commande',
                ['points' => 15, 'total' => 125]
            ),
            4 => new Notification(
                1, // admin
                2, // manager1
                'general',
                'Nouveau produit en stock',
                'Le détachant premium est maintenant disponible',
                ['productId' => 5, 'productName' => 'Détachant Premium']
            )
        ];

        // Définir les IDs et dates
        foreach ($this->notifications as $id => $notification) {
            $notification->setId($id);
        }

        // Marquer certaines comme lues
        $this->notifications[3]->markAsRead();

        $this->nextId = count($this->notifications) + 1;
    }

    public function findById(int $id): ?Notification
    {
        return $this->notifications[$id] ?? null;
    }

    public function findByReceiverId(int $receiverId): array
    {
        $results = [];
        foreach ($this->notifications as $notification) {
            if ($notification->getReceiverId() === $receiverId) {
                $results[] = $notification;
            }
        }

        // Trier par date de création (plus récent en premier)
        usort($results, function($a, $b) {
            return $b->getCreatedAt() <=> $a->getCreatedAt();
        });

        return $results;
    }

    public function findBySenderId(int $senderId): array
    {
        $results = [];
        foreach ($this->notifications as $notification) {
            if ($notification->getSenderId() === $senderId) {
                $results[] = $notification;
            }
        }

        // Trier par date de création (plus récent en premier)
        usort($results, function($a, $b) {
            return $b->getCreatedAt() <=> $a->getCreatedAt();
        });

        return $results;
    }

    public function findUnreadByReceiverId(int $receiverId): array
    {
        $results = [];
        foreach ($this->notifications as $notification) {
            if ($notification->getReceiverId() === $receiverId && !$notification->isRead()) {
                $results[] = $notification;
            }
        }

        return $results;
    }

    public function countUnreadByReceiverId(int $receiverId): int
    {
        $count = 0;
        foreach ($this->notifications as $notification) {
            if ($notification->getReceiverId() === $receiverId && !$notification->isRead()) {
                $count++;
            }
        }
        return $count;
    }

    public function save(Notification $notification): Notification
    {
        if ($notification->getId() === null) {
            $notification->setId($this->nextId++);
        }

        $this->notifications[$notification->getId()] = $notification;
        return $notification;
    }

    public function delete(int $id): bool
    {
        if (isset($this->notifications[$id])) {
            unset($this->notifications[$id]);
            return true;
        }
        return false;
    }

    public function markAsRead(int $id): bool
    {
        if (isset($this->notifications[$id])) {
            $this->notifications[$id]->markAsRead();
            return true;
        }
        return false;
    }

    public function markAllAsReadForUser(int $receiverId): int
    {
        $count = 0;
        foreach ($this->notifications as $notification) {
            if ($notification->getReceiverId() === $receiverId && !$notification->isRead()) {
                $notification->markAsRead();
                $count++;
            }
        }
        return $count;
    }

    public function findAll(): array
    {
        return array_values($this->notifications);
    }

    public function findRecent(int $limit = 10): array
    {
        $all = array_values($this->notifications);
        
        // Trier par date de création (plus récent en premier)
        usort($all, function($a, $b) {
            return $b->getCreatedAt() <=> $a->getCreatedAt();
        });

        return array_slice($all, 0, $limit);
    }

    public function findByType(string $type): array
    {
        $results = [];
        foreach ($this->notifications as $notification) {
            if ($notification->getType() === $type) {
                $results[] = $notification;
            }
        }
        return $results;
    }

    public function getStatistics(): array
    {
        $total = count($this->notifications);
        $unread = 0;
        $byType = [];

        foreach ($this->notifications as $notification) {
            if (!$notification->isRead()) {
                $unread++;
            }

            $type = $notification->getType();
            $byType[$type] = ($byType[$type] ?? 0) + 1;
        }

        return [
            'total' => $total,
            'unread' => $unread,
            'read' => $total - $unread,
            'byType' => $byType
        ];
    }
}
