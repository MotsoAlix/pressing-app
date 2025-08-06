<?php

declare(strict_types=1);

namespace App\Modules\Tracking\Controllers;

use App\Infrastructure\Web\Request;
use App\Infrastructure\Web\Response;
use App\Infrastructure\Database\DatabaseConnection;

class TrackingController
{
    private DatabaseConnection $db;

    public function __construct(DatabaseConnection $db)
    {
        $this->db = $db;
    }

    public function index(Request $request): Response
    {
        return Response::json([
            'success' => true,
            'message' => 'Tracking API disponible'
        ]);
    }

    public function searchOrder(Request $request): Response
    {
        $trackingCode = $request->getQuery('code');

        if (!$trackingCode) {
            return Response::json([
                'success' => false,
                'message' => 'Code de suivi requis'
            ], 400);
        }

        // Simulation de recherche
        return Response::json([
            'success' => true,
            'data' => [
                'trackingCode' => $trackingCode,
                'status' => 'in_progress',
                'estimatedReadyDate' => '2025-08-08',
                'message' => 'Votre commande est en cours de traitement'
            ]
        ]);
    }

    public function updateStatus(Request $request, array $params): Response
    {
        $orderId = (int) $params['id'];
        $data = json_decode($request->getBody(), true);

        return Response::json([
            'success' => true,
            'message' => "Statut de la commande $orderId mis à jour"
        ]);
    }

    public function getOrderHistory(Request $request, array $params): Response
    {
        $orderId = (int) $params['id'];

        return Response::json([
            'success' => true,
            'data' => [
                [
                    'date' => '2025-08-05',
                    'status' => 'received',
                    'message' => 'Commande reçue'
                ],
                [
                    'date' => '2025-08-06',
                    'status' => 'in_progress',
                    'message' => 'Traitement en cours'
                ]
            ]
        ]);
    }
}