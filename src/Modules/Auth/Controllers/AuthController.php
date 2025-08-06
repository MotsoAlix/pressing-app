<?php

declare(strict_types=1);

namespace App\Modules\Auth\Controllers;

use App\Infrastructure\Web\Request;
use App\Infrastructure\Web\Response;
use App\Core\UseCases\Authentication\LoginUseCase;
use App\Infrastructure\Security\SessionManager;

class AuthController
{
    private LoginUseCase $loginUseCase;
    private SessionManager $sessionManager;

    public function __construct(LoginUseCase $loginUseCase, SessionManager $sessionManager)
    {
        $this->loginUseCase = $loginUseCase;
        $this->sessionManager = $sessionManager;
    }

    public function login(Request $request): Response
    {
        if ($request->getMethod() === 'GET') {
            return new Response($this->renderLoginPage());
        }

        // Récupérer les données JSON
        $jsonData = json_decode($request->getBody(), true);
        $username = $jsonData['username'] ?? '';
        $password = $jsonData['password'] ?? '';

        if (empty($username) || empty($password)) {
            return new Response(json_encode([
                'success' => false,
                'message' => 'Nom d\'utilisateur et mot de passe requis'
            ]), 400, ['Content-Type' => 'application/json']);
        }

        try {
            // Utiliser le UserRepository directement pour la démo
            $userRepository = new \App\Infrastructure\Database\UserRepository();
            $user = $userRepository->findByUsername($username);

            if (!$user || !password_verify($password, $user->getPasswordHash())) {
                return new Response(json_encode([
                    'success' => false,
                    'message' => 'Identifiants invalides'
                ]), 401, ['Content-Type' => 'application/json']);
            }

            $this->sessionManager->set('user_id', $user->getId());
            $this->sessionManager->set('user_role', $user->getRole());

            return new Response(json_encode([
                'success' => true,
                'user' => [
                    'id' => $user->getId(),
                    'username' => $user->getUsername(),
                    'firstName' => $user->getFirstName(),
                    'lastName' => $user->getLastName(),
                    'fullName' => $user->getFirstName() . ' ' . $user->getLastName(),
                    'email' => $user->getEmail(),
                    'role' => $user->getRole()
                ]
            ]), 200, ['Content-Type' => 'application/json']);
        } catch (\Exception $e) {
            return new Response(json_encode([
                'success' => false,
                'message' => 'Erreur de connexion'
            ]), 401, ['Content-Type' => 'application/json']);
        }
    }

    public function logout(Request $request): Response
    {
        $this->sessionManager->destroy();
        return new Response(json_encode(['success' => true]), 200, ['Content-Type' => 'application/json']);
    }

    public function checkAuth(Request $request): Response
    {
        $userId = $this->sessionManager->get('user_id');
        
        if (!$userId) {
            return new Response(json_encode(['authenticated' => false]), 401, ['Content-Type' => 'application/json']);
        }

        return new Response(json_encode(['authenticated' => true]), 200, ['Content-Type' => 'application/json']);
    }

    private function renderLoginPage(): string
    {
        return file_get_contents(__DIR__ . '/../../../public/login.html');
    }
} 