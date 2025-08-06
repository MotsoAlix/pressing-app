<?php

declare(strict_types=1);

namespace App\Modules\Orders\Controllers;

use App\Infrastructure\Web\Request;
use App\Infrastructure\Web\Response;
use App\Core\UseCases\Order\CreateOrderUseCase;
use App\Core\Entities\Order;
use App\Infrastructure\Database\DatabaseConnection;

class OrderController
{
    private CreateOrderUseCase $createOrderUseCase;
    private DatabaseConnection $db;

    public function __construct(CreateOrderUseCase $createOrderUseCase, DatabaseConnection $db)
    {
        $this->createOrderUseCase = $createOrderUseCase;
        $this->db = $db;
    }

    public function index(Request $request): Response
    {
        $page = (int)($request->getQuery('page') ?? 1);
        $limit = (int)($request->getQuery('limit') ?? 10);
        $status = $request->getQuery('status') ?? '';
        $search = $request->getQuery('search') ?? '';

        try {
            $orders = $this->getOrders($page, $limit, $status, $search);
            $total = $this->getOrdersCount($status, $search);

            return new Response(json_encode([
                'success' => true,
                'data' => [
                    'orders' => $orders,
                    'total' => $total,
                    'page' => $page,
                    'limit' => $limit
                ]
            ]), 200, ['Content-Type' => 'application/json']);
        } catch (\Exception $e) {
            return new Response(json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]), 500, ['Content-Type' => 'application/json']);
        }
    }

    public function show(Request $request, array $params): Response
    {
        $orderId = $params['id'] ?? null;
        
        if (!$orderId) {
            return new Response(json_encode(['success' => false, 'message' => 'ID de commande requis']), 400);
        }

        try {
            $order = $this->getOrderById($orderId);
            
            if (!$order) {
                return new Response(json_encode(['success' => false, 'message' => 'Commande non trouvée']), 404);
            }

            return new Response(json_encode([
                'success' => true,
                'data' => $order
            ]), 200, ['Content-Type' => 'application/json']);
        } catch (\Exception $e) {
            return new Response(json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]), 500, ['Content-Type' => 'application/json']);
        }
    }

    public function store(Request $request): Response
    {
        $data = $request->getBody();
        
        try {
            $order = $this->createOrderUseCase->execute($data);
            
            return new Response(json_encode([
                'success' => true,
                'data' => $order
            ]), 201, ['Content-Type' => 'application/json']);
        } catch (\Exception $e) {
            return new Response(json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]), 400, ['Content-Type' => 'application/json']);
        }
    }

    public function update(Request $request, array $params): Response
    {
        $orderId = $params['id'] ?? null;
        $data = $request->getBody();
        
        if (!$orderId) {
            return new Response(json_encode(['success' => false, 'message' => 'ID de commande requis']), 400);
        }

        try {
            $order = $this->updateOrder($orderId, $data);
            
            return new Response(json_encode([
                'success' => true,
                'data' => $order
            ]), 200, ['Content-Type' => 'application/json']);
        } catch (\Exception $e) {
            return new Response(json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]), 400, ['Content-Type' => 'application/json']);
        }
    }

    public function destroy(Request $request, array $params): Response
    {
        $orderId = $params['id'] ?? null;
        
        if (!$orderId) {
            return new Response(json_encode(['success' => false, 'message' => 'ID de commande requis']), 400);
        }

        try {
            $this->deleteOrder($orderId);
            
            return new Response(json_encode(['success' => true]), 200, ['Content-Type' => 'application/json']);
        } catch (\Exception $e) {
            return new Response(json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]), 500, ['Content-Type' => 'application/json']);
        }
    }

    public function stats(Request $request): Response
    {
        try {
            $stats = $this->getOrderStats();
            
            return new Response(json_encode([
                'success' => true,
                'data' => $stats
            ]), 200, ['Content-Type' => 'application/json']);
        } catch (\Exception $e) {
            return new Response(json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]), 500, ['Content-Type' => 'application/json']);
        }
    }

    private function getOrders(int $page, int $limit, string $status, string $search): array
    {
        $offset = ($page - 1) * $limit;
        $where = [];
        $params = [];

        if ($status) {
            $where[] = 'status = ?';
            $params[] = $status;
        }

        if ($search) {
            $where[] = '(order_id LIKE ? OR customer_name LIKE ?)';
            $params[] = "%$search%";
            $params[] = "%$search%";
        }

        $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';

        $sql = "SELECT * FROM orders $whereClause ORDER BY created_at DESC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    private function getOrdersCount(string $status, string $search): int
    {
        $where = [];
        $params = [];

        if ($status) {
            $where[] = 'status = ?';
            $params[] = $status;
        }

        if ($search) {
            $where[] = '(order_id LIKE ? OR customer_name LIKE ?)';
            $params[] = "%$search%";
            $params[] = "%$search%";
        }

        $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';

        $sql = "SELECT COUNT(*) FROM orders $whereClause";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        
        return (int)$stmt->fetchColumn();
    }

    private function getOrderById(string $orderId): ?array
    {
        $sql = "SELECT * FROM orders WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$orderId]);
        
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        return $result ?: null;
    }

    private function updateOrder(string $orderId, array $data): array
    {
        $sql = "UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$data['status'] ?? 'pending', $orderId]);
        
        return $this->getOrderById($orderId);
    }

    private function deleteOrder(string $orderId): void
    {
        $sql = "DELETE FROM orders WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$orderId]);
    }

    private function getOrderStats(): array
    {
        $sql = "SELECT 
                    COUNT(*) as total_orders,
                    SUM(total_amount) as total_revenue,
                    AVG(total_amount) as avg_order,
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
                    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders
                FROM orders";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }
} 