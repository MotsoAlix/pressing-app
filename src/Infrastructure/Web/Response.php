<?php

declare(strict_types=1);

namespace App\Infrastructure\Web;

class Response
{
    private string $content;
    private int $statusCode;
    private array $headers;

    public function __construct(string $content = '', int $statusCode = 200, array $headers = [])
    {
        $this->content = $content;
        $this->statusCode = $statusCode;
        $this->headers = array_merge([
            'Content-Type' => 'text/html; charset=utf-8'
        ], $headers);
    }

    public function setContent(string $content): self
    {
        $this->content = $content;
        return $this;
    }

    public function setStatusCode(int $statusCode): self
    {
        $this->statusCode = $statusCode;
        return $this;
    }

    public function setHeader(string $name, string $value): self
    {
        $this->headers[$name] = $value;
        return $this;
    }

    public function setHeaders(array $headers): self
    {
        $this->headers = array_merge($this->headers, $headers);
        return $this;
    }

    public function getContent(): string
    {
        return $this->content;
    }

    public function getStatusCode(): int
    {
        return $this->statusCode;
    }

    public function getHeaders(): array
    {
        return $this->headers;
    }

    public function send(): void
    {
        // Envoyer les headers
        $this->sendHeaders();
        
        // Envoyer le contenu
        echo $this->content;
    }

    private function sendHeaders(): void
    {
        // Envoyer le status code
        http_response_code($this->statusCode);
        
        // Envoyer les headers
        foreach ($this->headers as $name => $value) {
            header("$name: $value");
        }
    }

    public static function json(array $data, int $statusCode = 200): self
    {
        return new self(
            json_encode($data, JSON_UNESCAPED_UNICODE),
            $statusCode,
            ['Content-Type' => 'application/json; charset=utf-8']
        );
    }

    public static function redirect(string $url, int $statusCode = 302): self
    {
        return new self('', $statusCode, ['Location' => $url]);
    }

    public static function notFound(string $message = 'Page non trouvée'): self
    {
        return new self($message, 404);
    }

    public static function serverError(string $message = 'Erreur interne du serveur'): self
    {
        return new self($message, 500);
    }

    public static function forbidden(string $message = 'Accès interdit'): self
    {
        return new self($message, 403);
    }

    public static function unauthorized(string $message = 'Non autorisé'): self
    {
        return new self($message, 401);
    }
} 