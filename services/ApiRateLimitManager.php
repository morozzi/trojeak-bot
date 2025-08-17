<?php
// services/ApiRateLimitManager.php - Rate limiting with token bucket algorithm

class ApiRateLimitManager {
    
    public function __construct(
        private readonly ErrorLogService $errorLogService,
        private readonly float $baseDelayMs = TelegramApiConfig::BASE_DELAY_MS,
        private readonly float $maxDelayMs = TelegramApiConfig::MAX_DELAY_MS,
        private readonly float $jitterFactor = TelegramApiConfig::JITTER_FACTOR,
        private readonly float $backoffMultiplier = TelegramApiConfig::BACKOFF_MULTIPLIER
    ) {
        $this->initializeTokenBuckets();
    }
    
    private function initializeTokenBuckets(): void {
        $minuteBucketKey = CacheKeys::rateBucket('minute');
        $success = false;
        apcu_fetch($minuteBucketKey, $success);
        if (!$success) {
            apcu_store($minuteBucketKey, [
                'tokens' => TelegramApiConfig::BULK_BROADCAST_PER_SEC * 2,
                'last_refill' => microtime(true)
            ], APCuConfig::LONG_TTL);
        }
        
        $secondBucketKey = CacheKeys::rateBucket('second');
        $success = false;
        apcu_fetch($secondBucketKey, $success);
        if (!$success) {
            apcu_store($secondBucketKey, [
                'tokens' => TelegramApiConfig::BULK_BROADCAST_PER_SEC,
                'last_refill' => microtime(true)
            ], APCuConfig::LONG_TTL);
        }
    }
    
    private function getEndpointDelay(string $endpoint): float {
        $cacheKey = CacheKeys::endpointDelay($endpoint);
        return apcu_fetch($cacheKey) ?: $this->baseDelayMs;
    }
    
    private function setEndpointDelay(string $endpoint, float $delay): void {
        $cacheKey = CacheKeys::endpointDelay($endpoint);
        apcu_store($cacheKey, $delay, APCuConfig::LONG_TTL);
    }
    
    public function calculateBackoffDelayMs(int $attempt, string $endpoint = 'default'): int {
        $baseDelay = $this->baseDelayMs;
        $adaptiveDelay = $this->getEndpointDelay($endpoint);
        if ($adaptiveDelay > $baseDelay) {
            $baseDelay = $adaptiveDelay;
        }
    
        $delay = $baseDelay * pow($this->backoffMultiplier, $attempt);
        $delay = min($delay, $this->maxDelayMs);
        
        $jitterRange = $delay * $this->jitterFactor;
        $jitter = random_int((int)(-$jitterRange), (int)$jitterRange);
        $delay += $jitter;
        
        return (int)max($delay, 0);
    }
    
    private function getTokensFromBucket(string $bucketType, int $tokens = 1): bool {
        $bucketKey = CacheKeys::rateBucket($bucketType);
        $lockKey = $bucketKey . ':lock';
        
        if (!apcu_add($lockKey, 1, 1)) {
            return false;
        }
        
        try {
            $success = false;
            $bucket = apcu_fetch($bucketKey, $success);
            
            if (!$success || !is_array($bucket)) {
                $maxTokens = ($bucketType === 'minute') ? TelegramApiConfig::BULK_BROADCAST_PER_SEC * 2 : TelegramApiConfig::BULK_BROADCAST_PER_SEC;
                $bucket = [
                    'tokens' => $maxTokens,
                    'last_refill' => microtime(true)
                ];
            }
            
            $now = microtime(true);
            $timeDelta = $now - $bucket['last_refill'];
            
            $maxTokens = ($bucketType === 'minute') ? TelegramApiConfig::BULK_BROADCAST_PER_SEC * 2 : TelegramApiConfig::BULK_BROADCAST_PER_SEC;
            $refillTime = ($bucketType === 'minute') ? 60.0 : 1.0;
            $tokensToAdd = floor($timeDelta / $refillTime * $maxTokens);
            
            if ($tokensToAdd > 0) {
                $bucket['tokens'] = min($maxTokens, $bucket['tokens'] + $tokensToAdd);
                $bucket['last_refill'] = $now - fmod($timeDelta, $refillTime);
            }
            
            if ($bucket['tokens'] >= $tokens) {
                $bucket['tokens'] -= $tokens;
                apcu_store($bucketKey, $bucket, APCuConfig::LONG_TTL);
                return true;
            }
            
            apcu_store($bucketKey, $bucket, APCuConfig::LONG_TTL);
            return false;
        } finally {
            apcu_delete($lockKey);
        }
    }
    
    public function getThrottleDelayMs(string $endpoint): int {
        $endpoint = normalizeEndpoint($endpoint);
        $currentTime = microtime(true);
        
        if (!$this->getTokensFromBucket('second')) {
            $delay = 1000;
            $this->errorLogService->log('api', 'rate_limit_hit', 
                ErrorContext::create()->operation('API_THROTTLE'), [$endpoint, 'token_bucket_second exceeded']);
            return $delay;
        }
        
        if (!$this->getTokensFromBucket('minute')) {
            $secondsIntoCurrentMinute = fmod($currentTime, 60);
            $secondsUntilNextMinute = 60 - $secondsIntoCurrentMinute;
            
            $delay = (int)($secondsUntilNextMinute * 1000 / (TelegramApiConfig::BULK_BROADCAST_PER_SEC * 2));
            $delay = min(max($delay, 100), 30000);
            
            $this->errorLogService->log('api', 'rate_limit_hit', 
                ErrorContext::create()->operation('API_THROTTLE'), [$endpoint, 'token_bucket_minute exceeded']);
            
            return $delay;
        }
        
        $delayMs = $this->getDistributedDelayMs($endpoint, $currentTime);
        
        return max(0, $delayMs);
    }
    
    private function getDistributedDelayMs(string $endpoint, float $currentTime): int {
        $cacheKey = CacheKeys::rateLimit($endpoint, 'timestamps');
        $requestTimestamps = apcu_fetch($cacheKey, $success);
        if (!$success) {
            $requestTimestamps = [];
        }
        
        $requestTimestamps = array_filter(
            $requestTimestamps,
            fn($timestamp) => $timestamp >= $currentTime - 60
        );
        
        $requestsLastSecond = count(array_filter(
            $requestTimestamps,
            fn($timestamp) => $timestamp >= $currentTime - 1
        ));
        
        $requestsLastMinute = count($requestTimestamps);
        
        if ($requestsLastMinute > 0) {
            $optimalSpacingMs = (60000 / (TelegramApiConfig::BULK_BROADCAST_PER_SEC * 2));
            
            $mostRecentTimestamp = !empty($requestTimestamps) ? max($requestTimestamps) : ($currentTime - 1);
            $msSinceLastRequest = ($currentTime - $mostRecentTimestamp) * 1000;
            
            if ($msSinceLastRequest < $optimalSpacingMs) {
                $delayMs = $optimalSpacingMs - $msSinceLastRequest;
                
                $jitter = $delayMs * $this->jitterFactor;
                $delayMs += random_int((int)(-$jitter), (int)($jitter));
                
                return (int)max(0, $delayMs);
            }
        }
        
        return 0;
    }
    
    public function recordRequest(string $endpoint): void {
        $endpoint = normalizeEndpoint($endpoint);
        $currentTime = microtime(true);
        
        $cacheKey = CacheKeys::rateLimit($endpoint, 'timestamps');
        $requestTimestamps = apcu_fetch($cacheKey, $success);
        if (!$success) {
            $requestTimestamps = [];
        }
        
        $requestTimestamps[] = $currentTime;
        
        $requestTimestamps = array_filter(
            $requestTimestamps,
            fn($timestamp) => $timestamp >= $currentTime - 60
        );
        
        apcu_store($cacheKey, $requestTimestamps, APCuConfig::SHORT_TTL);
    }
    
    public function recordRateLimit(string $endpoint, int $retryAfter = 0): void {
        $endpoint = normalizeEndpoint($endpoint);
        $currentTime = time();
        
        $cacheKey = CacheKeys::rateLimit($endpoint, 'data');
        $rateLimitData = apcu_fetch($cacheKey, $success);
        if (!$success) {
            $rateLimitData = [
                'count' => 0,
                'first_occurrence' => $currentTime,
                'retry_after' => 0,
                'last_occurrence' => $currentTime,
                'adaptive_delay_ms' => $this->baseDelayMs
            ];
        }
        
        $rateLimitData['count']++;
        $rateLimitData['last_occurrence'] = $currentTime;
        
        $adaptiveDelay = min(
            $this->maxDelayMs,
            $rateLimitData['adaptive_delay_ms'] * $this->backoffMultiplier
        );
        
        $this->setEndpointDelay($endpoint, $adaptiveDelay);
        
        $rateLimitData['adaptive_delay_ms'] = $adaptiveDelay;
        
        $rateLimitData['retry_after'] = max(
            $rateLimitData['retry_after'],
            $retryAfter > 0 ? $retryAfter : 60
        );
        
        apcu_store($cacheKey, $rateLimitData, APCuConfig::LONG_TTL);
        
        $this->errorLogService->log('api', 'rate_limit_hit', 
            ErrorContext::create()->operation('RATE_LIMIT_ENCOUNTERED'), [$endpoint, 'Rate limit encountered']);
    }
    
    public function getOptimalDelayMs(string $endpoint): int {
        $endpoint = normalizeEndpoint($endpoint);
        $delay = $this->getEndpointDelay($endpoint);
        
        $jitterRange = $delay * $this->jitterFactor;
        $delay += random_int((int)(-$jitterRange), (int)$jitterRange);
        
        return (int)max($delay, 0);
    }
}