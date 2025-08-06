<?php

declare(strict_types=1);

namespace App\Core\Entities;

class StockItem
{
    private ?int $id = null;
    private string $name;
    private string $description;
    private string $category;
    private int $quantity;
    private int $minQuantity;
    private float $unitPrice;
    private string $unit; // litre, kg, pièce, etc.
    private string $supplier;
    private ?\DateTime $expiryDate = null;
    private \DateTime $createdAt;
    private ?\DateTime $updatedAt = null;

    public function __construct(
        string $name,
        string $description,
        string $category,
        int $quantity,
        int $minQuantity,
        float $unitPrice,
        string $unit = 'pièce',
        string $supplier = '',
        ?\DateTime $expiryDate = null
    ) {
        $this->name = $name;
        $this->description = $description;
        $this->category = $category;
        $this->quantity = $quantity;
        $this->minQuantity = $minQuantity;
        $this->unitPrice = $unitPrice;
        $this->unit = $unit;
        $this->supplier = $supplier;
        $this->expiryDate = $expiryDate;
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

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): void
    {
        $this->name = $name;
        $this->updatedAt = new \DateTime();
    }

    public function getDescription(): string
    {
        return $this->description;
    }

    public function setDescription(string $description): void
    {
        $this->description = $description;
        $this->updatedAt = new \DateTime();
    }

    public function getCategory(): string
    {
        return $this->category;
    }

    public function setCategory(string $category): void
    {
        $this->category = $category;
        $this->updatedAt = new \DateTime();
    }

    public function getQuantity(): int
    {
        return $this->quantity;
    }

    public function setQuantity(int $quantity): void
    {
        $this->quantity = $quantity;
        $this->updatedAt = new \DateTime();
    }

    public function addQuantity(int $quantity): void
    {
        $this->quantity += $quantity;
        $this->updatedAt = new \DateTime();
    }

    public function removeQuantity(int $quantity): bool
    {
        if ($this->quantity >= $quantity) {
            $this->quantity -= $quantity;
            $this->updatedAt = new \DateTime();
            return true;
        }
        return false;
    }

    public function getMinQuantity(): int
    {
        return $this->minQuantity;
    }

    public function setMinQuantity(int $minQuantity): void
    {
        $this->minQuantity = $minQuantity;
        $this->updatedAt = new \DateTime();
    }

    public function getUnitPrice(): float
    {
        return $this->unitPrice;
    }

    public function setUnitPrice(float $unitPrice): void
    {
        $this->unitPrice = $unitPrice;
        $this->updatedAt = new \DateTime();
    }

    public function getUnit(): string
    {
        return $this->unit;
    }

    public function setUnit(string $unit): void
    {
        $this->unit = $unit;
        $this->updatedAt = new \DateTime();
    }

    public function getSupplier(): string
    {
        return $this->supplier;
    }

    public function setSupplier(string $supplier): void
    {
        $this->supplier = $supplier;
        $this->updatedAt = new \DateTime();
    }

    public function getExpiryDate(): ?\DateTime
    {
        return $this->expiryDate;
    }

    public function setExpiryDate(?\DateTime $expiryDate): void
    {
        $this->expiryDate = $expiryDate;
        $this->updatedAt = new \DateTime();
    }

    public function getCreatedAt(): \DateTime
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?\DateTime
    {
        return $this->updatedAt;
    }

    public function isLowStock(): bool
    {
        return $this->quantity <= $this->minQuantity;
    }

    public function isExpired(): bool
    {
        if (!$this->expiryDate) {
            return false;
        }
        return $this->expiryDate < new \DateTime();
    }

    public function isExpiringSoon(int $days = 30): bool
    {
        if (!$this->expiryDate) {
            return false;
        }
        $threshold = new \DateTime();
        $threshold->add(new \DateInterval("P{$days}D"));
        return $this->expiryDate <= $threshold;
    }

    public function getTotalValue(): float
    {
        return $this->quantity * $this->unitPrice;
    }

    public function getStatus(): string
    {
        if ($this->isExpired()) {
            return 'expired';
        }
        if ($this->isExpiringSoon()) {
            return 'expiring';
        }
        if ($this->isLowStock()) {
            return 'low_stock';
        }
        return 'normal';
    }

    public function getStatusColor(): string
    {
        return match ($this->getStatus()) {
            'expired' => '#ef4444',
            'expiring' => '#f59e0b',
            'low_stock' => '#f59e0b',
            'normal' => '#10b981'
        };
    }

    public function getStatusLabel(): string
    {
        return match ($this->getStatus()) {
            'expired' => 'Expiré',
            'expiring' => 'Expire bientôt',
            'low_stock' => 'Stock faible',
            'normal' => 'Normal'
        };
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'category' => $this->category,
            'quantity' => $this->quantity,
            'minQuantity' => $this->minQuantity,
            'unitPrice' => $this->unitPrice,
            'unit' => $this->unit,
            'supplier' => $this->supplier,
            'expiryDate' => $this->expiryDate?->format('Y-m-d'),
            'createdAt' => $this->createdAt->format('Y-m-d H:i:s'),
            'updatedAt' => $this->updatedAt?->format('Y-m-d H:i:s'),
            'isLowStock' => $this->isLowStock(),
            'isExpired' => $this->isExpired(),
            'isExpiringSoon' => $this->isExpiringSoon(),
            'totalValue' => $this->getTotalValue(),
            'status' => $this->getStatus(),
            'statusColor' => $this->getStatusColor(),
            'statusLabel' => $this->getStatusLabel()
        ];
    }
}
