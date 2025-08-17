<?php
// handlers/MessageHandler.php

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
            $formattedBrands = $this->deps->brandService->getActiveBrands();
            if (empty($formattedBrands)) {
                $messageText = Messages::get('no_results', ['brands'], $userLanguage);
            } else {
                $messageText = implode("\n\n", $formattedBrands);
            }
        } elseif ($command['command'] === 'venues') {
            $userVenueTypes = !empty($existingUser['venue_types']) ? explode(',', $existingUser['venue_types']) : [];
            $formattedVenues = $this->deps->venueService->getActiveVenues($userLanguage, $existingUser['cityid'], $userVenueTypes);
            if (empty($formattedVenues)) {
                $messageText = Messages::get('no_results', ['venues'], $userLanguage);
            } else {
                $messageText = implode("\n\n", $formattedVenues);
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
    
    private function handleNewUserStart(int $chatId, array $telegramUser, string $userInfo): void {
        $userLanguage = $this->deps->userService->resolveUserLanguage(null, $telegramUser);
        
        $newUserId = $this->deps->userService->createUser(
            $telegramUser['id'], 
            $telegramUser['username'] ?? '', 
            $telegramUser['first_name'] ?? '', 
            $telegramUser['last_name'] ?? '', 
            $userLanguage
        );
        
        if ($newUserId === 0) {
            sendMessage(BotConfig::TOKEN, $chatId, Messages::get('error.user_creation', [], $userLanguage));
            return;
        }
        
        $keyboardMenu = $this->deps->keyboardService->buildMenuKeyboard(CommandService::BUTTON_GROUPS['home'], $userLanguage);
        
        $welcomeMessage = Messages::get('welcome', [], $userLanguage) . "\n\n" . Messages::get('menu', [], $userLanguage);
        sendMessage(BotConfig::TOKEN, $chatId, $welcomeMessage, [
            'reply_markup' => json_encode($keyboardMenu)
        ]);
        
        $this->deps->logService->info($this->deps->errorLogService->getMessage('bot', 'user_started_new', [$userInfo, $userLanguage]));
    }
    
    private function handleExistingUserStart(int $chatId, array $userData, string $userInfo): void {
        $userLanguage = $userData['language'] ?? array_keys($this->deps->languageService->getActiveLanguages())[0] ?? 'en';
        
        $keyboardMenu = $this->deps->keyboardService->buildMenuKeyboard(CommandService::BUTTON_GROUPS['home'], $userLanguage);
        
        $welcomeMessage = Messages::get('welcome', [], $userLanguage) . "\n\n" . Messages::get('menu', [], $userLanguage);
        sendMessage(BotConfig::TOKEN, $chatId, $welcomeMessage, [
            'reply_markup' => json_encode($keyboardMenu)
        ]);
        
        $this->deps->logService->info($this->deps->errorLogService->getMessage('bot', 'user_started_existing', [$userInfo]));
    }
    
    private function handleUnknownCommand(array $message, string $userInfo): void {
        $chatId = $message['chat']['id'];
        $messageText = $message['text'] ?? '';
        $telegramId = $message['from']['id'];
        
        $existingUser = $this->deps->userService->getUserByTelegramId($telegramId);
        $userLanguage = $existingUser['language'] ?? $this->deps->userService->resolveUserLanguage(null, $message['from']);
        
        sendMessage(BotConfig::TOKEN, $chatId, Messages::get('unknown_command', [], $userLanguage));
        
        $this->deps->logService->info($this->deps->errorLogService->getMessage('bot', 'unknown_message_sent', [$userInfo, $messageText]));
    }
}