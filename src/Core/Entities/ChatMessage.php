<?php

declare(strict_types=1);

namespace App\Core\Entities;

class ChatMessage
{
    private ?int $id = null;
    private int $senderId;
    private int $receiverId;
    private string $message;
    private string $type = 'text'; // text, image, file
    private array $attachments = [];
    private bool $isRead = false;
    private \DateTime $createdAt;
    private ?\DateTime $readAt = null;
    private ?\DateTime $editedAt = null;

    public function __construct(
        int $senderId,
        int $receiverId,
        string $message,
        string $type = 'text',
        array $attachments = []
    ) {
        $this->senderId = $senderId;
        $this->receiverId = $receiverId;
        $this->message = $message;
        $this->type = $type;
        $this->attachments = $attachments;
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

    public function getMessage(): string
    {
        return $this->message;
    }

    public function setMessage(string $message): void
    {
        $this->message = $message;
        $this->editedAt = new \DateTime();
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function getAttachments(): array
    {
        return $this->attachments;
    }

    public function addAttachment(array $attachment): void
    {
        $this->attachments[] = $attachment;
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

    public function getEditedAt(): ?\DateTime
    {
        return $this->editedAt;
    }

    public function isEdited(): bool
    {
        return $this->editedAt !== null;
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

    public function getFormattedTime(): string
    {
        return $this->createdAt->format('H:i');
    }

    public function getFormattedDate(): string
    {
        return $this->createdAt->format('d/m/Y');
    }

    public function isFromToday(): bool
    {
        $today = new \DateTime();
        return $this->createdAt->format('Y-m-d') === $today->format('Y-m-d');
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'senderId' => $this->senderId,
            'receiverId' => $this->receiverId,
            'message' => $this->message,
            'type' => $this->type,
            'attachments' => $this->attachments,
            'isRead' => $this->isRead,
            'isEdited' => $this->isEdited(),
            'createdAt' => $this->createdAt->format('Y-m-d H:i:s'),
            'readAt' => $this->readAt?->format('Y-m-d H:i:s'),
            'editedAt' => $this->editedAt?->format('Y-m-d H:i:s'),
            'timeAgo' => $this->getTimeAgo(),
            'formattedTime' => $this->getFormattedTime(),
            'formattedDate' => $this->getFormattedDate(),
            'isFromToday' => $this->isFromToday()
        ];
    }
}
