<?php
// messages.php - Loads messages from JSON file

class Messages {
    private static ?array $messages = null;
    private static ?ErrorLogService $errorLogService = null;
    private static ?LanguageService $languageService = null;
    
    public static function initialize(ErrorLogService $errorLogService, LanguageService $languageService): void {
        self::$errorLogService = $errorLogService;
        self::$languageService = $languageService;
    }
    
    private static function validateLanguage(string $language): string {
        $languages = self::$languageService->getLanguages();
        $formattedLanguages = self::$languageService->formatLanguages($languages);
        return array_key_exists($language, $formattedLanguages) 
            ? $language 
            : ($languages[0]['languagesid'] ?? 'en');
    }
    
    public static function load(string $language = 'en'): array {
        $language = self::validateLanguage($language);
        
        if (self::$messages === null) {
            self::$messages = [];
        }
        
        if (!isset(self::$messages[$language])) {
            $cacheKey = Constants::NAMESPACE . ':messages:' . $language . ':' . Constants::JSON_VERSION;
            
            $success = false;
            $messages = apcu_fetch($cacheKey, $success);
            
            if ($success) {
                self::$messages[$language] = $messages;
                return self::$messages[$language];
            }
            
            $jsonFile = __DIR__ . '/json/ui.' . $language . '.json';
            if (!file_exists($jsonFile)) {
                if (self::$errorLogService) {
                    self::$errorLogService->log('system', 'general_error', ErrorContext::create(), ["Messages JSON file not found: $jsonFile"]);
                }
                return [];
            }
            
            $jsonContent = file_get_contents($jsonFile);
            if ($jsonContent === false) {
                if (self::$errorLogService) {
                    self::$errorLogService->log('system', 'general_error', ErrorContext::create(), ["Error reading messages JSON file"]);
                }
                return [];
            }
            
            if (!json_validate($jsonContent)) {
                if (self::$errorLogService) {
                    $jsonError = json_last_error_msg();
                    self::$errorLogService->log('system', 'general_error', ErrorContext::create(), ["JSON processing failed in messages file: " . $jsonError]);
                }
                return [];
            }
            
            $messagesData = json_decode($jsonContent, true);
            
            self::$messages[$language] = $messagesData;
            
            apcu_store($cacheKey, self::$messages[$language], APCuConfig::MEDIUM_TTL);
        }
        
        return self::$messages[$language];
    }
    
    public static function get(string $key, array $replacements = [], string $language = 'en'): string {
        $language = self::validateLanguage($language);
        $messages = self::load($language);
        
        $keys = explode('.', $key);
        $message = $messages;
        
        foreach ($keys as $part) {
            if (!isset($message[$part])) {
                $languages = self::$languageService->getLanguages();
                $defaultLang = $languages[0]['languagesid'] ?? 'en';
                if ($language !== $defaultLang) {
                    return self::get($key, $replacements, $defaultLang);
                }
                
                if (self::$errorLogService) {
                    self::$errorLogService->log('system', 'general_message', ErrorContext::create(), ["Message key not found: $key"]);
                }
                
                return $key;
            }
            $message = $message[$part];
        }
        
        if (!is_string($message)) {
            if (self::$errorLogService) {
                self::$errorLogService->log('system', 'general_message', ErrorContext::create(), ["Message for key '$key' is not a string"]);
            }
            
            return $key;
        }
        
        if (!empty($replacements)) {
            try {
                $placeholderCount = preg_match_all('/%[sdiouxXfFeEgGaAcs]/', $message);
                
                if (count($replacements) < $placeholderCount) {
                    $replacements = array_pad($replacements, $placeholderCount, '');
                } elseif (count($replacements) > $placeholderCount) {
                    $replacements = array_slice($replacements, 0, $placeholderCount);
                }
                
                $message = vsprintf($message, $replacements);
            } catch (\Exception $e) {
                $message .= ' - Format Error: ' . implode(', ', $replacements);
            }
        }
        
        return $message;
    }
    
    public static function getButton(string $buttonKey, string $language = 'en'): string {
        return self::get("buttons.$buttonKey", [], $language);
    }
    
    public static function validateMessageLength(string $message): bool {
        return mb_strlen($message, 'UTF-8') <= SystemLimits::MAX_MESSAGE_LENGTH;
    }
    
    public static function truncateMessageIfNeeded(string $message, int $maxLength = SystemLimits::MAX_MESSAGE_LENGTH): string {
        if (mb_strlen($message, 'UTF-8') <= $maxLength) {
            return $message;
        }
        
        preg_match_all('/<[^>]+>/u', $message, $tags);
        $openTags = [];
        
        foreach ($tags[0] as $tag) {
            if (preg_match('/<[^>\/]+\/>/u', $tag)) {
                continue;
            }
            
            if (!preg_match('/<\//u', $tag)) {
                preg_match('/<([a-z]+)[^>]*>/ui', $tag, $matches);
                if (isset($matches[1])) {
                    $openTags[] = $matches[1];
                }
            } else {
                preg_match('/<\/([a-z]+)[^>]*>/ui', $tag, $matches);
                if (isset($matches[1])) {
                    $key = array_search($matches[1], $openTags);
                    if ($key !== false) {
                        array_splice($openTags, $key, 1);
                    }
                }
            }
        }
        
        $truncated = mb_substr($message, 0, $maxLength - 10, 'UTF-8');
        
        $openTags = array_reverse($openTags);
        foreach ($openTags as $tag) {
            $truncated .= "</{$tag}>";
        }
        
        $truncated .= "...";
        
        return $truncated;
    }
}