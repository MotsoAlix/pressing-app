<?php

declare(strict_types=1);

namespace App\Infrastructure\Database;

use App\Core\Interfaces\UserRepositoryInterface;
use App\Core\Entities\User;

class UserRepository implements UserRepositoryInterface
{
    private array $users = [];

    public function __construct()
    {
        // Utilisateurs de test avec les 3 rôles
        $this->users = [
            'admin' => new User(
                'admin',
                'admin@manohpressing.com',
                password_hash('admin123', PASSWORD_DEFAULT),
                'admin',
                'Administrateur',
                'Système',
                1
            ),
            'manager1' => new User(
                'manager1',
                'manager1@manohpressing.com',
                password_hash('manager123', PASSWORD_DEFAULT),
                'manager',
                'Jean',
                'Dupont',
                2
            ),
            'manager2' => new User(
                'manager2',
                'manager2@manohpressing.com',
                password_hash('manager123', PASSWORD_DEFAULT),
                'manager',
                'Marie',
                'Martin',
                3
            ),
            'client1' => new User(
                'client1',
                'client1@manohpressing.com',
                password_hash('client123', PASSWORD_DEFAULT),
                'client',
                'Pierre',
                'Bernard',
                4
            ),
            'client2' => new User(
                'client2',
                'client2@manohpressing.com',
                password_hash('client123', PASSWORD_DEFAULT),
                'client',
                'Sophie',
                'Dubois',
                5
            )
        ];
    }

    public function findById(int $id): ?User
    {
        foreach ($this->users as $user) {
            if ($user->getId() === $id) {
                return $user;
            }
        }
        return null;
    }

    public function findByUsername(string $username): ?User
    {
        return $this->users[$username] ?? null;
    }

    public function findByEmail(string $email): ?User
    {
        foreach ($this->users as $user) {
            if ($user->getEmail() === $email) {
                return $user;
            }
        }
        return null;
    }

    public function save(User $user): User
    {
        $this->users[$user->getUsername()] = $user;
        return $user;
    }

    public function delete(int $id): bool
    {
        foreach ($this->users as $key => $user) {
            if ($user->getId() === $id) {
                unset($this->users[$key]);
                return true;
            }
        }
        return false;
    }

    public function findAll(): array
    {
        return array_values($this->users);
    }

    public function findByRole(string $role): array
    {
        $result = [];
        foreach ($this->users as $user) {
            if ($user->getRole() === $role) {
                $result[] = $user;
            }
        }
        return $result;
    }

    public function count(): int
    {
        return count($this->users);
    }
} 