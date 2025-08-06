<?php

declare(strict_types=1);

namespace App\Core\UseCases\Customer;

use App\Core\Entities\Customer;
use App\Core\Interfaces\CustomerRepositoryInterface;

class CreateCustomerUseCase
{
    public function __construct(
        private CustomerRepositoryInterface $customerRepository
    ) {}

    public function execute(array $data): array
    {
        // Validation des données
        $this->validateData($data);

        // Vérifier si l'email existe déjà
        $existingCustomer = $this->customerRepository->findByEmail($data['email']);
        if ($existingCustomer) {
            throw new \InvalidArgumentException('Un client avec cet email existe déjà');
        }

        // Vérifier si le téléphone existe déjà
        $existingCustomer = $this->customerRepository->findByPhone($data['phone']);
        if ($existingCustomer) {
            throw new \InvalidArgumentException('Un client avec ce numéro de téléphone existe déjà');
        }

        // Créer le client
        $customer = new Customer(
            $data['firstName'],
            $data['lastName'],
            $data['email'],
            $data['phone'],
            $data['address'],
            $data['city'],
            $data['postalCode'],
            $data['loyaltyPoints'] ?? 0
        );

        // Sauvegarder le client
        $savedCustomer = $this->customerRepository->save($customer);

        return [
            'success' => true,
            'customer' => $savedCustomer->toArray(),
            'message' => 'Client créé avec succès'
        ];
    }

    private function validateData(array $data): void
    {
        $requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'postalCode'];
        
        foreach ($requiredFields as $field) {
            if (empty($data[$field])) {
                throw new \InvalidArgumentException("Le champ '$field' est requis");
            }
        }

        // Validation de l'email
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            throw new \InvalidArgumentException('Format d\'email invalide');
        }

        // Validation du téléphone (format français basique)
        if (!preg_match('/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/', $data['phone'])) {
            throw new \InvalidArgumentException('Format de téléphone invalide');
        }

        // Validation du code postal
        if (!preg_match('/^\d{5}$/', $data['postalCode'])) {
            throw new \InvalidArgumentException('Format de code postal invalide');
        }
    }
} 