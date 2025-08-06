<?php

declare(strict_types=1);

namespace App\Core\UseCases\Authentication;

use App\Core\Interfaces\UserRepositoryInterface;
use App\Infrastructure\Security\SessionManager;

class LoginUseCase
{
    public function __construct(
        private UserRepositoryInterface $userRepository
    ) {}

    public function execute(string $username, string $password): array
    {
        // Validation des données d'entrée
        if (empty($username) || empty($password)) {
            throw new \InvalidArgumentException('Nom d\'utilisateur et mot de passe requis');
        }

        // Recherche de l'utilisateur
        $user = $this->userRepository->findByUsername($username);
        if (!$user) {
            throw new \RuntimeException('Identifiants invalides');
        }

        // Vérification du mot de passe
        if (!password_verify($password, $user->getPasswordHash())) {
            throw new \RuntimeException('Identifiants invalides');
        }

        // Création de la session
        SessionManager::set('user_id', $user->getId());
        SessionManager::set('user_role', $user->getRole());
        SessionManager::set('user_name', $user->getFullName());
        SessionManager::regenerate();

        return [
            'success' => true,
            'user' => $user->toArray(),
            'message' => 'Connexion réussie'
        ];
    }
} 