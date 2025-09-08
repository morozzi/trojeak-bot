<?php
// bot/handlers/MessageHandler.php

class MessageHandler {
    
    public function __construct(
        private readonly HandlerDependencies $deps
    ) {}
    
    public function handle(array $message): void {
        if (!isset($message['chat']['id'])) {
            $this->deps->errorLogService->log('api', 'chat_id_missing', ErrorContext::create(), []);
            return;
        }
        
        $chatId = $message['chat']['id'];
        $text = $message['text'] ?? '';
        
        if (!isset($message['from']) || !isset($message['from']['id'])) {
            $this->deps->errorLogService->log('data', 'user_info_missing', ErrorContext::create(), []);
            sendMessage(BotConfig::TOKEN, $chatId, Messages::get('error.user_creation'));
            return;
        }
        
        $userInfo = $this->deps->userService->extractUserInfo(['message' => $message]);
        $userInfoStr = $this->deps->userService->formatUserInfo($userInfo['userId'], $userInfo['username'], $userInfo['firstName'], $userInfo['lastName']);
        $this->deps->logService->info($this->deps->errorLogService->getMessage('bot', 'message_processing', [$text, $userInfoStr]));
        
        $command = $this->deps->commandService->parseCommand($text);
        $this->{$command['handler']}($message, $userInfoStr, $command);
    }
    
    private function handleStartCommand(array $message, string $userInfo): void {
        $chatId = $message['chat']['id'];
        $telegramId = $message['from']['id'];
        
        $existingUser = $this->deps->userService->getUserByTelegramId($telegramId);
        
        if ($existingUser) {
            $this->handleExistingUserStart($chatId, $existingUser, $userInfo);
        } else {
            $this->handleNewUserStart($chatId, $message['from'], $userInfo);
        }
    }
    
    private function handleNavigationRequest(array $message, string $userInfo, array $command): void {
        $chatId = $message['chat']['id'];
        $telegramId = $message['from']['id'];
        
        $existingUser = $this->deps->userService->getUserByTelegramId($telegramId);
        if (!$existingUser) {
            $userLanguage = $this->deps->userService->resolveUserLanguage(null, $message['from']);
            sendMessage(BotConfig::TOKEN, $chatId, Messages::get('error.user_creation', [], $userLanguage));
            return;
        }
        
        $userLanguage = $existingUser['language'] ?? array_keys($this->deps->languageService->getActiveLanguages())[0] ?? 'en';
        $config = $command['navigation'];
        
        $messageOptions = ['parse_mode' => 'HTML'];
        
        if ($command['command'] === 'events') {
            $this->deps->discoveryService->handleEventDiscovery($chatId, $existingUser, $userLanguage);
            
            $inputMethod = str_starts_with($message['text'], '/') ? 'command' : 'button';
            $this->deps->logService->info(
                $this->deps->errorLogService->getMessage('bot', 'user_navigation', 
                    [$userInfo, $command['command'], $inputMethod]
                )
            );
            return;
        } elseif ($command['command'] === 'brands') {
            $brands = $this->deps->brandService->getBrands();
            $formattedBrands = $this->deps->brandService->formatBrands($brands);
            if (empty($formattedBrands)) {
                $messageText = Messages::get('no_results', ['brands'], $userLanguage);
            } else {
                $messageText = implode("\n\n", $formattedBrands);
            }
            $keyboard = $this->deps->keyboardService->getBrowseAllKeyboard('brands', $userLanguage);
            if (!empty($keyboard)) {
                $messageOptions['reply_markup'] = json_encode($keyboard);
            }
        } elseif ($command['command'] === 'venues') {
            $userVenueTypes = !empty($existingUser['venue_types']) ? explode(',', $existingUser['venue_types']) : [];
            $venues = $this->deps->venueService->getVenues($userLanguage, $existingUser['cityid']);
            if (!empty($userVenueTypes)) {
                $venues = array_filter($venues, fn($venue) => in_array($venue['venuetype'], $userVenueTypes));
            }
            $formattedVenues = $this->deps->venueService->formatVenues($venues);
            if (empty($formattedVenues)) {
                $messageText = Messages::get('no_results', ['venues'], $userLanguage);
            } else {
                $messageText = implode("\n\n", $formattedVenues);
            }
            $cities = $this->deps->cityService->getCities($userLanguage);
            $formattedCities = $this->deps->cityService->formatCities($cities);
            $cityName = $formattedCities[$existingUser['cityid']] ?? '';
            $keyboard = $this->deps->keyboardService->getBrowseAllKeyboard('venues', $userLanguage, $cityName);
            if (!empty($keyboard)) {
                $messageOptions['reply_markup'] = json_encode($keyboard);
            }
        } else {
            if (isset($config['keyboard'])) {
                $keyboard = match ($config['keyboard_type'] ?? 'method') {
                    'buttons' => $this->deps->keyboardService->buildMenuKeyboard(
                        CommandService::BUTTON_GROUPS[ltrim($config['keyboard'], '@')] ?? [], 
                        $userLanguage
                    ),
                    'method' => $this->deps->buildInlineKeyboard($config['data_source'], $existingUser, $userLanguage),
                    default => []
                };
                
                if (!empty($keyboard)) {
                    $messageOptions['reply_markup'] = json_encode($keyboard);
                }
            }
            
            $messageKey = CommandService::resolveDynamicMessageKey($config['message_key'], $existingUser);
            $messageText = Messages::get($messageKey, [], $userLanguage);
        }
        
        sendMessage(BotConfig::TOKEN, $chatId, $messageText, $messageOptions);
        
        $inputMethod = str_starts_with($message['text'], '/') ? 'command' : 'button';
        $this->deps->logService->info(
            $this->deps->errorLogService->getMessage('bot', 'user_navigation', 
                [$userInfo, $command['command'], $inputMethod]
            )
        );
    }
    
    private function handleExistingUserStart(int $chatId, array $user, string $userInfo): void {
        $userLanguage = $user['language'] ?? array_keys($this->deps->languageService->getActiveLanguages())[0] ?? 'en';
        
        $this->deps->logService->info($this->deps->errorLogService->getMessage('bot', 'existing_user_start', [$userInfo]));
        
        $welcomeMessage = Messages::get('welcome', [], $userLanguage);
        $menuMessage = Messages::get('menu', [], $userLanguage);
        $keyboard = $this->deps->keyboardService->buildMenuKeyboard(
            CommandService::BUTTON_GROUPS['home'], $userLanguage);
        
        sendMessage(BotConfig::TOKEN, $chatId, $welcomeMessage);
        sendMessage(BotConfig::TOKEN, $chatId, $menuMessage, [
            'reply_markup' => json_encode($keyboard)
        ]);
    }
    
    private function handleNewUserStart(int $chatId, array $userFrom, string $userInfo): void {
        $telegramId = $userFrom['id'];
        $username = $userFrom['username'] ?? '';
        $firstName = $userFrom['first_name'] ?? '';
        $lastName = $userFrom['last_name'] ?? '';
        $userLanguage = $this->deps->userService->resolveUserLanguage(null, $userFrom);
        
        $result = $this->deps->userService->createUser($telegramId, $username, $firstName, $lastName, $userLanguage);
        
        if ($result > 0) {
            $this->deps->logService->info($this->deps->errorLogService->getMessage('bot', 'new_user_created', [$userInfo]));
        
            $welcomeMessage = Messages::get('welcome', [], $userLanguage);
            $menuMessage = Messages::get('menu', [], $userLanguage);
            $keyboard = $this->deps->keyboardService->buildMenuKeyboard(
                CommandService::BUTTON_GROUPS['home'], $userLanguage);
            
            sendMessage(BotConfig::TOKEN, $chatId, $welcomeMessage);
            sendMessage(BotConfig::TOKEN, $chatId, $menuMessage, [
                'reply_markup' => json_encode($keyboard)
            ]);
        } else {
            sendMessage(BotConfig::TOKEN, $chatId, Messages::get('error.user_creation', [], $userLanguage));
        }
    }
    
    private function handleUnknownCommand(array $message, string $userInfo): void {
        $chatId = $message['chat']['id'];
        $telegramId = $message['from']['id'];
        $text = $message['text'] ?? '';
        
        $existingUser = $this->deps->userService->getUserByTelegramId($telegramId);
        $userLanguage = $existingUser['language'] ?? $this->deps->userService->resolveUserLanguage(null, $message['from']);
        
        $this->deps->errorLogService->log('core', 'unknown_command', 
            ErrorContext::create($telegramId, $message['from']['username'] ?? ''), [$text]);
        
        sendMessage(BotConfig::TOKEN, $chatId, Messages::get('unknown_command', [], $userLanguage), [
            'reply_markup' => json_encode($this->deps->keyboardService->buildMenuKeyboard(
                CommandService::BUTTON_GROUPS['home'], $userLanguage))
        ]);
    }
}