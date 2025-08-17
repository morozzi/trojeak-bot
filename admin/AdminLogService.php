<?php
// admin/AdminLogService.php - Log analysis logic

final class AdminLogService {
    private const string LOGS_DIRECTORY = __DIR__ . '/../logs/';
    private const int MAX_FILE_SIZE = 50 * 1024 * 1024;
    
    public static function getAvailableFiles(): array {
        $files = [];
        
        if (is_dir(self::LOGS_DIRECTORY)) {
            foreach (scandir(self::LOGS_DIRECTORY) as $file) {
                $filePath = self::LOGS_DIRECTORY . $file;
                
                if ($file == '.' || $file == '..' || is_dir($filePath)) {
                    continue;
                }
                
                if (pathinfo($file, PATHINFO_EXTENSION) === 'log') {
                    $files[$file] = [
                        'name' => $file,
                        'size' => filesize($filePath),
                        'formatted_size' => self::formatFileSize(filesize($filePath))
                    ];
                }
            }
        }
        
        return $files;
    }
    
    public static function isValidLogFile(string $filename): bool {
        if (empty($filename) || strlen($filename) > 255) {
            return false;
        }
        
        if (!preg_match('/^[a-zA-Z0-9._-]+\.log$/', $filename)) {
            return false;
        }
        
        if (strpos($filename, '..') !== false || strpos($filename, '/') !== false || strpos($filename, '\\') !== false) {
            return false;
        }
        
        $realLogsPath = realpath(self::LOGS_DIRECTORY);
        if ($realLogsPath === false) {
            return false;
        }
        
        $filePath = realpath(self::LOGS_DIRECTORY . $filename);
        
        if ($filePath === false || !is_file($filePath)) {
            return false;
        }
        
        if (strpos($filePath, $realLogsPath) !== 0) {
            return false;
        }
        
        if (filesize($filePath) > self::MAX_FILE_SIZE) {
            return false;
        }
        
        $extension = pathinfo($filename, PATHINFO_EXTENSION);
        return $extension === 'log';
    }
    
    public static function analyzeLogFile(string $filename, int $maxLines = 50000): array {
        if (!self::isValidLogFile($filename)) {
            return ['error' => 'Invalid file selection'];
        }
        
        $filePath = self::LOGS_DIRECTORY . $filename;
        $startTime = microtime(true);
        
        $analysis = [
            'totalErrors' => 0,
            'errorTypes' => [],
            'errorMessages' => [],
            'operations' => [],
            'userIds' => [],
            'timeDistribution' => [],
            'dateDistribution' => [],
            'exampleErrors' => [],
            'processingStats' => [
                'fileSize' => filesize($filePath),
                'linesProcessed' => 0,
                'processingTime' => 0
            ]
        ];
        
        $analysis = self::processLogLines($filePath, $maxLines, $analysis);
        $analysis = self::sortAndLimitResults($analysis);
        $analysis['processingStats']['processingTime'] = microtime(true) - $startTime;
        $analysis['patterns'] = self::identifyPatterns($analysis);
        
        return $analysis;
    }
    
    private static function processLogLines(string $filePath, int $maxLines, array $analysis): array {
        $logPattern = '/^\[([^\]]+)\] \[([^\]]+)\] \[([^\]]+)\] \[([^\]]+)\] \[([^\]]+)\] (.+)$/';
        
        $file = fopen($filePath, 'r');
        if (!$file) {
            return array_merge($analysis, ['error' => 'Failed to open log file']);
        }

        $lineNumber = 0;
        while (($line = fgets($file)) !== false && $lineNumber < $maxLines) {
            $lineNumber++;
            $analysis['processingStats']['linesProcessed']++;
            
            if (trim($line) === '') {
                continue;
            }
            
            if (preg_match($logPattern, $line, $matches)) {
                $analysis = self::processLogEntry($analysis, $matches, $line);
            }
        }
        
        fclose($file);
        return $analysis;
    }
    
    private static function processLogEntry(array $analysis, array $matches, string $line): array {
        $timestamp = $matches[1];
        $errorType = $matches[2];
        $userId = $matches[3];
        $username = $matches[4];
        $context = $matches[5];
        $details = $matches[6];
        
        $analysis['totalErrors']++;
        
        $analysis['errorTypes'][$errorType] = ($analysis['errorTypes'][$errorType] ?? 0) + 1;
        
        $errorMessage = self::extractErrorMessage($details);
        if (!isset($analysis['errorMessages'][$errorMessage])) {
            $analysis['errorMessages'][$errorMessage] = [
                'count' => 0,
                'type' => $errorType,
                'contexts' => [],
                'example' => $details
            ];
        }
        $analysis['errorMessages'][$errorMessage]['count']++;
        $analysis['errorMessages'][$errorMessage]['contexts'][$context] = 
            ($analysis['errorMessages'][$errorMessage]['contexts'][$context] ?? 0) + 1;
        
        $analysis['operations'][$context] = ($analysis['operations'][$context] ?? 0) + 1;
        
        if ($userId !== '-' && is_numeric($userId)) {
            if (!isset($analysis['userIds'][$userId])) {
                $analysis['userIds'][$userId] = [
                    'count' => 0,
                    'username' => $username !== '-' ? $username : null
                ];
            }
            $analysis['userIds'][$userId]['count']++;
        }
        
        $hour = date('H', strtotime($timestamp));
        $analysis['timeDistribution'][$hour] = ($analysis['timeDistribution'][$hour] ?? 0) + 1;
        
        $date = date('Y-m-d', strtotime($timestamp));
        $analysis['dateDistribution'][$date] = ($analysis['dateDistribution'][$date] ?? 0) + 1;
        
        $errorKey = $errorType . '_' . md5($errorMessage);
        if (!isset($analysis['exampleErrors'][$errorKey])) {
            $analysis['exampleErrors'][$errorKey] = [
                'timestamp' => $timestamp,
                'type' => $errorType,
                'context' => $context,
                'details' => $details,
                'line' => $line
            ];
        }
        
        return $analysis;
    }
    
    private static function sortAndLimitResults(array $analysis): array {
        arsort($analysis['errorTypes']);
        
        uasort($analysis['errorMessages'], fn($a, $b) => $b['count'] - $a['count']);
        $analysis['errorMessages'] = array_slice($analysis['errorMessages'], 0, 20, true);
        
        arsort($analysis['operations']);
        
        uasort($analysis['userIds'], fn($a, $b) => $b['count'] - $a['count']);
        $analysis['userIds'] = array_slice($analysis['userIds'], 0, 10, true);
        
        ksort($analysis['timeDistribution']);
        ksort($analysis['dateDistribution']);
        
        return $analysis;
    }
    
    public static function identifyPatterns(array $analysis): array {
        $patterns = [];
        
        $dateCounts = $analysis['dateDistribution'];
        arsort($dateCounts);
        $topDate = key($dateCounts);
        $topDateCount = current($dateCounts);
        $avgDailyErrors = count($dateCounts) > 0 ? $analysis['totalErrors'] / count($dateCounts) : 0;
        
        if ($topDateCount > $avgDailyErrors * 1.5) {
            $patterns[] = [
                'type' => 'date_spike',
                'description' => "Error spike detected on {$topDate} with {$topDateCount} errors, which is " . 
                                round($topDateCount / $avgDailyErrors, 1) . "x the daily average."
            ];
        }
        
        foreach ($analysis['errorMessages'] as $message => $data) {
            foreach ($data['contexts'] as $context => $count) {
                if ($count > ($data['count'] * 0.8) && $data['count'] > 5) {
                    $patterns[] = [
                        'type' => 'context_correlation',
                        'description' => "Error pattern: \"{$message}\" occurs primarily in the \"{$context}\" context ({$count}/{$data['count']} occurrences)."
                    ];
                }
            }
        }
        
        if (!empty($analysis['userIds'])) {
            $topUserId = array_key_first($analysis['userIds']);
            $topUserCount = $analysis['userIds'][$topUserId]['count'];
            $username = $analysis['userIds'][$topUserId]['username'] ?? 'unknown';
            
            if ($topUserCount > 10) {
                $patterns[] = [
                    'type' => 'user_impact',
                    'description' => "User ID {$topUserId}" . 
                                    ($username ? " ({$username})" : "") . 
                                    " is experiencing a high error rate with {$topUserCount} errors."
                ];
            }
        }
        
        $timeoutCount = 0;
        foreach ($analysis['errorMessages'] as $message => $data) {
            if (strpos(strtolower($message), 'timeout') !== false || 
                strpos(strtolower($message), 'execution time') !== false) {
                $timeoutCount += $data['count'];
            }
        }
        
        if ($timeoutCount > 5) {
            $patterns[] = [
                'type' => 'performance',
                'description' => "Detected {$timeoutCount} timeout-related errors, suggesting potential performance issues."
            ];
        }
        
        $hourCounts = $analysis['timeDistribution'];
        arsort($hourCounts);
        $peakHours = array_slice($hourCounts, 0, 3, true);
        
        if (count($peakHours) > 0) {
            $peakHoursStr = implode('h, ', array_keys($peakHours)) . 'h';
            $patterns[] = [
                'type' => 'time_pattern',
                'description' => "Peak error hours are at {$peakHoursStr}, possibly correlating with high traffic periods."
            ];
        }
        
        return $patterns;
    }
    
    private static function extractErrorMessage(string $details): string {
        $normalized = preg_replace('/\b\d{5,}\b/', '{ID}', $details);
        $normalized = preg_replace('/\b[0-9a-f]{32}\b/i', '{HASH}', $normalized);
        $normalized = preg_replace('/\b\d{4}-\d{2}-\d{2}\b/', '{DATE}', $normalized);
        $normalized = preg_replace('/\b\d{2}:\d{2}:\d{2}\b/', '{TIME}', $normalized);
        
        if (strpos($normalized, ':') !== false) {
            $parts = explode(':', $normalized, 2);
            if (count($parts) == 2 && strlen(trim($parts[1])) < 30) {
                return trim($parts[0]) . ': {VALUE}';
            }
        }
        
        return $normalized;
    }
    
    private static function formatFileSize(int $bytes): string {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        for ($i = 0; $bytes > 1024; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }
}