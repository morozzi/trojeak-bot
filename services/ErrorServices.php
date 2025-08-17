<?php
// services/ErrorServices.php - Error handling service classes

class ErrorContext {
    public function __construct(
        public readonly ?int $userId = null,
        public readonly ?string $username = null,
        public readonly string $operation = 'GENERAL',
        public readonly array $data = []
    ) {}
    
    public static function create(
        ?int $userId = null, 
        ?string $username = null, 
        string $operation = 'GENERAL', 
        array $data = []
    ): self {
        return new self($userId, $username, $operation, $data);
    }
}

class ErrorLogService {
    private ?array $errorMessages = null;
    private bool $shutdownRegistered = false;
    private array $logBuffer = [];
    
    public function __construct() {
        $this->loadErrorMessages();
        
        if (!$this->shutdownRegistered) {
            register_shutdown_function([$this, 'flushLogs']);
            $this->shutdownRegistered = true;
        }
    }
    
    private function loadErrorMessages(): void {
        if ($this->errorMessages === null) {
            $cacheKey = Constants::NAMESPACE . ':error_messages:' . Constants::JSON_VERSION;
            
            $success = false;
            $errorMessages = apcu_fetch($cacheKey, $success);
            
            if ($success) {
                $this->errorMessages = $errorMessages;
                return;
            }
            
            $jsonFile = __DIR__ . '/../json/logging.json';
            
            if (file_exists($jsonFile)) {
                $jsonContent = file_get_contents($jsonFile);
                if ($jsonContent !== false && json_validate($jsonContent)) {
                    $this->errorMessages = json_decode($jsonContent, true);
                    apcu_store($cacheKey, $this->errorMessages, APCuConfig::MEDIUM_TTL);
                    return;
                }
            }
            
            $this->errorMessages = [];
        }
    }
    
    public function getMessage(string $type, string $key, array $params = []): string {
        if (isset($this->errorMessages[$type][$key])) {
            $message = $this->errorMessages[$type][$key];
            
            if (!empty($params)) {
                try {
                    $placeholderCount = preg_match_all('/%[sdiouxXfFeEgGaAcs]/', $message);
                    
                    if (count($params) < $placeholderCount) {
                        $params = array_pad($params, $placeholderCount, '');
                    } elseif (count($params) > $placeholderCount) {
                        $params = array_slice($params, 0, $placeholderCount);
                    }
                    
                    $message = vsprintf($message, $params);
                } catch (\Exception $e) {
                    $message .= ' - Format Error: ' . implode(', ', $params);
                }
            }
            
            return $message;
        }
        
        return "Error in {$type}.{$key}" . (!empty($params) ? ": " . implode(', ', $params) : '');
    }
    
    public function flushLogs(): void {
        if (!empty($this->logBuffer) && defined('LogPaths::ERROR_LOG')) {
            file_put_contents(LogPaths::ERROR_LOG, implode('', $this->logBuffer) . "\n", FILE_APPEND);
            $this->logBuffer = [];
        }
    }
    
    public function log(string $errorType, string $messageKey, ErrorContext $context, array $params = []): void {
        $message = $this->getMessage($errorType, $messageKey, $params);
        
        if (!defined('LogPaths::ERROR_LOG')) {
            return;
        }
        
        $timestamp = date('Y-m-d H:i:s');
        $userIdStr = ($context->userId !== null) ? $context->userId : '-';
        $usernameStr = $context->username ?? '-';
        
        $logEntry = "[{$timestamp}] [{$errorType}] [{$userIdStr}] [{$usernameStr}] [{$context->operation}] {$message}" . PHP_EOL;
        
        $this->logBuffer[] = $logEntry;
        
        if (count($this->logBuffer) >= 10) {
            $this->flushLogs();
        }
    }
    
    public function logRaw(
        string $errorType, 
        string $details, 
        string $context = 'SYSTEM', 
        ?int $userId = null, 
        ?string $username = null
    ): void {
        if (!defined('LogPaths::ERROR_LOG')) {
            return;
        }
        
        $timestamp = date('Y-m-d H:i:s');
        $userIdStr = ($userId !== null) ? $userId : '-';
        $usernameStr = $username ?? '-';
        
        $logEntry = "[{$timestamp}] [{$errorType}] [{$userIdStr}] [{$usernameStr}] [{$context}] {$details}" . PHP_EOL;
        
        $this->logBuffer[] = $logEntry;
        
        if (count($this->logBuffer) >= 10) {
            $this->flushLogs();
        }
    }
}

class ErrorHandlingMiddleware {
    public function __construct(
        private readonly ErrorLogService $errorLogService
    ) {}
    
    public function withErrorLogging(
        callable $callable, 
        string $errorType, 
        string $messageKey, 
        ErrorContext $context, 
        array $params = [], 
        mixed $defaultValue = false
    ): mixed {
        try {
            return $callable();
        } catch (\Exception $e) {
            $exceptionData = [
                'exception' => [
                    'message' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine()
                ]
            ];
            
            $updatedContext = new ErrorContext(
                $context->userId,
                $context->username,
                $context->operation,
                array_merge($context->data, $exceptionData)
            );
            
            $updatedParams = $params;
            if (!empty($updatedParams)) {
                $updatedParams[0] = $e->getMessage();
            } else {
                $updatedParams = [$e->getMessage()];
            }
            
            $this->errorLogService->log($errorType, $messageKey, $updatedContext, $updatedParams);
            
            return $defaultValue;
        }
    }
}