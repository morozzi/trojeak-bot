<?php
// telegram_api.php - Telegram Bot API functions

require_once __DIR__ . '/services/ApiRateLimitManager.php';

function makeRequest(string $url, array $params = [], int $maxRetries = 3): array {
    static $rateLimitManager = null;
    static $errorLogService = null;
    
    if ($rateLimitManager === null) {
        global $container;
        $errorLogService = $container->get('error_log');
        $rateLimitManager = new ApiRateLimitManager($errorLogService);
    }
    
    $attempt = 0;
    $lastError = null;
    $endpoint = normalizeEndpoint($url);
    
    $throttleDelayMs = $rateLimitManager->getThrottleDelayMs($endpoint);
    if ($throttleDelayMs > 0) {
        usleep($throttleDelayMs * 1000);
    }
    
    $optimalDelayMs = $rateLimitManager->getOptimalDelayMs($endpoint);
    if ($optimalDelayMs > 0) {
        usleep($optimalDelayMs * 1000);
    }
    
    while ($attempt < $maxRetries) {
        $rateLimitManager->recordRequest($endpoint);
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        $response = curl_exec($ch);
        
        if (!curl_errno($ch)) {
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            if (!json_validate($response)) {
                $errorLogService->log('api', 'request_failed', 
                    ErrorContext::create(null, null, 'API_ERROR'), [$endpoint, 'Invalid JSON response']);
                return ['ok' => false, 'error' => 'Invalid JSON response'];
            }
            
            $responseData = json_decode($response, true);
            
            if (!$responseData['ok'] && isset($responseData['error_code'])) {
                return match (true) {
                    $responseData['error_code'] === 400 && str_contains($responseData['description'] ?? '', 'message is not modified') => [
                        'ok' => true, 
                        'result' => ['message_id' => $params['message_id'] ?? 0],
                        'notice' => 'Message already had the same content'
                    ],
                    $httpCode === 429 || $responseData['error_code'] === 429 => handleRateLimit($responseData, $endpoint, $rateLimitManager, $errorLogService, $attempt),
                    in_array($responseData['error_code'], [500, 502, 503, 504]) => handleRetryableError($responseData, $endpoint, $errorLogService, $attempt, $rateLimitManager),
                    default => handleNonRetryableError($responseData, $endpoint, $errorLogService)
                };
            }
            
            return $responseData;
        }
        
        $errorMessage = curl_error($ch);
        curl_close($ch);
        
        $errorLogService->log('api', 'request_failed', 
            ErrorContext::create(null, null, 'API_ERROR'), [$endpoint, $errorMessage]);
        $lastError = ['ok' => false, 'error' => $errorMessage];
        
        $delaySeconds = $rateLimitManager->calculateBackoffDelayMs($attempt) / 1000;
        $attempt++;
        
        if ($attempt < $maxRetries) {
            sleep((int)$delaySeconds);
        }
    }
    
    $errorLogService->log('api', 'request_failed', 
        ErrorContext::create(null, null, 'API_ERROR'), [$endpoint, "All {$maxRetries} retry attempts failed"]);
    return $lastError ?? ['ok' => false, 'error' => 'All retry attempts failed'];
}

function normalizeEndpoint(string $url): string {
    return match (true) {
        str_contains($url, '/sendMessage') => 'sendMessage',
        str_contains($url, '/sendPhoto') => 'sendPhoto',
        str_contains($url, '/editMessage') => 'editMessage',
        str_contains($url, '/deleteMessage') => 'deleteMessage',
        str_contains($url, '/answerCallback') => 'answerCallback',
        str_contains($url, '/getChatMember') => 'getChatMember',
        str_contains($url, '/getMe') => 'getMe',
        str_contains($url, '/setMyCommands') => 'setMyCommands',
        str_contains($url, '/setWebhook') => 'setWebhook',
        str_contains($url, '/getWebhookInfo') => 'getWebhookInfo',
        default => preg_match('/\/([^\/]+)$/', $url, $matches) ? $matches[1] : 'telegram_api'
    };
}

function handleRateLimit(array $responseData, string $endpoint, ApiRateLimitManager $rateLimitManager, ErrorLogService $errorLogService, int $attempt): array {
    $retryAfter = $responseData['parameters']['retry_after'] ?? 0;
    $rateLimitManager->recordRateLimit($endpoint, $retryAfter);
    $errorLogService->log('api', 'request_failed', 
        ErrorContext::create(null, null, 'API_THROTTLE'), [$endpoint, "Rate limit exceeded"]);
    return $responseData;
}

function handleRetryableError(array $responseData, string $endpoint, ErrorLogService $errorLogService, int $attempt, ApiRateLimitManager $rateLimitManager): array {
    $errorLogService->log('api', 'request_failed', 
        ErrorContext::create(null, null, 'API_ERROR'), [$endpoint, "Retryable error: {$responseData['description']}"]);
    return $responseData;
}

function handleNonRetryableError(array $responseData, string $endpoint, ErrorLogService $errorLogService): array {
    $errorLogService->log('api', 'request_failed', 
        ErrorContext::create(null, null, 'API_ERROR'), [$endpoint, "Non-retryable error: {$responseData['description']}"]);
    return $responseData;
}

function getApiUrl(string $token, string $method): string {
    return match (empty(TelegramApiConfig::API_VERSION)) {
        true => "https://api.telegram.org/bot{$token}/{$method}",
        false => "https://api.telegram.org/bot{$token}/v" . TelegramApiConfig::API_VERSION . "/{$method}"
    };
}

function sendMessage(string $token, int|string $chatId, string $text, array $additionalParams = []): array {
    global $container;
    
    $userService = $container->get('user_service');
    
    if ($userService->isUserBlocked($chatId)) {
        return [
            'ok' => true,
            'result' => [
                'message_id' => 0,
                'skipped' => true
            ]
        ];
    }
    
    if (!Messages::validateMessageLength($text)) {
        $text = Messages::truncateMessageIfNeeded($text);
    }
    
    $apiUrl = getApiUrl($token, "sendMessage");
    $params = array_merge([
        'chat_id' => $chatId,
        'text' => $text,
        'parse_mode' => 'HTML'
    ], $additionalParams);
    
    return makeRequest($apiUrl, $params);
}

function sendPhoto(string $token, int|string $chatId, string $photo, array $additionalParams = []): array {
    global $container;
    
    $userService = $container->get('user_service');
    
    if ($userService->isUserBlocked($chatId)) {
        return [
            'ok' => true,
            'result' => [
                'message_id' => 0,
                'skipped' => true
            ]
        ];
    }
    
    if (isset($additionalParams['caption']) && !Messages::validateMessageLength($additionalParams['caption'])) {
        $additionalParams['caption'] = Messages::truncateMessageIfNeeded($additionalParams['caption']);
    }
    
    $apiUrl = getApiUrl($token, "sendPhoto");
    $params = array_merge([
        'chat_id' => $chatId,
        'photo' => new CURLFile($photo),
        'parse_mode' => 'HTML'
    ], $additionalParams);
    
    return makeRequest($apiUrl, $params);
}

function getChatMember(string $token, string $chatId, int $userId): array {
    $apiUrl = getApiUrl($token, "getChatMember");
    $params = [
        'chat_id' => $chatId,
        'user_id' => $userId
    ];
    
    return makeRequest($apiUrl, $params);
}

function getMe(string $token): array {
    $apiUrl = getApiUrl($token, "getMe");
    return makeRequest($apiUrl);
}

function setMyCommands(string $token, array $commands): array {
    $apiUrl = getApiUrl($token, "setMyCommands");
    $params = [
        'commands' => json_encode($commands)
    ];
    
    return makeRequest($apiUrl, $params);
}

function deleteMessage(string $token, int|string $chatId, int $messageId): array {
    $apiUrl = getApiUrl($token, "deleteMessage");
    $params = [
        'chat_id' => $chatId,
        'message_id' => $messageId
    ];
    
    return makeRequest($apiUrl, $params);
}

function editMessageText(string $token, int|string $chatId, int $messageId, string $text, array $additionalParams = []): array {
    if (!Messages::validateMessageLength($text)) {
        $text = Messages::truncateMessageIfNeeded($text);
    }
    
    $apiUrl = getApiUrl($token, "editMessageText");
    $params = array_merge([
        'chat_id' => $chatId,
        'message_id' => $messageId,
        'text' => $text,
        'parse_mode' => 'HTML'
    ], $additionalParams);
    
    return makeRequest($apiUrl, $params);
}

function answerCallbackQuery(string $token, string $callbackQueryId, string $text = '', bool $showAlert = false): array {
    $apiUrl = getApiUrl($token, "answerCallbackQuery");
    $params = [
        'callback_query_id' => $callbackQueryId
    ];
    
    if (!empty($text)) {
        $params['text'] = $text;
    }
    
    if ($showAlert) {
        $params['show_alert'] = true;
    }
    
    return makeRequest($apiUrl, $params);
}

function setWebhook(string $token, string $url, array $additionalParams = []): array {
    $apiUrl = getApiUrl($token, "setWebhook");
    $params = array_merge([
        'url' => $url,
        'allowed_updates' => json_encode(['message', 'callback_query', 'chat_member', 'my_chat_member'])
    ], $additionalParams);
    
    return makeRequest($apiUrl, $params);
}

function getWebhookInfo(string $token): array {
    $apiUrl = getApiUrl($token, "getWebhookInfo");
    return makeRequest($apiUrl);
}