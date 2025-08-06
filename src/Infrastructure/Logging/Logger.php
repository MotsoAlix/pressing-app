<?php

declare(strict_types=1);

namespace App\Infrastructure\Logging;

use Psr\Log\LoggerInterface;
use Psr\Log\LogLevel;

class Logger implements LoggerInterface
{
    private static ?self $instance = null;
    private string $logPath;
    private string $logLevel;

    private function __construct(string $logPath, string $logLevel)
    {
        $this->logPath = $logPath;
        $this->logLevel = $logLevel;
        
        // Créer le dossier de logs s'il n'existe pas
        if (!is_dir($logPath)) {
            mkdir($logPath, 0755, true);
        }
    }

    public static function initialize(string $logPath, string $logLevel): void
    {
        self::$instance = new self($logPath, $logLevel);
    }

    public static function getInstance(): self
    {
        if (self::$instance === null) {
            throw new \RuntimeException('Logger not initialized. Call Logger::initialize() first.');
        }
        return self::$instance;
    }

    public function emergency(string|\Stringable $message, array $context = []): void
    {
        $this->log(LogLevel::EMERGENCY, $message, $context);
    }

    public function alert(string|\Stringable $message, array $context = []): void
    {
        $this->log(LogLevel::ALERT, $message, $context);
    }

    public function critical(string|\Stringable $message, array $context = []): void
    {
        $this->log(LogLevel::CRITICAL, $message, $context);
    }

    public function error(string|\Stringable $message, array $context = []): void
    {
        $this->log(LogLevel::ERROR, $message, $context);
    }

    public function warning(string|\Stringable $message, array $context = []): void
    {
        $this->log(LogLevel::WARNING, $message, $context);
    }

    public function notice(string|\Stringable $message, array $context = []): void
    {
        $this->log(LogLevel::NOTICE, $message, $context);
    }

    public function info(string|\Stringable $message, array $context = []): void
    {
        $this->log(LogLevel::INFO, $message, $context);
    }

    public function debug(string|\Stringable $message, array $context = []): void
    {
        $this->log(LogLevel::DEBUG, $message, $context);
    }

    public function log($level, string|\Stringable $message, array $context = []): void
    {
        if (!$this->shouldLog($level)) {
            return;
        }

        $logEntry = $this->formatLogEntry($level, $message, $context);
        $filename = $this->logPath . '/' . date('Y-m-d') . '.log';
        
        file_put_contents($filename, $logEntry . PHP_EOL, FILE_APPEND | LOCK_EX);
    }

    private function shouldLog(string $level): bool
    {
        $levels = [
            LogLevel::EMERGENCY => 0,
            LogLevel::ALERT => 1,
            LogLevel::CRITICAL => 2,
            LogLevel::ERROR => 3,
            LogLevel::WARNING => 4,
            LogLevel::NOTICE => 5,
            LogLevel::INFO => 6,
            LogLevel::DEBUG => 7,
        ];

        $currentLevel = $levels[$this->logLevel] ?? 7;
        $messageLevel = $levels[$level] ?? 7;

        return $messageLevel <= $currentLevel;
    }

    private function formatLogEntry(string $level, string|\Stringable $message, array $context): string
    {
        $timestamp = date('Y-m-d H:i:s');
        $level = strtoupper($level);
        $message = (string) $message;
        
        $contextStr = empty($context) ? '' : ' ' . json_encode($context);
        
        return "[{$timestamp}] [{$level}] {$message}{$contextStr}";
    }
} 