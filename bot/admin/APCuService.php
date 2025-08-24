<?php
// bot/admin/APCuService.php - APCu diagnostics logic

final class APCuService {
    public static function getDiagnostics(): array {
        $configs = [
            'apc.enabled' => 'Enabled in web mode',
            'apc.shm_size' => 'Shared memory size',
            'apc.ttl' => 'Time to live for user cache',
            'apc.gc_ttl' => 'Garbage collection TTL',
            'apc.entries_hint' => 'Expected number of entries',
            'apc.slam_defense' => 'Slam defense setting',
            'apc.serializer' => 'Serializer in use'
        ];
        
        $diagnostics = [];
        foreach ($configs as $directive => $description) {
            $value = ini_get($directive);
            $diagnostics[] = [
                'setting' => $directive,
                'description' => $description,
                'value' => $value
            ];
        }
        
        return $diagnostics;
    }
    
    public static function runBasicTests(): array {
        $results = [];
        $key = Constants::NAMESPACE . ':test:' . uniqid();
        $value = 'Test value ' . time();
        
        $storeResult = apcu_store($key, $value, 60);
        $results[] = [
            'test' => 'Store value',
            'success' => $storeResult,
            'details' => "Key: {$key}, Value: {$value}"
        ];
        
        $fetchedValue = apcu_fetch($key, $success);
        $results[] = [
            'test' => 'Retrieve value',
            'success' => $success && $fetchedValue === $value,
            'details' => "Retrieved: {$fetchedValue}"
        ];
        
        $exists = apcu_exists($key);
        $results[] = [
            'test' => 'Check existence',
            'success' => $exists,
            'details' => "Key exists: " . ($exists ? "Yes" : "No")
        ];
        
        $deleteResult = apcu_delete($key);
        $results[] = [
            'test' => 'Delete value',
            'success' => $deleteResult,
            'details' => "Key deleted"
        ];
        
        $existsAfterDelete = apcu_exists($key);
        $results[] = [
            'test' => 'Verify deletion',
            'success' => !$existsAfterDelete,
            'details' => "Key exists after deletion: " . ($existsAfterDelete ? "Yes (Fail)" : "No (Success)")
        ];
        
        return $results;
    }
    
    public static function runPerformanceTests(): array {
        $iterations = 1000;
        $dataSize = 1024;
        $testData = str_repeat('A', $dataSize);
        $namespace = Constants::NAMESPACE . ':perf:';
        
        $results = [];
        
        $storeTime = self::measureOperation($iterations, function($i) use ($namespace, $testData) {
            apcu_store("{$namespace}{$i}", $testData, 60);
        });
        $results[] = [
            'operation' => 'Store',
            'iterations' => $iterations,
            'total_time' => $storeTime,
            'avg_time' => ($storeTime / $iterations) * 1000
        ];
        
        $fetchTime = self::measureOperation($iterations, function($i) use ($namespace) {
            apcu_fetch("{$namespace}{$i}");
        });
        $results[] = [
            'operation' => 'Fetch',
            'iterations' => $iterations,
            'total_time' => $fetchTime,
            'avg_time' => ($fetchTime / $iterations) * 1000
        ];
        
        $deleteTime = self::measureOperation($iterations, function($i) use ($namespace) {
            apcu_delete("{$namespace}{$i}");
        });
        $results[] = [
            'operation' => 'Delete',
            'iterations' => $iterations,
            'total_time' => $deleteTime,
            'avg_time' => ($deleteTime / $iterations) * 1000
        ];
        
        return $results;
    }
    
    public static function getMemoryUsage(): array {
        if (!function_exists('apcu_cache_info') || !function_exists('apcu_sma_info')) {
            return [
                'error' => 'APCu info functions not available. Add apc.enable_cli=1 and apc.rfc1867=1 to php.ini'
            ];
        }
        
        try {
            $smaInfo = apcu_sma_info(true);
            $cacheInfo = apcu_cache_info(true);
            
            $totalMemory = $smaInfo['seg_size'];
            $availableMemory = $smaInfo['avail_mem'];
            $usedMemory = $totalMemory - $availableMemory;
            $usedPercentage = ($usedMemory / $totalMemory) * 100;
            
            $memory = [
                'total_memory' => $totalMemory,
                'used_memory' => $usedMemory,
                'available_memory' => $availableMemory,
                'used_percentage' => $usedPercentage,
                'formatted' => [
                    'total' => self::formatBytes($totalMemory),
                    'used' => self::formatBytes($usedMemory),
                    'available' => self::formatBytes($availableMemory)
                ]
            ];
            
            $cache = [
                'num_entries' => $cacheInfo['num_entries'],
                'num_hits' => $cacheInfo['num_hits'],
                'num_misses' => $cacheInfo['num_misses']
            ];
            
            if ($cacheInfo['num_hits'] + $cacheInfo['num_misses'] > 0) {
                $cache['hit_rate'] = ($cacheInfo['num_hits'] / ($cacheInfo['num_hits'] + $cacheInfo['num_misses'])) * 100;
            }
            
            return [
                'memory' => $memory,
                'cache' => $cache
            ];
        } catch (\Exception $e) {
            return [
                'error' => 'Error retrieving APCu info: ' . $e->getMessage()
            ];
        }
    }
    
    public static function getSystemInfo(): array {
        return [
            'php_version' => phpversion(),
            'apcu_version' => phpversion('apcu'),
            'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
            'date_time' => date('Y-m-d H:i:s')
        ];
    }
    
    private static function measureOperation(int $iterations, callable $operation): float {
        $startTime = microtime(true);
        for ($i = 0; $i < $iterations; $i++) {
            $operation($i);
        }
        return microtime(true) - $startTime;
    }
    
    private static function formatBytes(int $bytes, int $precision = 2): string {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= (1 << (10 * $pow));
        
        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}