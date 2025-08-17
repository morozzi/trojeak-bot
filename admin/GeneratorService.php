<?php
// admin/GeneratorService.php - Test data generation logic

final class GeneratorService {
    public const int DEFAULT_TEST_USERS = 100;
    public const int MAX_TEST_USERS = 1000;
    public const int MIN_TEST_USERS = 1;
    
    public static function handleRequest(array $params, Database $db): array {
        $preserveData = isset($params['preserve']) && 
                       is_string($params['preserve']) && 
                       $params['preserve'] === '1';
        
        $userInput = $params['users'] ?? self::DEFAULT_TEST_USERS;
        if (!is_numeric($userInput) || $userInput != (int)$userInput) {
            $totalUsers = self::DEFAULT_TEST_USERS;
        } else {
            $totalUsers = min(self::MAX_TEST_USERS, max(self::MIN_TEST_USERS, (int)$userInput));
        }
        
        $percentInput = $params['notif_percent'] ?? 80;
        if (!is_numeric($percentInput) || $percentInput != (int)$percentInput) {
            $alertsEnabledPercentage = 80;
        } else {
            $alertsEnabledPercentage = min(100, max(0, (int)$percentInput));
        }
        
        $countRow = $db->selectRow('users', [], ['COUNT(*) as count']);
        $userCountBefore = $countRow ? intval($countRow['count']) : 0;
        
        $config = [
            'totalUsers' => $totalUsers,
            'alertsEnabledPercentage' => $alertsEnabledPercentage,
            'preserveData' => $preserveData,
            'userCountBefore' => $userCountBefore,
            'timestamp' => time()
        ];
        
        apcu_store(CacheKeys::GENERATOR_PREFIX . 'config', $config, APCuConfig::LONG_TTL);
        
        if (!$preserveData) {
            self::clearExistingData($db);
        }
        
        $availableCities = self::loadAvailableCities($db);
        
        try {
            $result = $db->transaction(function($db) use ($totalUsers, $alertsEnabledPercentage, $availableCities) {
                return self::generateUsers($totalUsers, [
                    'alertsEnabledPercentage' => $alertsEnabledPercentage,
                    'availableCities' => $availableCities
                ], $db);
            });
            
            if ($result === false) {
                return ['error' => 'Transaction failed during user generation'];
            }
            
            $countRow = $db->selectRow('users', [], ['COUNT(*) as count']);
            $userCountAfter = $countRow ? intval($countRow['count']) : 0;
            $usersAdded = $userCountAfter - $userCountBefore;
            
            $finalResult = [
                'success' => true,
                'users_before' => $userCountBefore,
                'users_after' => $userCountAfter,
                'users_added' => $usersAdded,
                'preserve_data' => $preserveData,
                'generated_data' => $result
            ];
            
            apcu_store(CacheKeys::GENERATOR_PREFIX . 'results', $finalResult, APCuConfig::LONG_TTL);
            
            return $finalResult;
        } catch (\Exception $e) {
            return ['error' => 'Error generating data: ' . $e->getMessage()];
        }
    }
    
    public static function generateUsers(int $count, array $options, Database $db): array {
        global $container;
        
        $alertsEnabledPercentage = $options['alertsEnabledPercentage'] ?? 80;
        $availableCities = $options['availableCities'] ?? [0];
        
        $namesKey = CacheKeys::GENERATOR_PREFIX . 'cambodian_names';
        $cambodianNames = apcu_fetch($namesKey, $success);
        if (!$success) {
            $familyNames = ['Chea', 'Chhay', 'Heng', 'Hong', 'Hor', 'Hun', 'Keo', 'Kim', 'Kong', 'Lim', 
                          'Long', 'Mao', 'Meas', 'Sok', 'Som', 'Son', 'Tep', 'Thach', 'Van', 'Yos'];
            
            $givenNames = ['Bora', 'Bopha', 'Channary', 'Chantha', 'Dara', 'Kosal', 'Kunthea', 'Maly', 'Nimol', 'Phalla', 
                         'Pisey', 'Ratanak', 'Ratha', 'Samnang', 'Sokha', 'Sophea', 'Sopheap', 'Srey', 'Thida', 'Veasna'];
            
            $cambodianNames = ['family' => $familyNames, 'given' => $givenNames];
            apcu_store($namesKey, $cambodianNames, APCuConfig::LONG_TTL);
        }
        
        $familyNames = $cambodianNames['family'];
        $givenNames = $cambodianNames['given'];
        
        $venueTypes = $container->get('venue_type_service')->getActiveVenueTypes();
        $venueTypeOptions = array_keys($venueTypes);
        
        $languageService = $container->get('language_service');
        $availableLanguages = array_keys($languageService->getActiveLanguages());
        
        $userIds = [];
        $userInfo = [];
        
        for ($i = 1; $i <= $count; $i++) {
            $familyName = $familyNames[array_rand($familyNames)]; 
            $givenName = $givenNames[array_rand($givenNames)];
            $username = self::generateUsername($familyName, $givenName);
            
            do {
                $telegramId = random_int(10000000, 999999999);
                $existingUser = $db->selectRow('users', ['telegram_id' => $telegramId]);
            } while ($existingUser);
            
            $isBot = 1;
            $status = random_int(1, 10) <= 9 ? Constants::USER_ACTIVE : Constants::USER_BLOCKED;
            $alertsEnabled = (random_int(1, 100) <= $alertsEnabledPercentage) ? 1 : 0;
            $channelMember = random_int(1, 100) <= 70 ? 1 : 0;
            $cityId = $availableCities[array_rand($availableCities)];
            
            $numTypes = random_int(1, 3);
            $shuffledTypes = $venueTypeOptions;
            shuffle($shuffledTypes);
            $selectedVenueTypes = array_slice($shuffledTypes, 0, $numTypes);
            $venueTypesString = implode(',', $selectedVenueTypes);
            
            $createdAt = self::generateTimestampLastWeek();
            $randomLanguage = $availableLanguages[array_rand($availableLanguages)];
            
            $userData = [
                'telegram_id' => $telegramId,
                'username' => $username,
                'first_name' => $familyName,
                'last_name' => $givenName,
                'language' => $randomLanguage,
                'cityid' => $cityId,
                'venue_types' => $venueTypesString,
                'alerts' => $alertsEnabled,
                'channel_member' => $channelMember,
                'status' => $status,
                'is_bot' => $isBot,
                'created_at' => $createdAt
            ];
            
            $result = $db->insert('users', $userData);
            $userId = $result->insertId;
            
            $userIds[] = $userId;
            $userInfo[$userId] = [
                'telegram_id' => $telegramId,
                'username' => $username,
                'name' => "$familyName $givenName",
                'language' => $randomLanguage,
                'cityid' => $cityId,
                'venue_types' => $venueTypesString,
                'is_bot' => $isBot,
                'alerts' => $alertsEnabled,
                'channel_member' => $channelMember,
                'status' => $status,
                'created_at' => $createdAt
            ];
        }
        
        apcu_store(CacheKeys::GENERATOR_PREFIX . 'user_ids', $userIds, APCuConfig::LONG_TTL);
        apcu_store(CacheKeys::GENERATOR_PREFIX . 'user_info', $userInfo, APCuConfig::LONG_TTL);
        
        apcu_store(CacheKeys::GENERATOR_PREFIX . 'progress', [
            'users_generated' => count($userIds),
            'timestamp' => time()
        ], APCuConfig::LONG_TTL);
        
        return [
            'user_ids' => $userIds,
            'user_info' => $userInfo,
            'users_generated' => count($userIds)
        ];
    }
    
    public static function clearExistingData(Database $db): bool {
        try {
            $db->rawQuery("SET FOREIGN_KEY_CHECKS = 0");
            $db->rawQuery("TRUNCATE TABLE users");
            $db->rawQuery("SET FOREIGN_KEY_CHECKS = 1");
            
            $pattern = '/^' . preg_quote(Constants::NAMESPACE) . ':(user:|' . preg_quote(CacheKeys::GENERATOR_PREFIX) . ')/';
            $iterator = new APCUIterator($pattern);
            foreach ($iterator as $item) {
                apcu_delete($item['key']);
            }
            
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }
    
    public static function checkDatabase(Database $db): array {
        try {
            $testResult = $db->selectRow('information_schema.tables', [
                'table_schema' => 'information_schema',
                'table_name' => 'TABLES'
            ]);
            
            if (!$testResult) {
                return ['success' => false, 'message' => 'Cannot access database'];
            }
        } catch (\Exception $e) {
            return ['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()];
        }
        
        $usersTableExists = $db->exists('information_schema.tables', [
            'table_schema' => DatabaseConfig::NAME,
            'table_name' => 'users'
        ]);
        
        if (!$usersTableExists) {
            return ['success' => false, 'message' => 'Users table does not exist. Please run setup first.'];
        }
        
        return ['success' => true];
    }
    
    private static function loadAvailableCities(Database $db): array {
        $cities = $db->selectRows('city', ['cityvisible' => 1], ['cityid']);
        $availableCities = array_column($cities, 'cityid');
        
        return empty($availableCities) ? [0] : $availableCities;
    }
    
    private static function generateTimestampLastWeek(): string {
        $now = time();
        $oneWeekAgo = $now - (7 * 24 * 60 * 60);
        return date('Y-m-d H:i:s', random_int($oneWeekAgo, $now));
    }
    
    private static function generateUsername(string $familyName, string $givenName): string {
        $username = strtolower($familyName);
        
        $variations = [
            '', 
            strtolower($givenName[0]), 
            strtolower($givenName), 
            random_int(1, 999),
            strtolower($givenName) . random_int(1, 99)
        ];
        
        $username .= $variations[array_rand($variations)];
        
        if (random_int(0, 1)) {
            $username = str_replace(' ', random_int(0, 1) ? '_' : '.', $username);
        }
        
        return $username;
    }
}