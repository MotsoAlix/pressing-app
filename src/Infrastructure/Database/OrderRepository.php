<?php

declare(strict_types=1);

namespace App\Infrastructure\Database;

use App\Core\Interfaces\OrderRepositoryInterface;
use App\Core\Entities\Order;

class OrderRepository implements OrderRepositoryInterface
{
    private array $orders = [];
    private int $nextId = 1;

    public function __construct()
    {
        // Commandes de test
        $today = new \DateTime();
        $tomorrow = new \DateTime('+1 day');
        $nextWeek = new \DateTime('+7 days');
        
        $this->orders = [
            1 => new Order(
                1, // customerId
                1, // userId
                45.50,
                $tomorrow,
                'Nettoyage à sec - costume'
            ),
            2 => new Order(
                2, // customerId
                1, // userId
                25.00,
                $nextWeek,
                'Repassage - chemises'
            ),
            3 => new Order(
                1, // customerId
                1, // userId
                75.00,
                $today,
                'Nettoyage - robe de soirée'
            )
        ];
        
        // Définir les IDs et codes de suivi pour les commandes existantes
        foreach ($this->orders as $id => $order) {
            $order->setId($id);
            $order->setTrackingCode('TR' . str_pad((string)$id, 6, '0', STR_PAD_LEFT));
        }
        
        // Définir différents statuts pour les tests
        $this->orders[1]->setStatus('in_progress');
        $this->orders[2]->setStatus('pending');
        $this->orders[3]->setStatus('ready');
        
        $this->nextId = count($this->orders) + 1;
    }

    public function findById(int $id): ?Order
    {
        return $this->orders[$id] ?? null;
    }

    public function findByTrackingCode(string $trackingCode): ?Order
    {
        foreach ($this->orders as $order) {
            if ($order->getTrackingCode() === $trackingCode) {
                return $order;
            }
        }
        return null;
    }

    public function findByCustomerId(int $customerId): array
    {
        $results = [];
        foreach ($this->orders as $order) {
            if ($order->getCustomerId() === $customerId) {
                $results[] = $order;
            }
        }
        return $results;
    }

    public function findByStatus(string $status): array
    {
        $results = [];
        foreach ($this->orders as $order) {
            if ($order->getStatus() === $status) {
                $results[] = $order;
            }
        }
        return $results;
    }

    public function save(Order $order): Order
    {
        if ($order->getId() === null) {
            $order->setId($this->nextId++);
            $order->setTrackingCode('TR' . str_pad((string)$order->getId(), 6, '0', STR_PAD_LEFT));
        }
        
        $this->orders[$order->getId()] = $order;
        return $order;
    }

    public function delete(int $id): bool
    {
        if (isset($this->orders[$id])) {
            unset($this->orders[$id]);
            return true;
        }
        return false;
    }

    public function findAll(): array
    {
        return array_values($this->orders);
    }

    public function findOverdue(): array
    {
        $results = [];
        $now = new \DateTime();
        
        foreach ($this->orders as $order) {
            if ($order->getEstimatedReadyDate() < $now && $order->getStatus() !== 'delivered') {
                $results[] = $order;
            }
        }
        
        return $results;
    }

    public function findToday(): array
    {
        $results = [];
        $today = new \DateTime();
        $today->setTime(0, 0, 0);
        $tomorrow = clone $today;
        $tomorrow->add(new \DateInterval('P1D'));
        
        foreach ($this->orders as $order) {
            $createdAt = $order->getCreatedAt();
            if ($createdAt >= $today && $createdAt < $tomorrow) {
                $results[] = $order;
            }
        }
        
        return $results;
    }

    public function findThisWeek(): array
    {
        $results = [];
        $startOfWeek = new \DateTime();
        $startOfWeek->setISODate((int)$startOfWeek->format('o'), (int)$startOfWeek->format('W'));
        $startOfWeek->setTime(0, 0, 0);
        $endOfWeek = clone $startOfWeek;
        $endOfWeek->add(new \DateInterval('P7D'));
        
        foreach ($this->orders as $order) {
            $createdAt = $order->getCreatedAt();
            if ($createdAt >= $startOfWeek && $createdAt < $endOfWeek) {
                $results[] = $order;
            }
        }
        
        return $results;
    }

    public function findThisMonth(): array
    {
        $results = [];
        $startOfMonth = new \DateTime();
        $startOfMonth->setDate((int)$startOfMonth->format('Y'), (int)$startOfMonth->format('n'), 1);
        $startOfMonth->setTime(0, 0, 0);
        $endOfMonth = clone $startOfMonth;
        $endOfMonth->add(new \DateInterval('P1M'));
        
        foreach ($this->orders as $order) {
            $createdAt = $order->getCreatedAt();
            if ($createdAt >= $startOfMonth && $createdAt < $endOfMonth) {
                $results[] = $order;
            }
        }
        
        return $results;
    }

    public function count(): int
    {
        return count($this->orders);
    }

    public function countByStatus(string $status): int
    {
        $count = 0;
        foreach ($this->orders as $order) {
            if ($order->getStatus() === $status) {
                $count++;
            }
        }
        return $count;
    }

    public function getTotalRevenue(\DateTime $startDate, \DateTime $endDate): float
    {
        $total = 0.0;
        
        foreach ($this->orders as $order) {
            $createdAt = $order->getCreatedAt();
            if ($createdAt >= $startDate && $createdAt <= $endDate) {
                $total += $order->getTotalAmount();
            }
        }
        
        return $total;
    }
}
