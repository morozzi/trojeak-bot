<?php
// bot/handlers/MemberUpdateHandler.php

class MemberUpdateHandler {
    
    public function __construct(
        private readonly HandlerDependencies $deps
    ) {}
    
    public function handleChatMember(array $chatMemberUpdate): void {
        $userId = $chatMemberUpdate['from']['id'];
        $newStatus = $chatMemberUpdate['new_chat_member']['status'];
        
        if ($chatMemberUpdate['chat']['type'] === 'private') {
            $user = $this->deps->userService->getUserByTelegramId($userId);
            
            if ($user) {
                $this->updateBotStatus($userId, $newStatus);
            }
        }
    }
    
    public function handleChannelMember(array $chatMemberUpdate): void {
        $userId = $chatMemberUpdate['from']['id'];
        $username = $chatMemberUpdate['from']['username'] ?? '';
        $chatId = $chatMemberUpdate['chat']['id'];
        $chatUsername = $chatMemberUpdate['chat']['username'] ?? null;
        $newStatus = $chatMemberUpdate['new_chat_member']['status'];
        $oldStatus = $chatMemberUpdate['old_chat_member']['status'];
        
        if (!$this->isTargetChannel($chatId, $chatUsername)) {
            return;
        }
        
        $user = $this->deps->userService->getUserByTelegramId($userId);
        if (!$user) {
            return;
        }
        
        $userInfo = $this->deps->userService->formatUserInfo($userId, $username, $user['first_name'], $user['last_name']);
        
        $isMember = in_array($newStatus, ['member', 'administrator', 'creator']);
        $wasMember = in_array($oldStatus, ['member', 'administrator', 'creator']);
        
        if ($isMember !== $wasMember) {
            $updateResult = $this->deps->userService->updateUserTable($userId, UserTable::CHANNEL_MEMBER, $isMember);
            
            if ($updateResult) {
                $action = $isMember ? "joined" : "left";
                $this->deps->logService->info($this->deps->errorLogService->getMessage('bot', 'channel_webhook_accessed', [$userInfo, $action]));
                
                $this->deps->userService->clearUserCache($userId);
                
                if ($isMember && !$wasMember) {
                    $this->checkAndFulfillPendingRequest($userId);
                }
            } else {
                $this->deps->errorLogService->log('data', 'channel_membership_update_failed', 
                    ErrorContext::create($userId, $username), []);
            }
        }
    }
    
    private function checkAndFulfillPendingRequest(int $userId): void {
        $success = false;
        $pendingRequest = apcu_fetch(CacheKeys::PENDING_REQUEST_PREFIX . $userId, $success);
        
        if ($success && $pendingRequest && ($pendingRequest['timestamp'] + APCuConfig::MEDIUM_TTL) > time()) {
            $this->executePendingRequest($userId, $pendingRequest);
            apcu_delete(CacheKeys::PENDING_REQUEST_PREFIX . $userId);
        }
    }
    
    private function executePendingRequest(int $userId, array $pendingRequest): void {
        $userInfo = $this->deps->userService->formatUserInfo($userId, '', '', '');
        $this->deps->logService->info($this->deps->errorLogService->getMessage('bot', 'request_auto_fulfilled', [$pendingRequest['command_text'], $userInfo]));
        
        $user = $this->deps->userService->getUserByTelegramId($userId);
        $userLanguage = $user['language'] ?? array_keys($this->deps->languageService->getActiveLanguages())[0];
        
        $commandKey = str_replace('/', '', $pendingRequest['command_key']);
        
        foreach (CommandService::COMMANDS as $command => $config) {
            if ($config['protected'] && $command === $commandKey) {
                $messageKey = $config['navigation']['message_key'] ?? null;
                if ($messageKey) {
                    sendMessage(BotConfig::TOKEN, $pendingRequest['chat_id'], Messages::get($messageKey, [], $userLanguage), [
                        'parse_mode' => 'HTML'
                    ]);
                }
                break;
            }
        }
    }
    
    private function isTargetChannel(string|int $chatId, ?string $chatUsername): bool {
        $targetChannelId = BotConfig::CHANNEL_ID;
        
        if (str_starts_with($targetChannelId, '@')) {
            $targetUsername = ltrim($targetChannelId, '@');
            return $chatUsername === $targetUsername;
        }
        
        return (string)$chatId === $targetChannelId;
    }
    
    private function updateBotStatus(int $userId, string $newStatus): void {
        $status = match ($newStatus) {
            'kicked' => Constants::USER_BLOCKED,
            'member' => Constants::USER_ACTIVE,
            default => null
        };
        
        if ($status) {
            $success = $this->deps->userService->updateUserTable($userId, UserTable::STATUS, $status);
            if ($success) {
                $user = $this->deps->userService->getUserByTelegramId($userId);
                $userInfo = $this->deps->userService->formatUserInfo($userId, $user['username'], $user['first_name'], $user['last_name']);
                $statusLabel = $status === Constants::USER_BLOCKED ? "blocked" : "unblocked";
                $this->deps->logService->info($this->deps->errorLogService->getMessage('bot', 'user_bot_status_changed', [$userInfo, $statusLabel]));
            }
        }
    }
}