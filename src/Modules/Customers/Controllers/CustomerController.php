<?php

declare(strict_types=1);

namespace App\Modules\Customers\Controllers;

use App\Infrastructure\Web\Request;
use App\Infrastructure\Web\Response;
use App\Infrastructure\Database\CustomerRepository;

class CustomerController
{
    public function __construct(
        private CustomerRepository $customerRepository
    ) {}

    public function index(Request $request): Response
    {
        try {
            $customers = $this->customerRepository->findAll();

            return Response::json([
                'success' => true,
                'data' => array_map(fn($customer) => $customer->toArray(), $customers)
            ]);
        } catch (\Exception $e) {
            return Response::json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function show(Request $request, array $params): Response
    {
        try {
            $id = (int) $params['id'];
            $customer = $this->customerRepository->findById($id);

            if (!$customer) {
                return Response::json([
                    'success' => false,
                    'message' => 'Client non trouvé'
                ], 404);
            }

            return Response::json([
                'success' => true,
                'data' => $customer->toArray()
            ]);
        } catch (\Exception $e) {
            return Response::json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request): Response
    {
        try {
            $data = json_decode($request->getBody(), true);

            // Validation basique
            if (empty($data['firstName']) || empty($data['lastName']) || empty($data['email'])) {
                return Response::json([
                    'success' => false,
                    'message' => 'Données manquantes'
                ], 400);
            }

            // Vérifier si l'email existe déjà
            if ($this->customerRepository->findByEmail($data['email'])) {
                return Response::json([
                    'success' => false,
                    'message' => 'Un client avec cet email existe déjà'
                ], 400);
            }

            $customer = new \App\Core\Entities\Customer(
                $data['firstName'],
                $data['lastName'],
                $data['email'],
                $data['phone'] ?? '',
                $data['address'] ?? '',
                $data['city'] ?? '',
                $data['postalCode'] ?? '',
                $data['loyaltyPoints'] ?? 0
            );

            $savedCustomer = $this->customerRepository->save($customer);

            return Response::json([
                'success' => true,
                'data' => $savedCustomer->toArray()
            ], 201);
        } catch (\Exception $e) {
            return Response::json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, array $params): Response
    {
        try {
            $id = (int) $params['id'];
            $customer = $this->customerRepository->findById($id);

            if (!$customer) {
                return Response::json([
                    'success' => false,
                    'message' => 'Client non trouvé'
                ], 404);
            }

            $data = json_decode($request->getBody(), true);

            $customer->updateProfile(
                $data['firstName'] ?? $customer->getFirstName(),
                $data['lastName'] ?? $customer->getLastName(),
                $data['email'] ?? $customer->getEmail(),
                $data['phone'] ?? $customer->getPhone(),
                $data['address'] ?? $customer->getAddress(),
                $data['city'] ?? $customer->getCity(),
                $data['postalCode'] ?? $customer->getPostalCode()
            );

            $savedCustomer = $this->customerRepository->save($customer);

            return Response::json([
                'success' => true,
                'data' => $savedCustomer->toArray()
            ]);
        } catch (\Exception $e) {
            return Response::json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Request $request, array $params): Response
    {
        try {
            $id = (int) $params['id'];

            if ($this->customerRepository->delete($id)) {
                return Response::json([
                    'success' => true,
                    'message' => 'Client supprimé avec succès'
                ]);
            } else {
                return Response::json([
                    'success' => false,
                    'message' => 'Client non trouvé'
                ], 404);
            }
        } catch (\Exception $e) {
            return Response::json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}