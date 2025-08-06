<?php

declare(strict_types=1);

namespace App\Core\Interfaces;

use App\Core\Entities\User;

interface UserRepositoryInterface
{
    public function findById(int $id): ?User;
    public function findByUsername(string $username): ?User;
    public function findByEmail(string $email): ?User;
    public function save(User $user): User;
    public function delete(int $id): bool;
    public function findAll(): array;
    public function findByRole(string $role): array;
    public function count(): int;
} 