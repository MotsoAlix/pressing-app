<?php

declare(strict_types=1);

namespace App\Infrastructure\Database;

use App\Core\Entities\ChatMessage;

class ChatRepository
{
    private array $messages = [];
    private int $nextId = 1;

    public function __construct()
    {
        // Messages de test entre gérant et clients
        $this->messages = [
            1 => new ChatMessage(
                4, // client1
                2, // manager1
                'Bonjour, j\'aimerais savoir si ma commande est prête ?',
                'text'
            ),
            2 => new ChatMessage(
                2, // manager1
                4, // client1
                'Bonjour ! Votre commande sera prête demain matin. Je vous enverrai une notification.',
                'text'
            ),
            3 => new ChatMessage(
                4, // client1
                2, // manager1
                'Parfait, merci beaucoup !',
                'text'
            ),
            4 => new ChatMessage(
                5, // client2
                2, // manager1
                'Bonjour, est-ce que vous faites le nettoyage de rideaux ?',
                'text'
            ),
            5 => new ChatMessage(
                2, // manager1
                5, // client2
                'Oui bien sûr ! Nous proposons le nettoyage de rideaux. Vous pouvez les déposer quand vous voulez.',
                'text'
            ),
            6 => new ChatMessage(
                5, // client2
                2, // manager1
                'Génial ! Je passerai demain avec mes rideaux du salon.',
                'text'
            )
        ];

        // Définir les IDs et marquer certains messages comme lus
        foreach ($this->messages as $id => $message) {
            $message->setId($id);
        }

        // Marquer les messages 1, 2, 3 comme lus
        $this->messages[1]->markAsRead();
        $this->messages[2]->markAsRead();
        $this->messages[3]->markAsRead();

        $this->nextId = count($this->messages) + 1;
    }

    public function findById(int $id): ?ChatMessage
    {
        return $this->messages[$id] ?? null;
    }

    public function findConversation(int $user1Id, int $user2Id): array
    {
        $results = [];
        foreach ($this->messages as $message) {
            if (($message->getSenderId() === $user1Id && $message->getReceiverId() === $user2Id) ||
                ($message->getSenderId() === $user2Id && $message->getReceiverId() === $user1Id)) {
                $results[] = $message;
            }
        }

        // Trier par date de création
        usort($results, function($a, $b) {
            return $a->getCreatedAt() <=> $b->getCreatedAt();
        });

        return $results;
    }

    public function findUserConversations(int $userId): array
    {
        $conversations = [];
        
        foreach ($this->messages as $message) {
            $otherUserId = null;
            
            if ($message->getSenderId() === $userId) {
                $otherUserId = $message->getReceiverId();
            } elseif ($message->getReceiverId() === $userId) {
                $otherUserId = $message->getSenderId();
            }
            
            if ($otherUserId) {
                if (!isset($conversations[$otherUserId])) {
                    $conversations[$otherUserId] = [
                        'userId' => $otherUserId,
                        'lastMessage' => $message,
                        'unreadCount' => 0,
                        'messages' => []
                    ];
                }
                
                // Mettre à jour le dernier message si plus récent
                if ($message->getCreatedAt() > $conversations[$otherUserId]['lastMessage']->getCreatedAt()) {
                    $conversations[$otherUserId]['lastMessage'] = $message;
                }
                
                // Compter les messages non lus
                if ($message->getReceiverId() === $userId && !$message->isRead()) {
                    $conversations[$otherUserId]['unreadCount']++;
                }
                
                $conversations[$otherUserId]['messages'][] = $message;
            }
        }

        // Trier par dernier message (plus récent en premier)
        uasort($conversations, function($a, $b) {
            return $b['lastMessage']->getCreatedAt() <=> $a['lastMessage']->getCreatedAt();
        });

        return array_values($conversations);
    }

    public function save(ChatMessage $message): ChatMessage
    {
        if ($message->getId() === null) {
            $message->setId($this->nextId++);
        }

        $this->messages[$message->getId()] = $message;
        return $message;
    }

    public function delete(int $id): bool
    {
        if (isset($this->messages[$id])) {
            unset($this->messages[$id]);
            return true;
        }
        return false;
    }

    public function markAsRead(int $id): bool
    {
        if (isset($this->messages[$id])) {
            $this->messages[$id]->markAsRead();
            return true;
        }
        return false;
    }

    public function markConversationAsRead(int $userId, int $otherUserId): int
    {
        $count = 0;
        foreach ($this->messages as $message) {
            if ($message->getSenderId() === $otherUserId && 
                $message->getReceiverId() === $userId && 
                !$message->isRead()) {
                $message->markAsRead();
                $count++;
            }
        }
        return $count;
    }

    public function countUnreadMessages(int $userId): int
    {
        $count = 0;
        foreach ($this->messages as $message) {
            if ($message->getReceiverId() === $userId && !$message->isRead()) {
                $count++;
            }
        }
        return $count;
    }

    public function findRecentMessages(int $limit = 10): array
    {
        $all = array_values($this->messages);
        
        // Trier par date de création (plus récent en premier)
        usort($all, function($a, $b) {
            return $b->getCreatedAt() <=> $a->getCreatedAt();
        });

        return array_slice($all, 0, $limit);
    }

    public function searchMessages(string $query, ?int $userId = null): array
    {
        $results = [];
        $query = strtolower($query);
        
        foreach ($this->messages as $message) {
            if ($userId && $message->getSenderId() !== $userId && $message->getReceiverId() !== $userId) {
                continue;
            }
            
            if (strpos(strtolower($message->getMessage()), $query) !== false) {
                $results[] = $message;
            }
        }

        // Trier par date de création (plus récent en premier)
        usort($results, function($a, $b) {
            return $b->getCreatedAt() <=> $a->getCreatedAt();
        });

        return $results;
    }

    public function getStatistics(): array
    {
        $total = count($this->messages);
        $unread = 0;
        $today = 0;
        $todayDate = (new \DateTime())->format('Y-m-d');

        foreach ($this->messages as $message) {
            if (!$message->isRead()) {
                $unread++;
            }
            
            if ($message->getCreatedAt()->format('Y-m-d') === $todayDate) {
                $today++;
            }
        }

        return [
            'total' => $total,
            'unread' => $unread,
            'read' => $total - $unread,
            'today' => $today
        ];
    }

    public function findAll(): array
    {
        return array_values($this->messages);
    }
}
