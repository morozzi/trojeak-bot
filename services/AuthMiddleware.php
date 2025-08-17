<?php
// services/AuthMiddleware.php - Authentication middleware

class AuthMiddleware {
    
    public function __construct(
        private readonly HandlerDependencies $deps
    ) {}
    
    public function process(array $update, callable $next): bool {
        $userInfo = $this->deps->userService->extractUserInfo($update);
        
        if (!$userInfo['userId']) {
            $this->deps->logService->error("Failed to extract user ID from update");
            $this->deps->errorLogService->log('data', 'user_extraction_failed', ErrorContext::create(), []);
            return false;
        }
        
        if ($this->shouldBypassAuth($update)) {
            $this->logIncomingMessage($update, $userInfo);
            
            $next($update);
            return true;
        }
        
        $existingUser = $this->deps->userService->getUserByTelegramId($userInfo['userId']);
        
        $this->logIncomingMessage($update, $userInfo, $existingUser);
        
        if (!$existingUser) {
            return false;
        }
        
        if (isset($update['message']['text'])) {
            $command = $this->deps->commandService->parseCommand($update['message']['text']);
            if ($command && $command['protected'] && !$this->deps->userService->isChannelMember($userInfo['userId'])) {
                $commandText = $this->getCommandDisplayText($update);
                $this->logProtectedCommandAttempt($userInfo, $commandText);
                $this->storePendingRequest($userInfo['userId'], $update, $commandText, $userInfo['chatId'], $command);
                
                if ($userInfo['chatId']) {
                    $userLanguage = $existingUser['language'] ?? array_keys($this->deps->languageService->getActiveLanguages())[0] ?? 'en';
                    $buttons = $this->deps->keyboardService->getChannelJoinPrompt($userLanguage);
                    sendMessage(BotConfig::TOKEN, $userInfo['chatId'], Messages::get('channel.join_required', [], $userLanguage), [
                        'reply_markup' => json_encode($buttons)
                    ]);
                    
                    $userInfoStr = $this->deps->userService->formatUserInfo($userInfo['userId'], $userInfo['username'], $userInfo['firstName'], $userInfo['lastName']);
                    $this->deps->logService->info($this->deps->errorLogService->getMessage('bot', 'channel_prompt_sent', [$userInfoStr]));
                }
                return false;
            }
        }
        
        $next($update);
        return true;
    }
    
    private function storePendingRequest(int $userId, array $update, string $commandText, int $chatId, ?array $command): void {
        $pendingRequest = [
            'command_text' => $commandText,
            'command_key' => $command['command'] ?? '',
            'chat_id' => $chatId,
            'timestamp' => time()
        ];
        
        apcu_store(CacheKeys::PENDING_REQUEST_PREFIX . $userId, $pendingRequest, APCuConfig::MEDIUM_TTL);
        
        $userInfo = $this->deps->userService->formatUserInfo($userId, $update['message']['from']['username'] ?? '', $update['message']['from']['first_name'] ?? '', $update['message']['from']['last_name'] ?? '');
        $this->deps->logService->info($this->deps->errorLogService->getMessage('bot', 'pending_request_stored', [$commandText, $userInfo]));
    }
    
    private function logProtectedCommandAttempt(array $userInfo, string $commandText): void {
        $userInfoStr = $this->deps->userService->formatUserInfo($userInfo['userId'], $userInfo['username'], $userInfo['firstName'], $userInfo['lastName']);
        $this->deps->logService->info($this->deps->errorLogService->getMessage('bot', 'protected_command_attempted', [$userInfoStr]));
    }
    
    private function getCommandDisplayText(array $update): string {
        return $update['message']['text'];
    }
    
    private function logIncomingMessage(array $update, array $userInfo, ?array $existingUser = null): void {
        if (!isset($update['message']['text'])) {
            return;
        }
        
        $text = $update['message']['text'];
        
        $command = $this->deps->commandService->parseCommand($text);
        if ($command['command'] !== null) {
            return;
        }
        
        if (!$this->shouldBypassAuth($update) && !$existingUser) {
            return;
        }
        
        $displayName = $userInfo['username'] ?: trim("{$userInfo['firstName']} {$userInfo['lastName']}");
        if (empty($displayName)) {
            $displayName = 'Unknown User';
        }
        
        $this->deps->logService->logUserMessage($displayName, $text);
    }
    
    private function shouldBypassAuth(array $update): bool {
        if (isset($update['message']['text'])) {
            $command = $this->deps->commandService->parseCommand($update['message']['text']);
            return $command && !$command['protected'];
        }
        
        return match (true) {
            isset($update['chat_member']) => true,
            default => false
        };
    }
}