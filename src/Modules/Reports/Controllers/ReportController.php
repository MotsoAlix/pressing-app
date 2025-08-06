<?php

declare(strict_types=1);

namespace App\Modules\Reports\Controllers;

use App\Infrastructure\Web\Request;
use App\Infrastructure\Web\Response;
use App\Infrastructure\Database\DatabaseConnection;

class ReportController
{
    private DatabaseConnection $db;

    public function __construct(DatabaseConnection $db)
    {
        $this->db = $db;
    }

    public function index(Request $request): Response
    {
        return new Response(
            file_get_contents(__DIR__ . '/../../../public/reports.html'),
            200,
            ['Content-Type' => 'text/html; charset=utf-8']
        );
    }

    public function getMetrics(Request $request): Response
    {
        try {
            $period = $request->getQuery('period') ?? 'week';
            $metrics = $this->getMetricsData($period);
            
            return new Response(json_encode([
                'success' => true,
                'data' => $metrics
            ]), 200, ['Content-Type' => 'application/json']);
        } catch (\Exception $e) {
            return new Response(json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]), 500, ['Content-Type' => 'application/json']);
        }
    }

    public function getRevenueChart(Request $request): Response
    {
        try {
            $period = $request->getQuery('period') ?? 'week';
            $data = $this->getRevenueData($period);
            
            return new Response(json_encode([
                'success' => true,
                'data' => $data
            ]), 200, ['Content-Type' => 'application/json']);
        } catch (\Exception $e) {
            return new Response(json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]), 500, ['Content-Type' => 'application/json']);
        }
    }

    public function getOrdersChart(Request $request): Response
    {
        try {
            $period = $request->getQuery('period') ?? 'week';
            $data = $this->getOrdersData($period);
            
            return new Response(json_encode([
                'success' => true,
                'data' => $data
            ]), 200, ['Content-Type' => 'application/json']);
        } catch (\Exception $e) {
            return new Response(json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]), 500, ['Content-Type' => 'application/json']);
        }
    }

    public function getServicesChart(Request $request): Response
    {
        try {
            $data = $this->getServicesData();
            
            return new Response(json_encode([
                'success' => true,
                'data' => $data
            ]), 200, ['Content-Type' => 'application/json']);
        } catch (\Exception $e) {
            return new Response(json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]), 500, ['Content-Type' => 'application/json']);
        }
    }

    public function getTopPerformers(Request $request): Response
    {
        try {
            $data = $this->getTopPerformersData();
            
            return new Response(json_encode([
                'success' => true,
                'data' => $data
            ]), 200, ['Content-Type' => 'application/json']);
        } catch (\Exception $e) {
            return new Response(json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]), 500, ['Content-Type' => 'application/json']);
        }
    }

    private function getMetricsData(string $period): array
    {
        $dateFilter = $this->getDateFilter($period);
        
        $sql = "SELECT 
                    COUNT(*) as total_orders,
                    SUM(total_amount) as total_revenue,
                    AVG(total_amount) as avg_order,
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders
                FROM orders 
                WHERE created_at >= ?";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$dateFilter]);
        
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    private function getRevenueData(string $period): array
    {
        $dateFilter = $this->getDateFilter($period);
        
        $sql = "SELECT 
                    DATE(created_at) as date,
                    SUM(total_amount) as revenue,
                    COUNT(*) as orders
                FROM orders 
                WHERE created_at >= ?
                GROUP BY DATE(created_at)
                ORDER BY date";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$dateFilter]);
        
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    private function getOrdersData(string $period): array
    {
        $dateFilter = $this->getDateFilter($period);
        
        $sql = "SELECT 
                    DATE(created_at) as date,
                    COUNT(*) as orders,
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
                FROM orders 
                WHERE created_at >= ?
                GROUP BY DATE(created_at)
                ORDER BY date";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$dateFilter]);
        
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    private function getServicesData(): array
    {
        $sql = "SELECT 
                    service_name,
                    COUNT(*) as count,
                    SUM(total_amount) as revenue
                FROM orders 
                GROUP BY service_name
                ORDER BY count DESC
                LIMIT 10";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    private function getTopPerformersData(): array
    {
        $sql = "SELECT 
                    customer_name,
                    COUNT(*) as orders,
                    SUM(total_amount) as total_spent,
                    AVG(total_amount) as avg_order
                FROM orders 
                WHERE status = 'completed'
                GROUP BY customer_name
                ORDER BY total_spent DESC
                LIMIT 10";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    private function getDateFilter(string $period): string
    {
        $filters = [
            'week' => 'DATE_SUB(NOW(), INTERVAL 7 DAY)',
            'month' => 'DATE_SUB(NOW(), INTERVAL 30 DAY)',
            'quarter' => 'DATE_SUB(NOW(), INTERVAL 90 DAY)',
            'year' => 'DATE_SUB(NOW(), INTERVAL 365 DAY)'
        ];
        
        return $filters[$period] ?? $filters['week'];
    }
} 