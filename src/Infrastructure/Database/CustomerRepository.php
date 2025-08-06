<?php

declare(strict_types=1);

namespace App\Infrastructure\Database;

use App\Core\Interfaces\CustomerRepositoryInterface;
use App\Core\Entities\Customer;

class CustomerRepository implements CustomerRepositoryInterface
{
    private array $customers = [];
    private int $nextId = 1;

    public function __construct()
    {
        // Clients de test
        $this->customers = [
            1 => new Customer(
                'Jean',
                'Dupont',
                'jean.dupont@email.com',
                '0123456789',
                '123 Rue de la Paix',
                'Paris',
                '75001',
                50
            ),
            2 => new Customer(
                'Marie',
                'Martin',
                'marie.martin@email.com',
                '0987654321',
                '456 Avenue des Champs',
                'Lyon',
                '69001',
                25
            ),
            3 => new Customer(
                'Pierre',
                'Bernard',
                'pierre.bernard@email.com',
                '0147258369',
                '789 Boulevard Saint-Germain',
                'Marseille',
                '13001',
                100
            )
        ];
        
        // Définir les IDs pour les clients existants
        foreach ($this->customers as $id => $customer) {
            $customer->setId($id);
        }
        
        $this->nextId = count($this->customers) + 1;
    }

    public function findById(int $id): ?Customer
    {
        return $this->customers[$id] ?? null;
    }

    public function findByEmail(string $email): ?Customer
    {
        foreach ($this->customers as $customer) {
            if ($customer->getEmail() === $email) {
                return $customer;
            }
        }
        return null;
    }

    public function findByPhone(string $phone): ?Customer
    {
        foreach ($this->customers as $customer) {
            if ($customer->getPhone() === $phone) {
                return $customer;
            }
        }
        return null;
    }

    public function save(Customer $customer): Customer
    {
        if ($customer->getId() === null) {
            $customer->setId($this->nextId++);
        }
        
        $this->customers[$customer->getId()] = $customer;
        return $customer;
    }

    public function delete(int $id): bool
    {
        if (isset($this->customers[$id])) {
            unset($this->customers[$id]);
            return true;
        }
        return false;
    }

    public function findAll(): array
    {
        return array_values($this->customers);
    }

    public function search(string $query): array
    {
        $results = [];
        $query = strtolower($query);
        
        foreach ($this->customers as $customer) {
            $fullName = strtolower($customer->getFirstName() . ' ' . $customer->getLastName());
            $email = strtolower($customer->getEmail());
            $phone = $customer->getPhone();
            
            if (strpos($fullName, $query) !== false || 
                strpos($email, $query) !== false || 
                strpos($phone, $query) !== false) {
                $results[] = $customer;
            }
        }
        
        return $results;
    }

    public function findByLoyaltyLevel(string $level): array
    {
        $results = [];
        
        foreach ($this->customers as $customer) {
            $points = $customer->getLoyaltyPoints();
            $customerLevel = $this->getLoyaltyLevel($points);
            
            if ($customerLevel === $level) {
                $results[] = $customer;
            }
        }
        
        return $results;
    }

    public function count(): int
    {
        return count($this->customers);
    }

    private function getLoyaltyLevel(int $points): string
    {
        if ($points >= 100) {
            return 'gold';
        } elseif ($points >= 50) {
            return 'silver';
        } else {
            return 'bronze';
        }
    }
}
