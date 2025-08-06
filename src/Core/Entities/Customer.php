<?php

declare(strict_types=1);

namespace App\Core\Entities;

class Customer
{
    private ?int $id;
    private string $firstName;
    private string $lastName;
    private string $email;
    private string $phone;
    private string $address;
    private string $city;
    private string $postalCode;
    private int $loyaltyPoints;
    private \DateTime $createdAt;
    private ?\DateTime $updatedAt;

    public function __construct(
        string $firstName,
        string $lastName,
        string $email,
        string $phone,
        string $address,
        string $city,
        string $postalCode,
        int $loyaltyPoints = 0,
        ?int $id = null,
        ?\DateTime $createdAt = null,
        ?\DateTime $updatedAt = null
    ) {
        $this->firstName = $firstName;
        $this->lastName = $lastName;
        $this->email = $email;
        $this->phone = $phone;
        $this->address = $address;
        $this->city = $city;
        $this->postalCode = $postalCode;
        $this->loyaltyPoints = $loyaltyPoints;
        $this->id = $id;
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

    public function getFirstName(): string
    {
        return $this->firstName;
    }

    public function getLastName(): string
    {
        return $this->lastName;
    }

    public function getFullName(): string
    {
        return $this->firstName . ' ' . $this->lastName;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function getPhone(): string
    {
        return $this->phone;
    }

    public function getAddress(): string
    {
        return $this->address;
    }

    public function getCity(): string
    {
        return $this->city;
    }

    public function getPostalCode(): string
    {
        return $this->postalCode;
    }

    public function getFullAddress(): string
    {
        return $this->address . ', ' . $this->postalCode . ' ' . $this->city;
    }

    public function getLoyaltyPoints(): int
    {
        return $this->loyaltyPoints;
    }

    public function getCreatedAt(): \DateTime
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?\DateTime
    {
        return $this->updatedAt;
    }

    public function updateProfile(
        string $firstName,
        string $lastName,
        string $email,
        string $phone,
        string $address,
        string $city,
        string $postalCode
    ): void {
        $this->firstName = $firstName;
        $this->lastName = $lastName;
        $this->email = $email;
        $this->phone = $phone;
        $this->address = $address;
        $this->city = $city;
        $this->postalCode = $postalCode;
        $this->updatedAt = new \DateTime();
    }

    public function addLoyaltyPoints(int $points): void
    {
        $this->loyaltyPoints += $points;
        $this->updatedAt = new \DateTime();
    }

    public function useLoyaltyPoints(int $points): bool
    {
        if ($this->loyaltyPoints >= $points) {
            $this->loyaltyPoints -= $points;
            $this->updatedAt = new \DateTime();
            return true;
        }
        return false;
    }

    public function getLoyaltyLevel(): string
    {
        if ($this->loyaltyPoints >= 1000) {
            return 'Gold';
        } elseif ($this->loyaltyPoints >= 500) {
            return 'Silver';
        } elseif ($this->loyaltyPoints >= 100) {
            return 'Bronze';
        }
        return 'New';
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'firstName' => $this->firstName,
            'lastName' => $this->lastName,
            'fullName' => $this->getFullName(),
            'email' => $this->email,
            'phone' => $this->phone,
            'address' => $this->address,
            'city' => $this->city,
            'postalCode' => $this->postalCode,
            'fullAddress' => $this->getFullAddress(),
            'loyaltyPoints' => $this->loyaltyPoints,
            'loyaltyLevel' => $this->getLoyaltyLevel(),
            'createdAt' => $this->createdAt->format('Y-m-d H:i:s'),
            'updatedAt' => $this->updatedAt?->format('Y-m-d H:i:s'),
        ];
    }
}