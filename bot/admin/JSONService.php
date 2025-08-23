<?php
// admin/JSONService.php - JSON validation logic

final class JSONService {
    private const string JSON_DIR = __DIR__ . '/../json/';
    
    public static function validateAllFiles(): array {
        $files = [
            'ui.en.json' => 'ui',
            'ui.km.json' => 'ui',
            'logging.json' => 'backend'
        ];
        
        $results = [];
        
        foreach ($files as $filename => $type) {
            $filepath = self::JSON_DIR . $filename;
            $result = self::validateJsonFile($filepath);
            
            if ($result['exists'] && $result['valid']) {
                $jsonData = self::loadJsonFile($filepath);
                if ($jsonData) {
                    $structureErrors = match($type) {
                        'ui' => self::validateUIStructure($jsonData),
                        'backend' => self::validateBackendStructure($jsonData),
                        default => []
                    };
                    $result['structure_valid'] = empty($structureErrors);
                    $result['structure_errors'] = $structureErrors;
                } else {
                    $result['structure_valid'] = false;
                    $result['structure_errors'] = ['Unable to parse JSON data'];
                }
            } else {
                $result['structure_valid'] = false;
                $result['structure_errors'] = [];
            }
            
            $results[$filename] = $result;
        }
        
        return $results;
    }
    
    public static function validateUIStructure(array $uiData): array {
        $errors = [];
        
        $requiredForBot = [
            'welcome',
            'menu',
            'unknown_command',
            'channel' => [
                'join_required',
                'join_button'
            ],
            'promo' => [
                'welcome'
            ],
            'settings' => [
                'home_menu',
                'language_menu'
            ],
            'error' => [
                'user_creation'
            ],
            'buttons' => [
                'promos',
                'settings',
                'language',
                'home'
            ],
            'confirmations' => [
                'language_changed',
                'unknown_callback'
            ]
        ];
        
        foreach ($requiredForBot as $section => $fields) {
            if (is_array($fields)) {
                if (!isset($uiData[$section])) {
                    $errors[] = "Missing required field: {$section}";
                    continue;
                }
                
                foreach ($fields as $field) {
                    if (!isset($uiData[$section][$field])) {
                        $errors[] = "Missing required field: {$section}.{$field}";
                    }
                }
            } else {
                if (!isset($uiData[$fields])) {
                    $errors[] = "Missing required field: {$fields}";
                }
            }
        }
        
        return $errors;
    }
    
    public static function validateBackendStructure(array $backendData): array {
        $errors = [];
        
        $requiredForBot = [
            'data' => [
                'user_create_failed',
                'user_lookup_failed',
                'user_update_failed',
                'user_info_missing',
                'connection_failed',
                'query_failed'
            ],
            'api' => [
                'request_failed',
                'chat_id_missing'
            ],
            'bot' => [
                'message_processing',
                'callback_processing',
                'user_started_new',
                'user_started_existing',
                'unknown_message_sent'
            ],
            'core' => [
                'general_error',
                'exception_caught',
                'callback_duplicate',
                'callback_unknown',
                'webhook_validation_failed'
            ]
        ];
        
        foreach ($requiredForBot as $section => $fields) {
            if (!isset($backendData[$section])) {
                $errors[] = "Missing required field: {$section}";
                continue;
            }
            
            foreach ($fields as $field) {
                if (!isset($backendData[$section][$field])) {
                    $errors[] = "Missing required field: {$section}.{$field}";
                }
            }
        }
        
        return $errors;
    }
    
    private static function validateJsonFile(string $filepath): array {
        $exists = file_exists($filepath);
        $valid = false;
        
        if ($exists) {
            $content = file_get_contents($filepath);
            $valid = $content !== false && json_validate($content);
        }
        
        return [
            'exists' => $exists,
            'valid' => $valid,
            'filepath' => $filepath
        ];
    }
    
    private static function loadJsonFile(string $filepath): ?array {
        if (!file_exists($filepath)) {
            return null;
        }
        
        $content = file_get_contents($filepath);
        if ($content === false || !json_validate($content)) {
            return null;
        }
        
        return json_decode($content, true);
    }
}