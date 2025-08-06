<?php

declare(strict_types=1);

namespace App\Modules\Payments\Controllers;

use App\Infrastructure\Web\Request;
use App\Infrastructure\Web\Response;
use App\Infrastructure\Database\DatabaseConnection;

class PaymentController
{
    private DatabaseConnection $db;

    public function __construct(DatabaseConnection $db)
    {
        $this->db = $db;
    }

    public function index(Request $request): Response
    {
        $page = (int)($request->getQuery('page') ?? 1);
        $limit = (int)($request->getQuery('limit') ?? 10);
        $status = $request->getQuery('status') ?? '';
        $method = $request->getQuery('method') ?? '';

        try {
            $payments = $this->getPayments($page, $limit, $status, $method);
            $total = $this->getPaymentsCount($status, $method);

            return new Response(json_encode([
                'success' => true,
                'data' => [
                    'payments' => $payments,
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
        $paymentId = $params['id'] ?? null;
        
        if (!$paymentId) {
            return new Response(json_encode(['success' => false, 'message' => 'ID de paiement requis']), 400);
        }

        try {
            $payment = $this->getPaymentById($paymentId);
            
            if (!$payment) {
                return new Response(json_encode(['success' => false, 'message' => 'Paiement non trouvé']), 404);
            }

            return new Response(json_encode([
                'success' => true,
                'data' => $payment
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
            $payment = $this->createPayment($data);
            
            return new Response(json_encode([
                'success' => true,
                'data' => $payment
            ]), 201, ['Content-Type' => 'application/json']);
        } catch (\Exception $e) {
            return new Response(json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]), 400, ['Content-Type' => 'application/json']);
        }
    }

    public function stats(Request $request): Response
    {
        try {
            $stats = $this->getPaymentStats();
            
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

    public function generateInvoice(Request $request, array $params): Response
    {
        $paymentId = $params['id'] ?? null;
        
        if (!$paymentId) {
            return new Response(json_encode(['success' => false, 'message' => 'ID de paiement requis']), 400);
        }

        try {
            $invoice = $this->getInvoiceData($paymentId);
            
            return new Response(json_encode([
                'success' => true,
                'data' => $invoice
            ]), 200, ['Content-Type' => 'application/json']);
        } catch (\Exception $e) {
            return new Response(json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]), 500, ['Content-Type' => 'application/json']);
        }
    }

    private function getPayments(int $page, int $limit, string $status, string $method): array
    {
        $offset = ($page - 1) * $limit;
        $where = [];
        $params = [];

        if ($status) {
            $where[] = 'status = ?';
            $params[] = $status;
        }

        if ($method) {
            $where[] = 'payment_method = ?';
            $params[] = $method;
        }

        $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';

        $sql = "SELECT * FROM payments $whereClause ORDER BY created_at DESC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    private function getPaymentsCount(string $status, string $method): int
    {
        $where = [];
        $params = [];

        if ($status) {
            $where[] = 'status = ?';
            $params[] = $status;
        }

        if ($method) {
            $where[] = 'payment_method = ?';
            $params[] = $method;
        }

        $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';

        $sql = "SELECT COUNT(*) FROM payments $whereClause";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        
        return (int)$stmt->fetchColumn();
    }

    private function getPaymentById(string $paymentId): ?array
    {
        $sql = "SELECT * FROM payments WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$paymentId]);
        
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        return $result ?: null;
    }

    private function createPayment(array $data): array
    {
        $sql = "INSERT INTO payments (order_id, customer_id, amount, payment_method, status, created_at) 
                VALUES (?, ?, ?, ?, ?, NOW())";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            $data['order_id'] ?? '',
            $data['customer_id'] ?? '',
            $data['amount'] ?? 0,
            $data['payment_method'] ?? 'cash',
            $data['status'] ?? 'pending'
        ]);
        
        $paymentId = $this->db->lastInsertId();
        return $this->getPaymentById($paymentId);
    }

    private function getPaymentStats(): array
    {
        $sql = "SELECT 
                    COUNT(*) as total_payments,
                    SUM(amount) as total_revenue,
                    AVG(amount) as avg_payment,
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_payments,
                    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments
                FROM payments";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    private function getInvoiceData(string $paymentId): array
    {
        $sql = "SELECT p.*, o.customer_name, o.customer_address, o.customer_phone 
                FROM payments p 
                JOIN orders o ON p.order_id = o.id 
                WHERE p.id = ?";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$paymentId]);
        
        $payment = $stmt->fetch(\PDO::FETCH_ASSOC);
        
        if (!$payment) {
            throw new \Exception('Paiement non trouvé');
        }
        
        return [
            'reference' => 'INV-' . str_pad($paymentId, 6, '0', STR_PAD_LEFT),
            'customer_name' => $payment['customer_name'],
            'customer_address' => $payment['customer_address'],
            'customer_phone' => $payment['customer_phone'],
            'amount' => $payment['amount'],
            'payment_method' => $payment['payment_method'],
            'created_at' => $payment['created_at']
        ];
    }
} 