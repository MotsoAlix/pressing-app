<?php

declare(strict_types=1);

namespace App\Infrastructure\Web;

use App\Infrastructure\Web\Middleware\MiddlewareInterface;

class Router
{
    private array $routes = [];
    private array $middlewares = [];

    public function __construct(array $middlewares = [])
    {
        $this->middlewares = $middlewares;
    }

    public function get(string $path, callable|array $handler): void
    {
        $this->addRoute('GET', $path, $handler);
    }

    public function post(string $path, callable|array $handler): void
    {
        $this->addRoute('POST', $path, $handler);
    }

    public function put(string $path, callable|array $handler): void
    {
        $this->addRoute('PUT', $path, $handler);
    }

    public function delete(string $path, callable|array $handler): void
    {
        $this->addRoute('DELETE', $path, $handler);
    }

    private function addRoute(string $method, string $path, callable|array $handler): void
    {
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'handler' => $handler,
            'pattern' => $this->pathToPattern($path)
        ];
    }

    private function pathToPattern(string $path): string
    {
        return '#^' . preg_replace('#\{([a-zA-Z]+)\}#', '([^/]+)', $path) . '$#';
    }

    public function dispatch(Request $request): Response
    {
        $method = $request->getMethod();
        $path = $request->getPath();

        foreach ($this->routes as $route) {
            if ($route['method'] === $method && preg_match($route['pattern'], $path, $matches)) {
                // Appliquer les middlewares
                $request = $this->applyMiddlewares($request);
                
                // Extraire les paramètres de l'URL
                array_shift($matches); // Retirer le match complet
                $params = $this->extractParams($route['path'], $matches);
                
                // Exécuter le handler
                $response = call_user_func_array($route['handler'], [$request, $params]);
                
                if (!$response instanceof Response) {
                    $response = new Response($response);
                }
                
                return $response;
            }
        }

        // Route non trouvée
        return new Response('Page non trouvée', 404);
    }

    private function applyMiddlewares(Request $request): Request
    {
        foreach ($this->middlewares as $middleware) {
            if ($middleware instanceof MiddlewareInterface) {
                $request = $middleware->process($request);
            }
        }
        return $request;
    }

    private function extractParams(string $path, array $matches): array
    {
        preg_match_all('#\{([a-zA-Z]+)\}#', $path, $paramNames);
        $paramNames = $paramNames[1];
        
        $params = [];
        foreach ($paramNames as $index => $name) {
            $params[$name] = $matches[$index] ?? null;
        }
        
        return $params;
    }
} 