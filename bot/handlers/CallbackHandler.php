<?php
// bot/handlers/CallbackHandler.php

class CallbackHandler {
    
    public function __construct(
        private readonly HandlerDependencies $deps
    ) {}
    
    public function handle(array $callbackQuery): void {
        $userInfo = $this->deps->userService->extractUserInfo(['callback_query' => $callbackQuery]);
        $callbackData = $callbackQuery['data'];
        $chatId = $callbackQuery['message']['chat']['id'];
        $messageId = $callbackQuery['message']['message_id'];
        $userId = $userInfo['userId'];
        $callbackId = $callbackQuery['id'];
        
        if (CallbackSecurityValidator::isDuplicateCallback($userId)) {
            answerCallbackQuery(BotConfig::TOKEN, $callbackId);
            
            $this->deps->errorLogService->log('core', 'callback_duplicate', ErrorContext::create($userId, $userInfo['username']), [$callbackData, $userId]);
            return;
        }
        
        $userInfoStr = $this->deps->userService->formatUserInfo($userId, $userInfo['username'], $userInfo['firstName'], $userInfo['lastName']);
        $this->deps->logService->info($this->deps->errorLogService->getMessage('bot', 'callback_processing', [$callbackData, $userInfoStr]));
        
        match (true) {
            str_starts_with($callbackData, 'language_') => 
                $this->handlePreferenceChange($callbackQuery, 'language'),
            str_starts_with($callbackData, 'alerts_') => 
                $this->handlePreferenceChange($callbackQuery, 'alerts'),
            str_starts_with($callbackData, 'venue_types_') => 
                $this->handlePreferenceChange($callbackQuery, 'venue_types'),
            str_starts_with($callbackData, 'city_') => 
                $this->handlePreferenceChange($callbackQuery, 'city'),
            default => $this->handleUnknownCallback($callbackQuery)
        };
    }
    
    private function processMultiSelectUpdate(string $currentValue, string $toggleValue): array
    {
        $currentItems = explode(',', $currentValue ?? '');
        $currentItems = array_filter($currentItems);
        
        $wasRemoved = false;
        if (in_array($toggleValue, $currentItems)) {
            $currentItems = array_diff($currentItems, [$toggleValue]);
            $wasRemoved = true;
        } else {
            $currentItems[] = $toggleValue;
        }
        
        return [
            'value' => implode(',', $currentItems),
            'wasRemoved' => $wasRemoved,
            'toggledItem' => $toggleValue
        ];
    }
    
    private function handlePreferenceChange(array $callbackQuery, string $preferenceType): void {
        $callbackData = $callbackQuery['data'];
        $chatId = $callbackQuery['message']['chat']['id'];
        $messageId = $callbackQuery['message']['message_id'];
        $userId = $callbackQuery['from']['id'];
        $callbackId = $callbackQuery['id'];
        
        $value = str_replace($preferenceType . '_', '', $callbackData);
        
        $user = $this->deps->userService->getUserByTelegramId($userId);
        if (!$user) {
            answerCallbackQuery(BotConfig::TOKEN, $callbackId, Messages::get('error.user_creation'), true);
            return;
        }
        
        $userLanguage = $user['language'] ?? array_keys($this->deps->languageService->getActiveLanguages())[0] ?? 'en';
        
        $column = match($preferenceType) {
            'language' => UserTable::LANGUAGE,
            'alerts' => UserTable::ALERTS,
            'city' => UserTable::CITYID,
            'venue_types' => UserTable::VENUE_TYPES
        };

        $wasRemoved = false;
        $clickedButton = $value;
        if ($preferenceType === 'venue_types') {
            $result = $this->processMultiSelectUpdate($user['venue_types'], $value);
            $value = $result['value'];
            $wasRemoved = $result['wasRemoved'];
            $clickedButton = $result['toggledItem'];
        }

        $updateResult = $this->deps->userService->updateUserTable($userId, $column, $value);
        
        if ($updateResult) {
            $updatedUser = $this->deps->userService->getUserByTelegramId($userId);
            
            $command = CommandService::COMMANDS[$preferenceType] ?? [];
            $messageKey = CommandService::resolveDynamicMessageKey(
                $command['navigation']['message_key'] ?? 'settings.main_menu', 
                $updatedUser
            );
            
            $messageLanguage = ($preferenceType === 'language') ? $value : $userLanguage;
            $keyboard = $this->deps->buildInlineKeyboard($preferenceType, $updatedUser, $messageLanguage);
            
            editMessageText(BotConfig::TOKEN, $chatId, $messageId, 
                Messages::get($messageKey, [], $messageLanguage), [
                'reply_markup' => json_encode($keyboard)
            ]);
            
            $confirmationKey = match($preferenceType) {
                'language' => 'confirmations.language_changed',
                'alerts' => $value === '1' ? 'confirmations.alerts_enabled' : 'confirmations.alerts_disabled',
                'city' => 'confirmations.city_changed',
                'venue_types' => 'confirmations.venue_types_updated',
                default => 'confirmations.operation_completed'
            };
            
            if ($preferenceType === 'city') {
                $cities = $this->deps->cityService->getCities($messageLanguage);
                $formattedCities = $this->deps->cityService->formatCities($cities);
                $displayValue = $formattedCities[$value] ?? $value;
            } else {
                $displayValue = match($preferenceType) {
                    'alerts' => $value === '1' ? 'enabled' : 'disabled',
                    default => $value
                };
            }
            
            if ($preferenceType === 'language') {
                sendMessage(BotConfig::TOKEN, $chatId, 
                    Messages::get('confirmations.language_changed', [], $value), [
                    'reply_markup' => json_encode($this->deps->keyboardService->buildMenuKeyboard(
                        CommandService::BUTTON_GROUPS['settings'], $value))
                ]);
            } elseif ($preferenceType !== 'alerts') {
                if ($preferenceType === 'venue_types') {
                    $venueTypes = $this->deps->venueTypeService->getVenueTypes();
                    $formattedVenueTypes = $this->deps->venueTypeService->formatVenueTypes($venueTypes);
                    $venueName = $formattedVenueTypes[$clickedButton] ?? $clickedButton;
                    $actionKey = $wasRemoved ? 'confirmations.venue_removed' : 'confirmations.venue_added';
                    sendMessage(BotConfig::TOKEN, $chatId, 
                        Messages::get($actionKey, [$venueName], $messageLanguage));
                } else {
                    sendMessage(BotConfig::TOKEN, $chatId, 
                        Messages::get($confirmationKey, $preferenceType === 'city' ? [$displayValue] : [], $messageLanguage));
                }
            }
            
            match($preferenceType) {
                'city' => answerCallbackQuery(BotConfig::TOKEN, $callbackId, 
                    Messages::get($confirmationKey, [$displayValue], $messageLanguage)),
                'venue_types' => answerCallbackQuery(BotConfig::TOKEN, $callbackId, 
                    Messages::get($actionKey, [$venueName], $messageLanguage)),
                default => answerCallbackQuery(BotConfig::TOKEN, $callbackId, 
                    Messages::get($confirmationKey, [], $messageLanguage))
            };
            
            if ($preferenceType === 'city' || $preferenceType === 'venue_types') {
                $this->deps->discoveryService->handleEventDiscovery($chatId, $updatedUser, $messageLanguage);
            }
            
            $userInfoStr = $this->deps->userService->formatUserInfo($userId, $user['username'] ?? '', $user['first_name'] ?? '', $user['last_name'] ?? '');
            $this->deps->logService->info($this->deps->errorLogService->getMessage('bot', 'user_preference_changed', [$userInfoStr, $preferenceType, $displayValue]));
        } else {
            answerCallbackQuery(BotConfig::TOKEN, $callbackId, Messages::get('error.user_creation', [], $userLanguage), true);
        }
    }
    
    private function handleUnknownCallback(array $callbackQuery): void {
        $callbackId = $callbackQuery['id'];
        $userId = $callbackQuery['from']['id'];
        $username = $callbackQuery['from']['username'] ?? '';
        $callbackData = $callbackQuery['data'];
        
        $user = $this->deps->userService->getUserByTelegramId($userId);
        $userLanguage = $user['language'] ?? array_keys($this->deps->languageService->getActiveLanguages())[0] ?? 'en';
        
        $this->deps->errorLogService->log('core', 'callback_unknown', 
            ErrorContext::create($userId, $username), [$callbackData]);
        
        answerCallbackQuery(BotConfig::TOKEN, $callbackId, Messages::get('confirmations.unknown_callback', [], $userLanguage));
    }
}