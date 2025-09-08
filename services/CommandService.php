<?php
// services/CommandService.php - Centralized command registry and parsing

class CommandService {
    public const array COMMANDS = [
        '/start' => ['pattern' => 'starts_with', 'protected' => false],
        'home' => [
            'pattern' => 'exact', 
            'protected' => false,
            'navigation' => [
                'message_key' => 'welcome',
                'keyboard' => '@home'
            ]
        ],
        'settings' => [
            'pattern' => 'both', 
            'protected' => false,
            'navigation' => [
                'message_key' => 'settings.home_menu',
                'keyboard' => '@settings'
            ]
        ],
        'language' => [
            'pattern' => 'exact', 
            'protected' => false,
            'navigation' => [
                'message_key' => 'settings.language_menu',
                'keyboard' => 'getSingleSelectButtons',
                'data_source' => 'language'
            ]
        ],
        'alerts' => [
            'pattern' => 'exact', 
            'protected' => false,
            'navigation' => [
                'message_key' => 'settings.alerts_menu.dynamic',
                'keyboard' => 'getToggleButtons',
                'data_source' => 'alerts'
            ]
        ],
        'city' => [
            'pattern' => 'exact', 
            'protected' => false,
            'navigation' => [
                'message_key' => 'settings.city_menu',
                'keyboard' => 'getSingleSelectButtons',
                'data_source' => 'city'
            ]
        ],
        'venue_types' => [
            'pattern' => 'exact', 
            'protected' => false,
            'navigation' => [
                'message_key' => 'settings.venue_types_menu',
                'keyboard' => 'getMultiSelectButtons',
                'data_source' => 'venue_types'
            ]
        ],
        'events' => [
            'pattern' => 'both', 
            'protected' => true,
            'navigation' => [
                'keyboard' => 'getSimpleEventKeyboard',
                'data_source' => 'events'
            ]
        ],
        'venues' => [
            'pattern' => 'both', 
            'protected' => false
        ],
        'brands' => [
            'pattern' => 'both',
            'protected' => false
        ]
    ];
    
    public const array BUTTON_GROUPS = [
        'home' => [['events', 'venues'], ['brands', 'settings']],
        'settings' => [['city', 'venue_types'], ['alerts', 'language'], ['home']],
        'events' => [['city', 'venue_types'], ['home']]
    ];
    
    public function __construct(private readonly LanguageService $languageService) {}
    
    public static function resolveDynamicMessageKey(string $messageKey, array $user): string
    {
        if (!str_contains($messageKey, '.dynamic')) {
            return $messageKey;
        }
        
        $baseKey = str_replace('.dynamic', '', $messageKey);
        
        return match($baseKey) {
            'settings.alerts_menu' => $user['alerts'] 
                ? 'settings.alerts_menu_enabled' 
                : 'settings.alerts_menu_disabled',
            default => $baseKey
        };
    }
    
    public function parseCommand(string $text): array {
        foreach (self::COMMANDS as $command => $config) {
            $matches = $this->checkMatch($text, $command, $config);
            
            if ($matches) {
                $result = [
                    'handler' => $this->getHandlerName($command),
                    'protected' => $config['protected'],
                    'command' => $command,
                    'navigation' => $config['navigation'] ?? null
                ];
                
                if (isset($result['navigation']['keyboard'])) {
                    $result['navigation']['keyboard_type'] = str_starts_with($result['navigation']['keyboard'], '@') ? 'buttons' : 'method';
                }
                
                return $result;
            }
        }
        
        return [
            'handler' => 'handleUnknownCommand',
            'protected' => false,
            'command' => null,
            'navigation' => null
        ];
    }
    
    private function checkMatch(string $text, string $command, array $config): bool {
        if ($config['pattern'] === 'both') {
            return $text === "/{$command}" || $this->isButtonCommand($text, $command);
        }
        
        if (str_starts_with($command, '/')) {
            return match($config['pattern']) {
                'exact' => $text === $command,
                'starts_with' => str_starts_with($text, $command),
                default => false
            };
        }
        
        return $this->isButtonCommand($text, $command);
    }
    
    private function isButtonCommand(string $text, string $buttonKey): bool {
        $languages = $this->languageService->getLanguages();
        foreach ($languages as $lang) {
            $language = $lang['languagesid'];
            if ($text === Messages::getButton($buttonKey, $language)) {
                return true;
            }
        }
        return false;
    }
    
    private function getHandlerName(string $command): string {
        return match(true) {
            str_starts_with($command, '/') => 'handle' . ucfirst(ltrim($command, '/')) . 'Command',
            default => 'handleNavigationRequest'
        };
    }
}