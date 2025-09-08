<?php
// services/CoreServices.php - System infrastructure services

readonly class HandlerDependencies {
    public function __construct(
        public UserService $userService,
        public LogService $logService,
        public KeyboardService $keyboardService,
        public CommandService $commandService,
        public ErrorLogService $errorLogService,
        public LanguageService $languageService,
        public VenueTypeService $venueTypeService,
        public CityService $cityService,
        public VenueService $venueService,
        public BrandService $brandService,
        public EventService $eventService,
        public DiscoveryService $discoveryService
    ) {}
    
    public function buildInlineKeyboard(string $preferenceType, array $user, string $language): array
    {
        $method = CommandService::COMMANDS[$preferenceType]['navigation']['keyboard'] ?? '';
        if (!$method) return [];
        
        return match($preferenceType) {
            'language' => $this->keyboardService->$method(
                $this->languageService->getActiveLanguages(),
                $user['language'],
                'language'
            ),
            'city' => (function() use ($user, $language, $method) {
        				$cities = $this->cityService->getCities($language);
        				$formattedCities = $this->cityService->formatCities($cities);

        				return $this->keyboardService->$method(
            				$formattedCities,
            				$user['cityid'],
            				'city'
        				);
    				})(),
    				'venue_types' => (function() use ($user, $method) {
    						$venueTypes = $this->venueTypeService->getVenueTypes();
								$formattedVenueTypes = $this->venueTypeService->formatVenueTypes($venueTypes);

        				return $this->keyboardService->$method(
            				$formattedVenueTypes,
            				explode(',', $user['venue_types']),
            				'venue_types'
        				);
    				})(),
            'alerts' => $this->keyboardService->$method(
                'alerts',
                $user['alerts'],
                $language
            ),
            default => []
        };
    }
}

class LogService {
    private ?ErrorLogService $errorLogService;
    private bool $hasLoggedEntries = false;
    
    public function __construct(?ErrorLogService $errorLogService = null) {
        $this->errorLogService = $errorLogService;
        
        register_shutdown_function([$this, 'addEndingSeparator']);
    }
    
    public function addEndingSeparator(): void {
        if ($this->hasLoggedEntries) {
            $this->appendToLog("\n", LogPaths::APP_LOG);
            $this->hasLoggedEntries = false;
        }
    }
    
    public function info(string $message): void {
        $this->log($message, 'INFO');
    }
    
    public function warning(string $message): void {
        $this->log($message, 'WARNING');
    }
    
    public function error(string $message): void {
        $this->log($message, 'ERROR');
        
        if ($this->errorLogService) {
            $this->errorLogService->log('core', 'general_error', 
                new ErrorContext(null, null, 'GENERAL_ERROR'), [$message]);
        }
    }
    
    private function log(string $message, string $level = 'INFO'): void {
        $timestamp = date('Y-m-d H:i:s');
        $logEntry = "[$timestamp] [$level] $message" . PHP_EOL;
        
        $this->appendToLog($logEntry, LogPaths::APP_LOG);
        $this->hasLoggedEntries = true;
    }
    
    private function appendToLog(string $content, string $logFile): void {
        try {
            file_put_contents($logFile, $content, FILE_APPEND);
        } catch (\Exception $e) {
            // Silent fail for logging operations
        }
    }

    public function logUserMessage(string $username, string $message): void {
        $timestamp = date('Y-m-d H:i:s');
        $displayName = trim($username) ?: 'Anonymous';
        $logEntry = "[$timestamp] $displayName: $message" . PHP_EOL;
        
        $this->appendToLog($logEntry, LogPaths::TEXT_LOG);
        $this->hasLoggedEntries = true;
    }
    
    public function logException(\Exception $e, string $context = 'EXCEPTION'): void {
        $message = "Exception in {$context}: {$e->getMessage()} in {$e->getFile()}:{$e->getLine()}";
        $this->error($message);
        
        if ($this->errorLogService) {
            $this->errorLogService->log('core', 'exception', 
                new ErrorContext(null, null, $context), [$e->getMessage(), $e->getFile(), $e->getLine()]);
        }
    }
}

class LanguageService {
    
    public function __construct(private readonly Database $db) {}
    
    public function getActiveLanguages(): array {
        $success = false;
        $languages = apcu_fetch(Constants::NAMESPACE . ':languages:active', $success);
        
        if ($success) {
            return $languages;
        }
        
        $rows = $this->db->selectRows(
            'language',
            ['languagevisible' => 1],
            ['languagesid', 'languagename', 'languageflag'],
            null,
            'languagesort',
            'ASC'
        );
        
        $languages = [];
        foreach ($rows as $row) {
            $languages[$row['languagesid']] = "{$row['languageflag']} {$row['languagename']}";
        }
        
        apcu_store(Constants::NAMESPACE . ':languages:active', $languages, APCuConfig::USER_TTL);
        return $languages;
    }
    
    public function clearCache(): void {
        apcu_delete(Constants::NAMESPACE . ':languages:active');
    }
}