<?php

declare(strict_types=1);

namespace App\Core\UseCases\Order;

use App\Core\Entities\Order;
use App\Core\Interfaces\OrderRepositoryInterface;
use App\Core\Interfaces\CustomerRepositoryInterface;
use App\Infrastructure\Security\SessionManager;

class CreateOrderUseCase
{
    public function __construct(
        private OrderRepositoryInterface $orderRepository,
        private CustomerRepositoryInterface $customerRepository
    ) {}

    public function execute(array $data): array
    {
        // Validation des données
        $this->validateData($data);

        // Vérifier que le client existe
        $customer = $this->customerRepository->findById($data['customerId']);
        if (!$customer) {
            throw new \InvalidArgumentException('Client non trouvé');
        }

        // Récupérer l'utilisateur connecté
        $userId = SessionManager::getUserId();
        if (!$userId) {
            throw new \RuntimeException('Utilisateur non connecté');
        }

        // Calculer la date de livraison estimée (par défaut 3 jours)
        $estimatedReadyDate = new \DateTime();
        $estimatedReadyDate->add(new \DateInterval('P3D'));

        // Créer la commande
        $order = new Order(
            $data['customerId'],
            $userId,
            $data['totalAmount'],
            $estimatedReadyDate,
            $data['notes'] ?? ''
        );

        // Sauvegarder la commande
        $savedOrder = $this->orderRepository->save($order);

        // Ajouter des points de fidélité au client (1 point par euro)
        $loyaltyPoints = (int) floor($data['totalAmount']);
        $customer->addLoyaltyPoints($loyaltyPoints);
        $this->customerRepository->save($customer);

        return [
            'success' => true,
            'order' => $savedOrder->toArray(),
            'customer' => $customer->toArray(),
            'message' => 'Commande créée avec succès'
        ];
    }

    private function validateData(array $data): void
    {
        $requiredFields = ['customerId', 'totalAmount'];
        
        foreach ($requiredFields as $field) {
            if (!isset($data[$field])) {
                throw new \InvalidArgumentException("Le champ '$field' est requis");
            }
        }

        // Validation du client
        if (!is_numeric($data['customerId']) || $data['customerId'] <= 0) {
            throw new \InvalidArgumentException('ID client invalide');
        }

        // Validation du montant
        if (!is_numeric($data['totalAmount']) || $data['totalAmount'] <= 0) {
            throw new \InvalidArgumentException('Montant invalide');
        }

        // Validation des notes (optionnel)
        if (isset($data['notes']) && strlen($data['notes']) > 1000) {
            throw new \InvalidArgumentException('Les notes ne peuvent pas dépasser 1000 caractères');
        }
    }
} 