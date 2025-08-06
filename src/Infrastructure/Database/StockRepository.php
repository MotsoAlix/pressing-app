<?php

declare(strict_types=1);

namespace App\Infrastructure\Database;

use App\Core\Entities\StockItem;

class StockRepository
{
    private array $items = [];
    private int $nextId = 1;

    public function __construct()
    {
        // Articles de stock de test
        $this->items = [
            1 => new StockItem(
                'Détergent Premium',
                'Détergent haute qualité pour nettoyage à sec',
                'Produits chimiques',
                25,
                10,
                15.50,
                'litre',
                'ChemClean Pro',
                new \DateTime('+6 months')
            ),
            2 => new StockItem(
                'Détachant Universel',
                'Détachant efficace pour toutes les taches',
                'Produits chimiques',
                8,
                15,
                22.00,
                'litre',
                'StainAway Ltd',
                new \DateTime('+3 months')
            ),
            3 => new StockItem(
                'Cintres Plastique',
                'Cintres en plastique résistant',
                'Accessoires',
                150,
                50,
                0.75,
                'pièce',
                'HangerCorp'
            ),
            4 => new StockItem(
                'Housses Plastique',
                'Housses de protection transparentes',
                'Emballage',
                200,
                100,
                0.25,
                'pièce',
                'PackPro'
            ),
            5 => new StockItem(
                'Amidon Spray',
                'Amidon en spray pour repassage',
                'Produits chimiques',
                12,
                20,
                8.90,
                'litre',
                'IronEase',
                new \DateTime('+8 months')
            ),
            6 => new StockItem(
                'Étiquettes Code-barres',
                'Étiquettes adhésives avec code-barres',
                'Accessoires',
                500,
                200,
                0.05,
                'pièce',
                'LabelTech'
            ),
            7 => new StockItem(
                'Solvant Dégraissant',
                'Solvant pour dégraissage textile',
                'Produits chimiques',
                5,
                8,
                35.00,
                'litre',
                'ChemClean Pro',
                new \DateTime('+2 months')
            )
        ];

        // Définir les IDs
        foreach ($this->items as $id => $item) {
            $item->setId($id);
        }

        $this->nextId = count($this->items) + 1;
    }

    public function findById(int $id): ?StockItem
    {
        return $this->items[$id] ?? null;
    }

    public function findAll(): array
    {
        return array_values($this->items);
    }

    public function findByCategory(string $category): array
    {
        $results = [];
        foreach ($this->items as $item) {
            if ($item->getCategory() === $category) {
                $results[] = $item;
            }
        }
        return $results;
    }

    public function findLowStock(): array
    {
        $results = [];
        foreach ($this->items as $item) {
            if ($item->isLowStock()) {
                $results[] = $item;
            }
        }
        return $results;
    }

    public function findExpired(): array
    {
        $results = [];
        foreach ($this->items as $item) {
            if ($item->isExpired()) {
                $results[] = $item;
            }
        }
        return $results;
    }

    public function findExpiringSoon(int $days = 30): array
    {
        $results = [];
        foreach ($this->items as $item) {
            if ($item->isExpiringSoon($days)) {
                $results[] = $item;
            }
        }
        return $results;
    }

    public function search(string $query): array
    {
        $results = [];
        $query = strtolower($query);
        
        foreach ($this->items as $item) {
            $name = strtolower($item->getName());
            $description = strtolower($item->getDescription());
            $category = strtolower($item->getCategory());
            $supplier = strtolower($item->getSupplier());
            
            if (strpos($name, $query) !== false || 
                strpos($description, $query) !== false ||
                strpos($category, $query) !== false ||
                strpos($supplier, $query) !== false) {
                $results[] = $item;
            }
        }
        
        return $results;
    }

    public function save(StockItem $item): StockItem
    {
        if ($item->getId() === null) {
            $item->setId($this->nextId++);
        }

        $this->items[$item->getId()] = $item;
        return $item;
    }

    public function delete(int $id): bool
    {
        if (isset($this->items[$id])) {
            unset($this->items[$id]);
            return true;
        }
        return false;
    }

    public function getCategories(): array
    {
        $categories = [];
        foreach ($this->items as $item) {
            $category = $item->getCategory();
            if (!in_array($category, $categories)) {
                $categories[] = $category;
            }
        }
        sort($categories);
        return $categories;
    }

    public function getSuppliers(): array
    {
        $suppliers = [];
        foreach ($this->items as $item) {
            $supplier = $item->getSupplier();
            if ($supplier && !in_array($supplier, $suppliers)) {
                $suppliers[] = $supplier;
            }
        }
        sort($suppliers);
        return $suppliers;
    }

    public function getStatistics(): array
    {
        $total = count($this->items);
        $lowStock = count($this->findLowStock());
        $expired = count($this->findExpired());
        $expiringSoon = count($this->findExpiringSoon());
        
        $totalValue = 0;
        $categoryCounts = [];
        
        foreach ($this->items as $item) {
            $totalValue += $item->getTotalValue();
            
            $category = $item->getCategory();
            $categoryCounts[$category] = ($categoryCounts[$category] ?? 0) + 1;
        }

        return [
            'total' => $total,
            'lowStock' => $lowStock,
            'expired' => $expired,
            'expiringSoon' => $expiringSoon,
            'normal' => $total - $lowStock - $expired - $expiringSoon,
            'totalValue' => $totalValue,
            'categories' => $categoryCounts
        ];
    }

    public function updateQuantity(int $id, int $quantity): bool
    {
        if (isset($this->items[$id])) {
            $this->items[$id]->setQuantity($quantity);
            return true;
        }
        return false;
    }

    public function addQuantity(int $id, int $quantity): bool
    {
        if (isset($this->items[$id])) {
            $this->items[$id]->addQuantity($quantity);
            return true;
        }
        return false;
    }

    public function removeQuantity(int $id, int $quantity): bool
    {
        if (isset($this->items[$id])) {
            return $this->items[$id]->removeQuantity($quantity);
        }
        return false;
    }

    public function count(): int
    {
        return count($this->items);
    }

    public function findBySupplier(string $supplier): array
    {
        $results = [];
        foreach ($this->items as $item) {
            if ($item->getSupplier() === $supplier) {
                $results[] = $item;
            }
        }
        return $results;
    }

    public function getAlerts(): array
    {
        $alerts = [];
        
        foreach ($this->items as $item) {
            if ($item->isExpired()) {
                $alerts[] = [
                    'type' => 'expired',
                    'priority' => 'high',
                    'message' => "Le produit '{$item->getName()}' a expiré",
                    'item' => $item->toArray()
                ];
            } elseif ($item->isExpiringSoon()) {
                $alerts[] = [
                    'type' => 'expiring',
                    'priority' => 'medium',
                    'message' => "Le produit '{$item->getName()}' expire bientôt",
                    'item' => $item->toArray()
                ];
            }
            
            if ($item->isLowStock()) {
                $alerts[] = [
                    'type' => 'low_stock',
                    'priority' => 'medium',
                    'message' => "Stock faible pour '{$item->getName()}' ({$item->getQuantity()} {$item->getUnit()})",
                    'item' => $item->toArray()
                ];
            }
        }
        
        // Trier par priorité
        usort($alerts, function($a, $b) {
            $priorities = ['high' => 3, 'medium' => 2, 'low' => 1];
            return $priorities[$b['priority']] <=> $priorities[$a['priority']];
        });
        
        return $alerts;
    }
}
