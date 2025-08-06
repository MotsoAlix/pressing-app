<?php

declare(strict_types=1);

namespace App\Core\Entities;

class Order
{
    private ?int $id;
    private string $trackingCode;
    private int $customerId;
    private int $userId;
    private string $status;
    private float $totalAmount;
    private float $paidAmount;
    private \DateTime $estimatedReadyDate;
    private ?\DateTime $readyDate;
    private ?\DateTime $deliveredDate;
    private string $notes;
    private \DateTime $createdAt;
    private ?\DateTime $updatedAt;

    public const STATUS_RECEIVED = 'received';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_READY = 'ready';
    public const STATUS_DELIVERED = 'delivered';
    public const STATUS_CANCELLED = 'cancelled';

    public function __construct(
        int $customerId,
        int $userId,
        float $totalAmount,
        \DateTime $estimatedReadyDate,
        string $notes = '',
        string $status = self::STATUS_RECEIVED,
        ?int $id = null,
        ?string $trackingCode = null,
        float $paidAmount = 0.0,
        ?\DateTime $readyDate = null,
        ?\DateTime $deliveredDate = null,
        ?\DateTime $createdAt = null,
        ?\DateTime $updatedAt = null
    ) {
        $this->customerId = $customerId;
        $this->userId = $userId;
        $this->totalAmount = $totalAmount;
        $this->estimatedReadyDate = $estimatedReadyDate;
        $this->notes = $notes;
        $this->status = $status;
        $this->id = $id;
        $this->trackingCode = $trackingCode ?? $this->generateTrackingCode();
        $this->paidAmount = $paidAmount;
        $this->readyDate = $readyDate;
        $this->deliveredDate = $deliveredDate;
        $this->createdAt = $createdAt ?? new \DateTime();
        $this->updatedAt = $updatedAt;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(int $id): void
    {
        $this->id = $id;
    }

    public function getTrackingCode(): string
    {
        return $this->trackingCode;
    }

    public function setTrackingCode(string $trackingCode): void
    {
        $this->trackingCode = $trackingCode;
    }

    public function getCustomerId(): int
    {
        return $this->customerId;
    }

    public function getUserId(): int
    {
        return $this->userId;
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function setStatus(string $status): void
    {
        $this->status = $status;
        $this->updatedAt = new \DateTime();
    }

    public function getTotalAmount(): float
    {
        return $this->totalAmount;
    }

    public function getPaidAmount(): float
    {
        return $this->paidAmount;
    }

    public function getOutstandingAmount(): float
    {
        return $this->totalAmount - $this->paidAmount;
    }

    public function getEstimatedReadyDate(): \DateTime
    {
        return $this->estimatedReadyDate;
    }

    public function getReadyDate(): ?\DateTime
    {
        return $this->readyDate;
    }

    public function getDeliveredDate(): ?\DateTime
    {
        return $this->deliveredDate;
    }

    public function getNotes(): string
    {
        return $this->notes;
    }

    public function getCreatedAt(): \DateTime
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?\DateTime
    {
        return $this->updatedAt;
    }

    public function isPaid(): bool
    {
        return $this->paidAmount >= $this->totalAmount;
    }

    public function isOverdue(): bool
    {
        return $this->status !== self::STATUS_DELIVERED && 
               $this->status !== self::STATUS_CANCELLED &&
               $this->estimatedReadyDate < new \DateTime();
    }

    public function updateStatus(string $status): void
    {
        $this->status = $status;
        $this->updatedAt = new \DateTime();

        switch ($status) {
            case self::STATUS_READY:
                $this->readyDate = new \DateTime();
                break;
            case self::STATUS_DELIVERED:
                $this->deliveredDate = new \DateTime();
                break;
        }
    }

    public function addPayment(float $amount): void
    {
        $this->paidAmount += $amount;
        $this->updatedAt = new \DateTime();
    }

    public function updateNotes(string $notes): void
    {
        $this->notes = $notes;
        $this->updatedAt = new \DateTime();
    }

    public function updateEstimatedReadyDate(\DateTime $date): void
    {
        $this->estimatedReadyDate = $date;
        $this->updatedAt = new \DateTime();
    }

    private function generateTrackingCode(): string
    {
        return 'PRS' . date('Ymd') . strtoupper(substr(uniqid(), -6));
    }

    public function getStatusLabel(): string
    {
        return match($this->status) {
            self::STATUS_RECEIVED => 'Reçu',
            self::STATUS_IN_PROGRESS => 'En cours',
            self::STATUS_READY => 'Prêt',
            self::STATUS_DELIVERED => 'Livré',
            self::STATUS_CANCELLED => 'Annulé',
            default => 'Inconnu'
        };
    }

    public function getStatusColor(): string
    {
        return match($this->status) {
            self::STATUS_RECEIVED => '#6366f1',
            self::STATUS_IN_PROGRESS => '#f59e0b',
            self::STATUS_READY => '#10b981',
            self::STATUS_DELIVERED => '#64748b',
            self::STATUS_CANCELLED => '#ef4444',
            default => '#6b7280'
        };
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'trackingCode' => $this->trackingCode,
            'customerId' => $this->customerId,
            'userId' => $this->userId,
            'status' => $this->status,
            'statusLabel' => $this->getStatusLabel(),
            'statusColor' => $this->getStatusColor(),
            'totalAmount' => $this->totalAmount,
            'paidAmount' => $this->paidAmount,
            'outstandingAmount' => $this->getOutstandingAmount(),
            'isPaid' => $this->isPaid(),
            'isOverdue' => $this->isOverdue(),
            'estimatedReadyDate' => $this->estimatedReadyDate->format('Y-m-d H:i:s'),
            'readyDate' => $this->readyDate?->format('Y-m-d H:i:s'),
            'deliveredDate' => $this->deliveredDate?->format('Y-m-d H:i:s'),
            'notes' => $this->notes,
            'createdAt' => $this->createdAt->format('Y-m-d H:i:s'),
            'updatedAt' => $this->updatedAt?->format('Y-m-d H:i:s'),
        ];
    }
} 