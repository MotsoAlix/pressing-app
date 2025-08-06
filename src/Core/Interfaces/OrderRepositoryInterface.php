<?php

declare(strict_types=1);

namespace App\Core\Interfaces;

use App\Core\Entities\Order;

interface OrderRepositoryInterface
{
    public function findById(int $id): ?Order;
    public function findByTrackingCode(string $trackingCode): ?Order;
    public function findByCustomerId(int $customerId): array;
    public function findByStatus(string $status): array;
    public function save(Order $order): Order;
    public function delete(int $id): bool;
    public function findAll(): array;
    public function findOverdue(): array;
    public function findToday(): array;
    public function findThisWeek(): array;
    public function findThisMonth(): array;
    public function count(): int;
    public function countByStatus(string $status): int;
    public function getTotalRevenue(\DateTime $startDate, \DateTime $endDate): float;
} 