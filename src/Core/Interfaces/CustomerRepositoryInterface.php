<?php

declare(strict_types=1);

namespace App\Core\Interfaces;

use App\Core\Entities\Customer;

interface CustomerRepositoryInterface
{
    public function findById(int $id): ?Customer;
    public function findByEmail(string $email): ?Customer;
    public function findByPhone(string $phone): ?Customer;
    public function save(Customer $customer): Customer;
    public function delete(int $id): bool;
    public function findAll(): array;
    public function search(string $query): array;
    public function findByLoyaltyLevel(string $level): array;
    public function count(): int;
} 