<?php
// services/SecurityServices.php - Webhook security validation

readonly final class WebhookValidator {
    public static function validateRequest(string $rawInput): bool {
        if (!PayloadValidator::validateStructure($rawInput)) {
            return false;
        }
        
        if (WebhookSecurity::ENABLE_SECRET_TOKEN && !SecretTokenValidator::validateToken()) {
            return false;
        }
        
        if (WebhookSecurity::ENABLE_IP_VALIDATION && !TelegramIPValidator::validateIP()) {
            if (WebhookSecurity::IP_STRICT_MODE) {
                return false;
            }
        }
        
        return true;
    }
}

readonly final class SecretTokenValidator {
    public static function validateToken(): bool {
        if (empty(WebhookSecurity::SECRET_TOKEN)) {
            return false;
        }
        
        $receivedToken = $_SERVER['HTTP_X_TELEGRAM_BOT_API_SECRET_TOKEN'] ?? '';
        
        if (empty($receivedToken)) {
            return false;
        }
        
        return hash_equals(WebhookSecurity::SECRET_TOKEN, $receivedToken);
    }
}

readonly final class TelegramIPValidator {
    public static function validateIP(): bool {
        $clientIP = self::getClientIP();
        return self::isValidTelegramIP($clientIP);
    }
    
    public static function getClientIP(): string {
        $headers = [
            'HTTP_CF_CONNECTING_IP',
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_REAL_IP',
            'REMOTE_ADDR'
        ];
        
        foreach ($headers as $header) {
            if (($ip = trim(explode(',', $_SERVER[$header] ?? '')[0])) &&
                filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                return $ip;
            }
        }
        
        return $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    }
    
    private static function isValidTelegramIP(string $ip): bool {
        foreach (TelegramIPRanges::ALLOWED_RANGES as $range) {
            if (self::isIPInRange($ip, $range)) {
                return true;
            }
        }
        return false;
    }
    
    private static function isIPInRange(string $ip, string $cidr): bool {
        [$subnet, $mask] = explode('/', $cidr);
        
        $ipLong = ip2long($ip);
        $subnetLong = ip2long($subnet);
        $maskLong = -1 << (32 - (int)$mask);
        
        return ($ipLong & $maskLong) === ($subnetLong & $maskLong);
    }
}

readonly final class PayloadValidator {
    public static function validateStructure(string $rawInput): bool {
        return strlen($rawInput) <= WebhookSecurity::MAX_PAYLOAD_SIZE &&
               json_validate($rawInput) &&
               isset(json_decode($rawInput, true)['update_id']);
    }
}

readonly final class CallbackSecurityValidator {
    public static function isDuplicateCallback(int $userId): bool {
        $currentTime = microtime(true);
        $cacheKey = CacheKeys::CALLBACK_PREFIX . $userId . ':last_time';
        
        $success = false;
        $lastTime = apcu_fetch($cacheKey, $success);
        
        if ($success && ($currentTime - $lastTime) < SystemLimits::CALLBACK_DEBOUNCE_SECONDS) {
            return true;
        }
        
        apcu_store($cacheKey, $currentTime, APCuConfig::SHORT_TTL);
        return false;
    }
}