<?php

declare(strict_types=1);

namespace App\Infrastructure\Web;

class Request
{
    private string $method;
    private string $path;
    private array $query;
    private array $post;
    private array $headers;
    private array $server;
    private ?string $body = null;

    public function __construct(
        string $method,
        string $path,
        array $query = [],
        array $post = [],
        array $headers = [],
        array $server = [],
        ?string $body = null
    ) {
        $this->method = strtoupper($method);
        $this->path = $path;
        $this->query = $query;
        $this->post = $post;
        $this->headers = $headers;
        $this->server = $server;
        $this->body = $body;
    }

    public static function fromGlobals(): self
    {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
        $query = $_GET;
        $post = $_POST;

        $headers = [];
        foreach ($_SERVER as $key => $value) {
            if (strpos($key, 'HTTP_') === 0) {
                $headerName = str_replace('_', '-', strtolower(substr($key, 5)));
                $headers[$headerName] = $value;
            }
        }

        // Lire le body pour les requêtes POST/PUT/PATCH
        $body = null;
        if (in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            $body = file_get_contents('php://input');
        }

        return new self($method, $path, $query, $post, $headers, $_SERVER, $body);
    }

    public function getMethod(): string
    {
        return $this->method;
    }

    public function getPath(): string
    {
        return $this->path;
    }

    public function getQuery(?string $key = null, mixed $default = null): mixed
    {
        if ($key === null) {
            return $this->query;
        }
        return $this->query[$key] ?? $default;
    }

    public function getPost(?string $key = null, mixed $default = null): mixed
    {
        if ($key === null) {
            return $this->post;
        }
        return $this->post[$key] ?? $default;
    }

    public function getHeader(string $name): ?string
    {
        return $this->headers[strtolower($name)] ?? null;
    }

    public function getAllHeaders(): array
    {
        return $this->headers;
    }

    public function isGet(): bool
    {
        return $this->method === 'GET';
    }

    public function isPost(): bool
    {
        return $this->method === 'POST';
    }

    public function isPut(): bool
    {
        return $this->method === 'PUT';
    }

    public function isDelete(): bool
    {
        return $this->method === 'DELETE';
    }

    public function isAjax(): bool
    {
        return $this->getHeader('X-Requested-With') === 'XMLHttpRequest';
    }

    public function getContentType(): ?string
    {
        return $this->getHeader('Content-Type');
    }

    public function getUserAgent(): ?string
    {
        return $this->getHeader('User-Agent');
    }

    public function getIp(): string
    {
        return $this->server['REMOTE_ADDR'] ?? '127.0.0.1';
    }

    public function getServer(?string $key = null, mixed $default = null): mixed
    {
        if ($key === null) {
            return $this->server;
        }
        return $this->server[$key] ?? $default;
    }

    public function getBody(): ?string
    {
        return $this->body;
    }
}