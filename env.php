<?php
// env.php - Environment variable loader

class Env {
    private static ?array $variables = null;
    
    public static function load(string $envFile = null): void {
        if (self::$variables !== null) {
            return;
        }
        
        $envFile = $envFile ?? __DIR__ . '/.env';
        
        if (!file_exists($envFile)) {
            throw new \RuntimeException("Environment file not found: {$envFile}");
        }
        
        $content = file_get_contents($envFile);
        if ($content === false) {
            throw new \RuntimeException("Failed to read environment file: {$envFile}");
        }
        
        self::$variables = [];
        $lines = explode("\n", $content);
        
        foreach ($lines as $line) {
            $line = trim($line);
            
            if (empty($line) || str_starts_with($line, '#')) {
                continue;
            }
            
            if (str_contains($line, '=')) {
                [$key, $value] = explode('=', $line, 2);
                self::$variables[trim($key)] = trim($value);
            }
        }
    }
    
    public static function get(string $key): string {
        if (self::$variables === null) {
            self::load();
        }
        
        if (!isset(self::$variables[$key])) {
            throw new \RuntimeException("Environment variable '{$key}' not found");
        }
        
        return self::$variables[$key];
    }
}