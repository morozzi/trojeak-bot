<?php
// bot/admin/m.php - Single entry point admin router

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../telegram_api.php';
require_once __DIR__ . '/AdminTemplate.php';
require_once __DIR__ . '/APCuService.php';
require_once __DIR__ . '/AdminLogService.php';
require_once __DIR__ . '/GeneratorService.php';
require_once __DIR__ . '/JSONService.php';

global $container;
$db = $container->get('database');

$page = $_GET['page'] ?? '';
$action = $_GET['action'] ?? '';
$confirm = isset($_GET['confirm']) && $_GET['confirm'] === 'yes';

if ($action) {
    handleAction($action, $confirm, $db);
} elseif ($page) {
    handlePage($page, $db);
} else {
    displayDashboard($db);
}

function handlePage(string $page, Database $db): void {
    match($page) {
        'apcu' => displayAPCuDiagnostics(),
        'logs' => displayLogAnalysis(),
        'json' => displayJSONValidation(),
        default => displayDashboard($db)
    };
}

function handleAction(string $action, bool $confirm, Database $db): void {
    if (in_array($action, ['flush', 'drop', 'clearcache']) && !$confirm) {
        displayConfirmation($action);
        return;
    }
    
    match($action) {
        'setup', 'webhook' => handleSetup($action, $db),
        'flush' => $confirm ? handleFlush($db) : null,
        'drop' => $confirm ? handleDrop($db) : null,
        'clearcache' => $confirm ? handleClearCache() : null,
        'channel_message' => handleChannelMessage(),
        default => displayDashboard($db)
    };
}

function handleChannelMessage(): void {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $messageText = htmlspecialchars($_POST['message_text'] ?? '');
        $buttonText = htmlspecialchars($_POST['button_text'] ?? '');
        
        if (empty($messageText) || empty($buttonText)) {
            $content = AdminTemplate::errorDiv('Message text and button text are required.');
            $content .= AdminTemplate::backToDashboard();
            echo AdminTemplate::layout('Channel Message Error', $content);
            return;
        }
        
        $miniAppUrl = 'https://t.me/' . BotConfig::USERNAME . '/trojeak';
        
        $inlineKeyboard = [
            'inline_keyboard' => [
                [
                    [
                        'text' => $buttonText,
                        'url' => $miniAppUrl
                    ]
                ]
            ]
        ];
        
        $response = sendMessage(
            BotConfig::TOKEN,
            BotConfig::CHANNEL_ID,
            $messageText,
            [
                'parse_mode' => 'HTML',
                'reply_markup' => json_encode($inlineKeyboard)
            ]
        );
        
        if (isset($response['ok']) && $response['ok']) {
            $messageId = $response['result']['message_id'];
            
            $pinResponse = pinChatMessage(BotConfig::TOKEN, BotConfig::CHANNEL_ID, $messageId);
            
            if (isset($pinResponse['ok']) && $pinResponse['ok']) {
                $content = AdminTemplate::successDiv('Message sent and pinned successfully!');
                $content .= '<p><strong>Message ID:</strong> ' . $messageId . '</p>';
                $content .= '<p><strong>Channel:</strong> ' . BotConfig::CHANNEL_ID . '</p>';
            } else {
                $content = AdminTemplate::errorDiv('Message sent but failed to pin.');
                $content .= '<p><strong>Message ID:</strong> ' . $messageId . '</p>';
                $content .= '<p><strong>Pin Error:</strong> ' . json_encode($pinResponse) . '</p>';
            }
        } else {
            $content = AdminTemplate::errorDiv('Failed to send message.');
            $content .= '<p><strong>Error:</strong> ' . json_encode($response) . '</p>';
        }
        
        $content .= AdminTemplate::backToDashboard();
        echo AdminTemplate::layout('Channel Message Result', $content);
        return;
    }
    
    $content = '<h2>Send Channel Message with Mini App Button</h2>';
    $content .= '<form method="POST">';
    $content .= '<div style="margin-bottom: 15px;">';
    $content .= '<label for="message_text"><strong>Message Text:</strong></label><br>';
    $content .= '<textarea name="message_text" id="message_text" rows="8" cols="60" required></textarea>';
    $content .= '</div>';
    $content .= '<div style="margin-bottom: 15px;">';
    $content .= '<label for="button_text"><strong>Button Text:</strong></label><br>';
    $content .= '<input type="text" name="button_text" id="button_text" size="30" required>';
    $content .= '</div>';
    $content .= '<div style="margin-bottom: 15px;">';
    $content .= '<p><strong>Mini App URL:</strong> https://t.me/' . BotConfig::USERNAME . '/trojeak</p>';
    $content .= '<p><strong>Target Channel:</strong> ' . BotConfig::CHANNEL_ID . '</p>';
    $content .= '<p><strong>Flow:</strong> One Click → Direct Mini App Launch</p>';
    $content .= '</div>';
    $content .= '<button type="submit" style="background: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 4px;">Send Message</button>';
    $content .= '</form>';
    $content .= AdminTemplate::backToDashboard();
    
    echo AdminTemplate::layout('Send Channel Message', $content);
}

function handleTestDataGeneration(Database $db): string {
    $dbCheck = GeneratorService::checkDatabase($db);
    if (!$dbCheck['success']) {
        $content = AdminTemplate::errorDiv($dbCheck['message']);
        $content .= AdminTemplate::backToDashboard();
        return $content;
    }
    
    $result = GeneratorService::handleRequest($_GET, $db);
    
    if (isset($result['error'])) {
        $content = AdminTemplate::errorDiv($result['error']);
    } else {
        $content = AdminTemplate::successDiv('Test data generated successfully!');
        if ($result['preserve_data']) {
            $content .= '<p>Added ' . $result['users_added'] . ' new users.</p>';
            $content .= '<p>Total users: ' . $result['users_after'] . '.</p>';
        } else {
            $content .= '<p>Generated ' . $result['users_after'] . ' users.</p>';
        }
    }
    
    $content .= AdminTemplate::backToDashboard();
    return $content;
}

function displayDashboard(Database $db): void {
    if (isset($_GET['users'])) {
        $content = handleTestDataGeneration($db);
        echo AdminTemplate::layout('Test Data Generation Results', $content);
        return;
    }
    
    $testResponse = getMe(BotConfig::TOKEN);
    $botConnected = (isset($testResponse['ok']) && $testResponse['ok']);
    
    $tableExists = $db->exists('information_schema.tables', [
        'table_schema' => DatabaseConfig::NAME,
        'table_name' => 'users'
    ]);
    
    $content = '<h2>System Status</h2>';
    $content .= '<div class="section">';
    $content .= '<div style="display: flex; gap: 30px;">';
    
    $content .= '<div style="flex: 1;">';
    $content .= '<h3>Core Systems</h3>';
    $content .= '<p><strong>Bot Connection:</strong> ';
    $content .= $botConnected ? 
        '<span class="success">✅ Connected</span>' : 
        '<span class="error">❌ Not Connected</span>';
    $content .= '</p>';
    $content .= '<p><strong>Database Tables:</strong> ';
    $content .= $tableExists ? 
        '<span class="success">✅ Set Up</span>' : 
        '<span class="error">❌ Not Set Up</span>';
    $content .= '</p>';
    $content .= '<p><strong>APCu Cache:</strong> <span class="success">✅ Enabled (v' . phpversion('apcu') . ')</span></p>';
    $content .= '</div>';
    
    if ($botConnected) {
        $webhookInfo = getWebhookInfo(BotConfig::TOKEN);
        $content .= '<div style="flex: 1;">';
        $content .= '<h3>Webhook Status</h3>';
        
        if (isset($webhookInfo['ok']) && $webhookInfo['ok']) {
            $result = $webhookInfo['result'];
            $content .= '<p><strong>URL:</strong> ' . htmlspecialchars($result['url'] ?? '') . '</p>';
            $content .= '<p><strong>Pending Updates:</strong> ' . ($result['pending_update_count'] ?? 0) . '</p>';
            
            if (isset($result['last_error_date']) && $result['last_error_date'] > 0) {
                $content .= '<p><strong>Last Error:</strong> <span class="error">' . 
                           date('Y-m-d H:i:s', $result['last_error_date']) . '</span></p>';
                if (isset($result['last_error_message'])) {
                    $content .= '<p><strong>Error Message:</strong> <span class="error">' . 
                               htmlspecialchars($result['last_error_message']) . '</span></p>';
                }
            } else {
                $content .= '<p><strong>Status:</strong> <span class="success">✅ No Errors</span></p>';
            }
            
            $content .= '<p><strong>Max Connections:</strong> ' . ($result['max_connections'] ?? 'N/A') . '</p>';
        }
        $content .= '</div>';
    }
    
    $content .= '</div>';
    $content .= '</div>';
    
    $content .= '<div style="display: flex; gap: 30px;">';
    
    $content .= '<div style="flex: 1;">';
    $content .= AdminTemplate::databaseManagementMenu();
    $content .= '</div>';
    
    $content .= '<div style="flex: 1;">';
    if ($tableExists) {
        $content .= AdminTemplate::form([
            'method' => 'get',
            'title' => 'Test Data Options',
            'fields' => [
                [
                    'type' => 'checkbox',
                    'name' => 'preserve',
                    'value' => '1',
                    'id' => 'preserve',
                    'checked' => true,
                    'label' => 'Preserve existing data (add to existing records)'
                ],
                [
                    'type' => 'number',
                    'name' => 'users',
                    'id' => 'users',
                    'value' => GeneratorService::DEFAULT_TEST_USERS,
                    'min' => '1',
                    'max' => '1000',
                    'label' => 'Number of users:',
                    'style' => 'width: 70px;'
                ]
            ],
            'submit' => 'Generate Test Data'
        ]);
    }
    $content .= '</div>';
    
    $content .= '</div>';
    
    $content .= AdminTemplate::adminToolsMenu();
    
    echo AdminTemplate::layout('Admin Dashboard', $content);
}

function displayAPCuDiagnostics(): void {
    $systemInfo = APCuService::getSystemInfo();
    $diagnostics = APCuService::getDiagnostics();
    $basicTests = APCuService::runBasicTests();
    $performanceTests = APCuService::runPerformanceTests();
    $memoryUsage = APCuService::getMemoryUsage();
    
    $content = '<h2>System Information</h2>';
    foreach ($systemInfo as $key => $value) {
        $content .= '<p><strong>' . ucfirst(str_replace('_', ' ', $key)) . ':</strong> ' . htmlspecialchars($value) . '</p>';
    }
    
    $content .= '<h2>Configuration</h2>';
    $content .= AdminTemplate::table(['Setting', 'Description', 'Value'], array_map(function($item) {
        return [$item['setting'], $item['description'], htmlspecialchars($item['value'])];
    }, $diagnostics));
    
    $content .= '<h2>Basic Tests</h2>';
    $content .= AdminTemplate::table(['Test', 'Result', 'Details'], array_map(function($test) {
        $result = $test['success'] ? 
            AdminTemplate::successMessage('Pass') : 
            AdminTemplate::errorMessage('Fail');
        return [$test['test'], $result, $test['details']];
    }, $basicTests));
    
    $content .= '<h2>Performance Tests</h2>';
    $content .= AdminTemplate::table(['Operation', 'Iterations', 'Total Time', 'Avg Time'], array_map(function($test) {
        return [
            $test['operation'], 
            $test['iterations'], 
            number_format($test['total_time'], 4) . ' sec',
            number_format($test['avg_time'], 4) . ' ms'
        ];
    }, $performanceTests));
    
    if (!isset($memoryUsage['error'])) {
        $content .= '<h2>Memory Usage</h2>';
        $memory = $memoryUsage['memory'];
        $cache = $memoryUsage['cache'];
        
        $memoryData = [
            ['Total Memory', $memory['formatted']['total']],
            ['Used Memory', $memory['formatted']['used'] . ' (' . number_format($memory['used_percentage'], 2) . '%)'],
            ['Available Memory', $memory['formatted']['available']],
            ['Cached Entries', $cache['num_entries']],
            ['Cache Hits', $cache['num_hits']],
            ['Cache Misses', $cache['num_misses']]
        ];
        
        if (isset($cache['hit_rate'])) {
            $memoryData[] = ['Hit Rate', number_format($cache['hit_rate'], 2) . '%'];
        }
        
        $content .= AdminTemplate::table(['Metric', 'Value'], $memoryData);
    } else {
        $content .= AdminTemplate::errorDiv($memoryUsage['error']);
    }
    
    $content .= AdminTemplate::backToDashboard();
    
    echo AdminTemplate::layout('APCu Diagnostics', $content);
}

function displayLogAnalysis(): void {
    if (isset($_POST['logfile'])) {
        $selectedFile = $_POST['logfile'];
        
        if (!AdminLogService::isValidLogFile($selectedFile)) {
            $content = AdminTemplate::errorDiv('Invalid file selection');
            $content .= AdminTemplate::backToDashboard();
        } else {
            $analysis = AdminLogService::analyzeLogFile($selectedFile);
            
            if (isset($analysis['error'])) {
                $content = AdminTemplate::errorDiv($analysis['error']);
            } else {
                $content = '<h2>Analysis Results for ' . htmlspecialchars($selectedFile) . '</h2>';
                $content .= '<p><strong>Total Errors:</strong> ' . number_format($analysis['totalErrors']) . '</p>';
                $content .= '<p><strong>Processing Time:</strong> ' . number_format($analysis['processingStats']['processingTime'], 2) . ' seconds</p>';
                
                if (!empty($analysis['patterns'])) {
                    $content .= '<h3>Identified Patterns</h3>';
                    foreach ($analysis['patterns'] as $pattern) {
                        $content .= '<p>' . htmlspecialchars($pattern['description']) . '</p>';
                    }
                }
                
                if (!empty($analysis['errorTypes'])) {
                    $content .= '<h3>Top Error Types</h3>';
                    $errorData = [];
                    foreach (array_slice($analysis['errorTypes'], 0, 10) as $type => $count) {
                        $percentage = ($count / $analysis['totalErrors']) * 100;
                        $errorData[] = [$type, number_format($count), number_format($percentage, 1) . '%'];
                    }
                    $content .= AdminTemplate::table(['Error Type', 'Count', 'Percentage'], $errorData);
                }
            }
            
            $content .= AdminTemplate::navigationLinks(['Analyze Another File' => '?page=logs', 'Return to Dashboard' => '?']);
        }
    } else {
        $availableFiles = AdminLogService::getAvailableFiles();
        
        if (empty($availableFiles)) {
            $content = AdminTemplate::errorMessage('No log files found.');
        } else {
            $content = '<form method="post">';
            $content .= '<h2>Select Log File</h2>';
            $content .= '<select name="logfile" required>';
            $content .= '<option value="">-- Select a log file --</option>';
            
            foreach ($availableFiles as $file) {
                $content .= '<option value="' . htmlspecialchars($file['name']) . '">';
                $content .= htmlspecialchars($file['name']) . ' (' . $file['formatted_size'] . ')';
                $content .= '</option>';
            }
            
            $content .= '</select>';
            $content .= '<button type="submit">Analyze Log</button>';
            $content .= '</form>';
        }
        
        $content .= AdminTemplate::backToDashboard();
    }
    
    echo AdminTemplate::layout('Log Analysis', $content);
}

function displayJSONValidation(): void {
    $results = JSONService::validateAllFiles();
    
    $content = '';
    foreach ($results as $filename => $result) {
        $content .= '<h2>' . htmlspecialchars($filename) . '</h2>';
        
        if (!$result['exists']) {
            $content .= AdminTemplate::errorMessage('File does not exist');
        } elseif (!$result['valid']) {
            $content .= AdminTemplate::errorMessage('Invalid JSON syntax');
        } else {
            $content .= AdminTemplate::successMessage('Valid JSON syntax');
            
            if ($result['structure_valid']) {
                $content .= AdminTemplate::successMessage('Valid structure - all required fields present');
            } else {
                $content .= AdminTemplate::errorMessage('Structure validation failed');
                if (!empty($result['structure_errors'])) {
                    $content .= '<ul>';
                    foreach ($result['structure_errors'] as $error) {
                        $content .= '<li>' . htmlspecialchars($error) . '</li>';
                    }
                    $content .= '</ul>';
                }
            }
        }
    }
    
    $content .= AdminTemplate::backToDashboard();
    
    echo AdminTemplate::layout('JSON Validation', $content);
}

function displayConfirmation(string $action): void {
    $actionTitle = ucfirst($action);
    $content = '<h2>Warning: ' . $actionTitle . '</h2>';
    
    $content .= match($action) {
        'flush' => '<p>This will delete ALL data from tables. This cannot be undone.</p>',
        'drop' => AdminTemplate::errorMessage('This will COMPLETELY DELETE all tables. This cannot be undone.'),
        'clearcache' => '<p>This will clear all APCu cache entries related to this bot.</p>',
        default => '<p>Are you sure you want to proceed?</p>'
    };
    
    if (in_array($action, ['flush', 'drop'])) {
        $content .= '<p>Booking system data will be ' . $action . 'ed.</p>';
        $content .= '<p><input type="checkbox" id="include_users" name="include_users" value="1" checked>';
        $content .= '<label for="include_users"> Also ' . $action . ' Users data (Telegram accounts and preferences)</label></p>';
        
        $content .= '<script>';
        $content .= 'document.addEventListener("DOMContentLoaded", function() {';
        $content .= '  const checkbox = document.getElementById("include_users");';
        $content .= '  const confirmLink = document.querySelector("a[href*=\'confirm=yes\']");';
        $content .= '  if (confirmLink) {';
        $content .= '    checkbox.addEventListener("change", function() {';
        $content .= '      const baseUrl = confirmLink.href.split("&include_users=")[0];';
        $content .= '      confirmLink.href = baseUrl + (this.checked ? "&include_users=1" : "");';
        $content .= '    });';
        $content .= '  }';
        $content .= '});';
        $content .= '</script>';
    }
    
    $includeUsers = in_array($action, ['flush', 'drop']) ? '&include_users=1' : '';
    $content .= '<p><a href="?action=' . $action . '&confirm=yes' . $includeUsers . '" style="color: red; font-weight: bold;">Confirm and Proceed</a></p>';
    $content .= AdminTemplate::navigationLinks(['Cancel' => '?']);
    
    echo AdminTemplate::layout('Confirmation Required', $content);
}

function handleSetup(string $action, Database $db): void {
    $testResponse = getMe(BotConfig::TOKEN);
    if (!isset($testResponse['ok']) || !$testResponse['ok']) {
        $content = AdminTemplate::errorDiv('Bot token error. Could not connect to bot.');
        $content .= AdminTemplate::backToDashboard();
        echo AdminTemplate::layout('Setup Failed', $content);
        return;
    }

    $response = setWebhook(BotConfig::TOKEN, BotConfig::WEBHOOK_URL, [
        'secret_token' => WebhookSecurity::SECRET_TOKEN
    ]);

    if (isset($response['ok']) && $response['ok']) {
        $content = AdminTemplate::successDiv('Webhook set successfully!');
        
        if ($action === 'setup') {
            createTables($db);
            clearAPCuCache();
            $content .= AdminTemplate::successDiv('Database tables created and cache cleared!');
        }
        
        $content .= AdminTemplate::successDiv('Setup completed successfully!');
    } else {
        $content = AdminTemplate::errorDiv('Failed to set webhook');
    }
    
    $content .= AdminTemplate::backToDashboard();
    echo AdminTemplate::layout('Setup Results', $content);
}

function handleFlush(Database $db): void {
    $includeUsers = isset($_GET['include_users']) && $_GET['include_users'] === '1';
    
    $db->rawQuery('SET FOREIGN_KEY_CHECKS = 0');
    
    $result = true;
    $result &= $db->rawQuery("TRUNCATE TABLE bookings");
    $result &= $db->rawQuery("TRUNCATE TABLE booking_items");
    $result &= $db->rawQuery("TRUNCATE TABLE payments");
    $result &= $db->rawQuery("TRUNCATE TABLE qr_validations");
    
    if ($includeUsers) {
        $result &= $db->rawQuery("TRUNCATE TABLE users");
    }
    
    $db->rawQuery('SET FOREIGN_KEY_CHECKS = 1');
    
    clearAPCuCache();
    
    $content = $result ? 
        AdminTemplate::successDiv('Tables flushed and cache cleared successfully!') : 
        AdminTemplate::errorDiv('Error flushing tables');
    
    if ($result) {
        $flushParam = $includeUsers ? '&include_users=1' : '';
        $content .= '<p><a href="?action=flush&confirm=yes' . $flushParam . '" style="color: red; font-weight: bold;">Flush Again</a></p>';
    }
    
    $content .= AdminTemplate::backToDashboard();
    echo AdminTemplate::layout('Flush Results', $content);
}

function handleDrop(Database $db): void {
    $includeUsers = isset($_GET['include_users']) && $_GET['include_users'] === '1';
    
    $db->rawQuery('SET FOREIGN_KEY_CHECKS = 0');
    
    $result = true;
    $result &= $db->rawQuery("DROP TABLE IF EXISTS qr_validations");
    $result &= $db->rawQuery("DROP TABLE IF EXISTS payments");
    $result &= $db->rawQuery("DROP TABLE IF EXISTS booking_items");
    $result &= $db->rawQuery("DROP TABLE IF EXISTS bookings");
    
    if ($includeUsers) {
        $result &= $db->rawQuery("DROP TABLE IF EXISTS users");
    }
    
    $db->rawQuery('SET FOREIGN_KEY_CHECKS = 1');
    
    clearAPCuCache();
    
    $content = $result ? 
        AdminTemplate::successDiv('Tables dropped and cache cleared successfully!') : 
        AdminTemplate::errorDiv('Error dropping tables');
    
    if ($result) {
        $dropParam = $includeUsers ? '&include_users=1' : '';
        $content .= '<p><a href="?action=drop&confirm=yes' . $dropParam . '" style="color: red; font-weight: bold;">Drop Tables Again</a></p>';
    }
    
    $content .= AdminTemplate::backToDashboard();
    echo AdminTemplate::layout('Drop Results', $content);
}

function handleClearCache(): void {
    $success = clearAPCuCache();
    
    $content = $success ? 
        AdminTemplate::successDiv('APCu cache cleared successfully!') : 
        AdminTemplate::errorDiv('Error clearing cache');
    
    if ($success) {
        $content .= '<p><a href="?action=clearcache&confirm=yes" style="color: red; font-weight: bold;">Clear Cache Again</a></p>';
    }
    
    $content .= AdminTemplate::backToDashboard();
    echo AdminTemplate::layout('Cache Clear Results', $content);
}

function createTables(Database $db): void {
    global $container;
    $venueTypes = $container->get('venue_type_service')->getVenueTypes();
    $venueTypeKeys = array_column($venueTypes, 'venuetypesid');
    
    $db->rawQuery("CREATE TABLE IF NOT EXISTS `users` (
        `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
        `telegram_id` bigint(20) unsigned NOT NULL,
        `username` varchar(255) DEFAULT NULL,
        `first_name` varchar(255) DEFAULT NULL,
        `last_name` varchar(255) DEFAULT NULL,
        `phone` varchar(20) DEFAULT NULL,
        `language` varchar(5) DEFAULT 'en',
        `cityid` smallint(5) unsigned NOT NULL DEFAULT '0',
        `venue_types` set('".implode("','", $venueTypeKeys)."') NOT NULL DEFAULT '',
        `channel_member` tinyint(1) DEFAULT 0,
        `venue_staff` smallint(5) unsigned DEFAULT NULL,
        `alerts` tinyint(1) DEFAULT 0,
        `onboarding` tinyint(3) unsigned DEFAULT 0,
        `status` enum('".Constants::USER_ACTIVE."', '".Constants::USER_BLOCKED."') DEFAULT '".Constants::USER_ACTIVE."',
        `is_bot` tinyint(1) DEFAULT 0,
        `created_at` timestamp NULL DEFAULT current_timestamp(),
        `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        PRIMARY KEY (`id`),
        UNIQUE KEY `telegram_id` (`telegram_id`),
        KEY `idx_users_master` (`language`,`status`,`alerts`,`channel_member`,`cityid`,`venue_types`),
        KEY `idx_username` (`username`),
        KEY `idx_venue_staff` (`venue_staff`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    
    $db->rawQuery("CREATE TABLE IF NOT EXISTS `bookings` (
        `booking_id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
        `user_id` int(10) unsigned NOT NULL,
        `event_id` int(10) unsigned NOT NULL,
        `guests` tinyint(3) unsigned NOT NULL DEFAULT 1,
        `comment` varchar(200) DEFAULT NULL,
        `status` enum('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
        `qr_hash` char(64) DEFAULT NULL,
        `created_at` timestamp NULL DEFAULT current_timestamp(),
        `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        PRIMARY KEY (`booking_id`),
        KEY `idx_booking_master` (`user_id`, `status`, `event_id`),
        KEY `idx_booking_qr` (`qr_hash`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    
    $db->rawQuery("CREATE TABLE IF NOT EXISTS `booking_items` (
        `booking_id` mediumint(8) unsigned NOT NULL,
        `brand_id` smallint(5) unsigned NOT NULL,
        `qty` tinyint(3) unsigned NOT NULL DEFAULT 1,
        `amount` decimal(8,2) NOT NULL,
        PRIMARY KEY (`booking_id`, `brand_id`),
        KEY `idx_booking_items_brand` (`brand_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    
    $db->rawQuery("CREATE TABLE IF NOT EXISTS `payments` (
        `payment_id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
        `booking_id` mediumint(8) unsigned NOT NULL,
        `amount` decimal(8,2) NOT NULL,
        `payment_method` enum('aba_qr', 'ipay88') NOT NULL,
        `gateway_ref` varchar(100) DEFAULT NULL,
        `status` enum('pending', 'completed', 'failed') DEFAULT 'pending',
        `gateway_response` json DEFAULT NULL,
        `processed_at` timestamp NULL DEFAULT NULL,
        PRIMARY KEY (`payment_id`),
        KEY `idx_payment_master` (`booking_id`, `status`),
        KEY `idx_payment_method` (`payment_method`, `status`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    
    $db->rawQuery("CREATE TABLE IF NOT EXISTS `qr_validations` (
        `validation_id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
        `booking_id` mediumint(8) unsigned NOT NULL,
        `validated_by` int(10) unsigned NOT NULL,
        `validated_at` timestamp NULL DEFAULT current_timestamp(),
        PRIMARY KEY (`validation_id`),
        KEY `idx_qr_validation` (`booking_id`, `validated_at`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
}

function clearAPCuCache(): bool {
    try {
        $cachePatterns = [
            Constants::NAMESPACE . ':',
            CacheKeys::DB_CACHE_PREFIX,
            CacheKeys::RATE_LIMIT_PREFIX,
            'callback:'
        ];
        
        foreach ($cachePatterns as $pattern) {
            $iterator = new APCUIterator('#^' . preg_quote($pattern) . '#', APC_ITER_KEY);
            foreach ($iterator as $item) {
                apcu_delete($item['key']);
            }
        }
        
        return true;
    } catch (\Exception $e) {
        return false;
    }
}