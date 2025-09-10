<?php
// services/UserServices.php - User domain management

final class UserTable {
    public const string NAME = 'users';
    public const string TELEGRAM_ID = 'telegram_id';
    public const string USERNAME = 'username';
    public const string FIRST_NAME = 'first_name';
    public const string LAST_NAME = 'last_name';
    public const string PHONE = 'phone';
    public const string LANGUAGE = 'language';
    public const string CITYID = 'cityid';
    public const string VENUE_TYPES = 'venue_types';
    public const string ALERTS = 'alerts';
    public const string CHANNEL_MEMBER = 'channel_member';
    public const string VENUE_STAFF = 'venue_staff';
    public const string ONBOARDING = 'onboarding';
    public const string STATUS = 'status';
    public const string IS_BOT = 'is_bot';
    public const string CREATED_AT = 'created_at';
    public const string UPDATED_AT = 'updated_at';
}

final class OnboardingTracker {
    public const int CITY_SHOWN = 1;
    public const int VENUE_TYPES_SHOWN = 2;
    public const int ALERTS_SHOWN = 4;
    
    public static function hasShown(int $flags, int $type): bool {
        return ($flags & $type) === $type;
    }
    
    public static function markShown(int $currentFlags, int $type): int {
        return $currentFlags | $type;
    }
}

trait UserCacheManager {
    private function clearUserCacheCluster(int $telegramId): void {
        apcu_delete(CacheKeys::user($telegramId));
        apcu_delete(CacheKeys::channelMember($telegramId));
    }
}

class UserService {
    use UserCacheManager;
    
    public function __construct(
        private readonly Database $db,
        private readonly LogService $logService,
        private readonly ErrorLogService $errorLogService,
        private readonly LanguageService $languageService
    ) {}
    
    public function extractUserInfo(array $update): array {
        return [
            'userId' => $this->getFieldFromUpdate($update, 'id'),
            'chatId' => $this->getChatIdFromUpdate($update),
            'username' => $this->getFieldFromUpdate($update, 'username'),
            'firstName' => $this->getFieldFromUpdate($update, 'first_name'),
            'lastName' => $this->getFieldFromUpdate($update, 'last_name')
        ];
    }
    
    private function getFieldFromUpdate(array $update, string $field): mixed {
        $paths = [
            "message.from.{$field}",
            "callback_query.from.{$field}",
            "my_chat_member.from.{$field}",
            "chat_member.from.{$field}"
        ];
        
        foreach ($paths as $path) {
            $value = $this->getNestedValue($update, $path);
            if ($value !== null) {
                return $value;
            }
        }
        
        return null;
    }
    
    private function getChatIdFromUpdate(array $update): mixed {
        $paths = [
            'message.chat.id',
            'callback_query.message.chat.id'
        ];
        
        foreach ($paths as $path) {
            $value = $this->getNestedValue($update, $path);
            if ($value !== null) {
                return $value;
            }
        }
        
        return null;
    }
    
    private function getNestedValue(array $array, string $path): mixed {
        $keys = explode('.', $path);
        $current = $array;
        
        foreach ($keys as $key) {
            if (!isset($current[$key])) {
                return null;
            }
            $current = $current[$key];
        }
        
        return $current;
    }
    
    public function resolveUserLanguage(?int $telegramId = null, ?array $telegramUser = null): string {
        if ($telegramId !== null) {
            $user = $this->getUserByTelegramId($telegramId);
            if ($user && isset($user['language'])) {
                return $user['language'];
            }
        }
        
        if ($telegramUser !== null) {
            $languageCode = $telegramUser['language_code'] ?? null;
            if ($languageCode) {
                $languages = $this->languageService->getLanguages();
                $languageIds = array_column($languages, 'languagesid');
                if (in_array($languageCode, $languageIds)) {
                    return $languageCode;
                }
            }
        }
        
        $languages = $this->languageService->getLanguages();
        return $languages[0]['languagesid'] ?? 'en';
    }
    
    public function getUserByTelegramId(int $telegramId): ?array {
        $cacheKey = CacheKeys::user($telegramId);
        $success = false;
        $user = apcu_fetch($cacheKey, $success);
        
        if ($success) {
            return $user;
        }
        
        $user = $this->db->selectRow(
            UserTable::NAME,
            [UserTable::TELEGRAM_ID => $telegramId],
            [
                UserTable::TELEGRAM_ID,
                UserTable::USERNAME,
                UserTable::FIRST_NAME,
                UserTable::LAST_NAME,
                UserTable::PHONE,
                UserTable::LANGUAGE,
                UserTable::CITYID,
                UserTable::VENUE_TYPES,
                UserTable::ALERTS,
                UserTable::CHANNEL_MEMBER,
                UserTable::VENUE_STAFF,
                UserTable::ONBOARDING,
                UserTable::STATUS,
                UserTable::CREATED_AT,
                UserTable::UPDATED_AT
            ]
        );
        
        if ($user) {
            apcu_store($cacheKey, $user, APCuConfig::USER_TTL);
        }
        
        return $user;
    }
    
    public function isUserBlocked(int $telegramId): bool {
        $user = $this->getUserByTelegramId($telegramId);
        return $user && $user['status'] === Constants::USER_BLOCKED;
    }
    
    public function isChannelMember(int $telegramId): bool {
        $cacheKey = CacheKeys::channelMember($telegramId);
        $success = false;
        $isMember = apcu_fetch($cacheKey, $success);
        
        if ($success) {
            return $isMember;
        }
        
        $response = getChatMember(BotConfig::TOKEN, BotConfig::CHANNEL_ID, $telegramId);
        $isMember = isset($response['ok']) && $response['ok'] && 
                   in_array($response['result']['status'], ['member', 'administrator', 'creator']);
        
        $user = $this->getUserByTelegramId($telegramId);
        if ($user) {
            $this->updateUserTable($telegramId, UserTable::CHANNEL_MEMBER, $isMember);
        }
        
        apcu_store($cacheKey, $isMember, APCuConfig::CHANNEL_TTL);
        
        return $isMember;
    }
    
    public function updateUserTable(int $telegramId, string $column, mixed $value): bool {
        $user = $this->getUserByTelegramId($telegramId);
        if (!$user) {
            $this->errorLogService->log('data', 'user_lookup_failed', 
                ErrorContext::create($telegramId), []);
            return false;
        }
        
        $result = $this->db->update(
            UserTable::NAME,
            [$column => $value],
            [UserTable::TELEGRAM_ID => $telegramId]
        );
        
        if ($result->success) {
            $this->clearUserCacheCluster($telegramId);
            return true;
        }
        
        $this->errorLogService->log('data', 'user_update_failed', 
            ErrorContext::create($telegramId, $user['username'] ?? null), [$result->error]);
        return false;
    }
    
    public function markOnboardingShown(int $telegramId, int $onboardingType): bool {
        $user = $this->getUserByTelegramId($telegramId);
        if (!$user) {
            return false;
        }
        
        $currentFlags = (int)($user['onboarding'] ?? 0);
        $newFlags = OnboardingTracker::markShown($currentFlags, $onboardingType);
        
        return $this->updateUserTable($telegramId, UserTable::ONBOARDING, $newFlags);
    }
    
    public function createUser(
        int $telegramId, 
        string $username, 
        string $firstName, 
        string $lastName, 
        string $language
    ): int {
        $languages = $this->languageService->getLanguages();
        $languageIds = array_column($languages, 'languagesid');
        if (!in_array($language, $languageIds)) {
            $language = $languages[0]['languagesid'] ?? 'en';
        }
        
        $data = [
            UserTable::TELEGRAM_ID => $telegramId,
            UserTable::USERNAME => $username,
            UserTable::FIRST_NAME => $firstName,
            UserTable::LAST_NAME => $lastName,
            UserTable::LANGUAGE => $language
        ];
        
        $result = $this->db->insert(UserTable::NAME, $data);
        
        if ($result->success) {
            $userInfo = $this->formatUserInfo($telegramId, $username, $firstName, $lastName);
            $this->logService->info($this->errorLogService->getMessage('bot', 'user_created', [$userInfo, $result->insertId]));
            
            $this->clearUserCacheCluster($telegramId);
            
            return $result->insertId;
        }
        
        $this->errorLogService->log('data', 'user_create_failed', 
            ErrorContext::create($telegramId, $username), ['Database insert failed']);
        return 0;
    }
    
    public function clearUserCache(int $telegramId): void {
        $this->clearUserCacheCluster($telegramId);
    }
    
    public function formatUserInfo(?int $telegramId = null, ?string $username = '', ?string $firstName = '', ?string $lastName = ''): string {
        if ($telegramId === null) return 'Unknown User';
        
        $userInfo = (string)$telegramId;
        $nameComponents = array_filter([$username, trim("$firstName $lastName")]);
        
        return $nameComponents ? $userInfo . ' [' . implode(', ', $nameComponents) . ']' : $userInfo;
    }
}