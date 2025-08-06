<?php

declare(strict_types=1);

namespace App\Core\Entities;

class Notification
{
    private ?int $id = null;
    private int $senderId;
    private int $receiverId;
    private string $type;
    private string $title;
    private string $message;
    private array $data;
    private bool $isRead = false;
    private \DateTime $createdAt;
    private ?\DateTime $readAt = null;

    public function __construct(
        int $senderId,
        int $receiverId,
        string $type,
        string $title,
        string $message,
        array $data = []
    ) {
        $this->senderId = $senderId;
        $this->receiverId = $receiverId;
        $this->type = $type;
        $this->title = $title;
        $this->message = $message;
        $this->data = $data;
        $this->createdAt = new \DateTime();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(int $id): void
    {
        $this->id = $id;
    }

    public function getSenderId(): int
    {
        return $this->senderId;
    }

    public function getReceiverId(): int
    {
        return $this->receiverId;
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    public function getMessage(): string
    {
        return $this->message;
    }

    public function getData(): array
    {
        return $this->data;
    }

    public function isRead(): bool
    {
        return $this->isRead;
    }

    public function markAsRead(): void
    {
        $this->isRead = true;
        $this->readAt = new \DateTime();
    }

    public function getCreatedAt(): \DateTime
    {
        return $this->createdAt;
    }

    public function getReadAt(): ?\DateTime
    {
        return $this->readAt;
    }

    public function getTimeAgo(): string
    {
        $now = new \DateTime();
        $diff = $now->diff($this->createdAt);

        if ($diff->days > 0) {
            return $diff->days === 1 ? 'Il y a 1 jour' : "Il y a {$diff->days} jours";
        } elseif ($diff->h > 0) {
            return $diff->h === 1 ? 'Il y a 1 heure' : "Il y a {$diff->h} heures";
        } elseif ($diff->i > 0) {
            return $diff->i === 1 ? 'Il y a 1 minute' : "Il y a {$diff->i} minutes";
        } else {
            return 'À l\'instant';
        }
    }

    public function getIcon(): string
    {
        return match ($this->type) {
            'order_ready' => 'fas fa-check-circle',
            'order_progress' => 'fas fa-cog',
            'order_received' => 'fas fa-inbox',
            'payment_received' => 'fas fa-credit-card',
            'loyalty_points' => 'fas fa-star',
            'general' => 'fas fa-info-circle',
            default => 'fas fa-bell'
        };
    }

    public function getColor(): string
    {
        return match ($this->type) {
            'order_ready' => '#10b981',
            'order_progress' => '#2563eb',
            'order_received' => '#f59e0b',
            'payment_received' => '#8b5cf6',
            'loyalty_points' => '#f59e0b',
            'general' => '#64748b',
            default => '#64748b'
        };
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'senderId' => $this->senderId,
            'receiverId' => $this->receiverId,
            'type' => $this->type,
            'title' => $this->title,
            'message' => $this->message,
            'data' => $this->data,
            'isRead' => $this->isRead,
            'createdAt' => $this->createdAt->format('Y-m-d H:i:s'),
            'readAt' => $this->readAt?->format('Y-m-d H:i:s'),
            'timeAgo' => $this->getTimeAgo(),
            'icon' => $this->getIcon(),
            'color' => $this->getColor()
        ];
    }
}
