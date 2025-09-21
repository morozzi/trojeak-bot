<?php
// api/user.php - User account management

require_once __DIR__ . '/../config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    $method = $_SERVER['REQUEST_METHOD'];
    
    if (!in_array($method, ['GET', 'PUT'])) {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed', 'success' => false]);
        exit;
    }
    
    $initData = $_GET['_auth'] ?? $_POST['_auth'] ?? '';
    if (empty($initData)) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required', 'success' => false]);
        exit;
    }
    
    $telegramId = validateTelegramWebAppData($initData);
    if (!$telegramId) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid authentication', 'success' => false]);
        exit;
    }
    
    $userService = $container->get('user_service');
    $database = $container->get('database');
    
    $user = $userService->getUserByTelegramId($telegramId);
    if (!$user) {
        http_response_code(404);
        echo json_encode(['error' => 'User not found', 'success' => false]);
        exit;
    }
    
    if ($method === 'GET') {
        handleGetRequest($user);
    } elseif ($method === 'PUT') {
        handlePutRequest($user, $database);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error', 'success' => false]);
}

function validateTelegramWebAppData(string $initData): ?int {
    parse_str($initData, $data);
    $userJson = $data['user'] ?? '';
    
    if (empty($userJson)) {
        return null;
    }
    
    $userData = json_decode($userJson, true);
    return $userData['id'] ?? null;
}

function handleGetRequest(array $user): void {
    $venueTypes = !empty($user['venue_types']) ? explode(',', $user['venue_types']) : [];
    
    $response = [
        'success' => true,
        'user' => [
            'telegram_id' => (int)$user['telegram_id'],
            'username' => $user['username'],
            'first_name' => $user['first_name'],
            'last_name' => $user['last_name'],
            'phone' => $user['phone'],
            'language' => $user['language'],
            'cityid' => (int)$user['cityid'],
            'venue_types' => $venueTypes,
            'alerts' => (bool)$user['alerts'],
            'onboarding' => (int)$user['onboarding'],
            'venue_staff' => $user['venue_staff'] ? (int)$user['venue_staff'] : null,
            'channel_member' => (bool)$user['channel_member'],
            'status' => $user['status'],
            'created_at' => $user['created_at'],
            'updated_at' => $user['updated_at']
        ],
        'constants' => [
            'PHONE_REGEX' => Constants::PHONE_REGEX,
            'MAX_GUESTS' => Constants::MAX_GUESTS,
            'MAX_COMMENT_LENGTH' => Constants::MAX_COMMENT_LENGTH,
            'MAX_QTY_PER_BRAND' => Constants::MAX_QTY_PER_BRAND,
            'DEFAULT_CURRENCY' => Constants::DEFAULT_CURRENCY,
            'CURRENCY_SYMBOL' => Constants::CURRENCY_SYMBOL,
            'CURRENCY_PRECISION' => Constants::CURRENCY_PRECISION,
            'WEBAPP_DOMAIN' => BotConfig::WEBAPP_DOMAIN
        ]
    ];
    
    echo json_encode($response);
}

function handlePutRequest(array $user, Database $database): void {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON', 'success' => false]);
        return;
    }
    
    $validatedData = [];
    $errors = [];
    
    if (isset($input['phone'])) {
        if (validatePhone($input['phone'])) {
            $validatedData[UserTable::PHONE] = $input['phone'];
        } else {
            $errors[] = 'Invalid phone format';
        }
    }
    
    if (isset($input['language'])) {
        if (validateLanguage($input['language'], $database)) {
            $validatedData[UserTable::LANGUAGE] = $input['language'];
        } else {
            $errors[] = 'Invalid language';
        }
    }
    
    if (isset($input['cityid'])) {
        if (validateCity($input['cityid'], $database)) {
            $validatedData[UserTable::CITYID] = (int)$input['cityid'];
        } else {
            $errors[] = 'Invalid city';
        }
    }
    
    if (isset($input['venue_types'])) {
        if (validateVenueTypes($input['venue_types'])) {
            $validatedData[UserTable::VENUE_TYPES] = implode(',', $input['venue_types']);
        } else {
            $errors[] = 'Invalid venue types';
        }
    }
    
    if (isset($input['alerts'])) {
        $validatedData[UserTable::ALERTS] = (bool)$input['alerts'] ? 1 : 0;
    }
    
    if (isset($input['onboarding'])) {
        if (validateOnboarding($input['onboarding'])) {
            $validatedData[UserTable::ONBOARDING] = (int)$input['onboarding'];
        } else {
            $errors[] = 'Invalid onboarding value';
        }
    }
    
    if (!empty($errors)) {
        http_response_code(400);
        echo json_encode(['error' => implode(', ', $errors), 'success' => false]);
        return;
    }
    
    if (empty($validatedData)) {
        http_response_code(400);
        echo json_encode(['error' => 'No valid fields to update', 'success' => false]);
        return;
    }
    
    $result = $database->update(UserTable::NAME, $validatedData, ['telegram_id' => $user['telegram_id']]);
    
    if ($result->success) {
        echo json_encode(['success' => true, 'message' => 'Profile updated successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Update failed', 'success' => false]);
    }
}

function validatePhone(string $phone): bool {
    return preg_match(Constants::PHONE_REGEX, $phone);
}

function validateLanguage(string $language, Database $database): bool {
    $result = $database->selectRow('language', ['languagesid' => $language], ['languagesid']);
    return $result !== null;
}

function validateCity(int $cityid, Database $database): bool {
    $result = $database->selectRow('city', ['cityid' => $cityid], ['cityid']);
    return $result !== null;
}

function validateVenueTypes(mixed $venueTypes): string|false {
    $validTypes = ['bar', 'club', 'ktv'];
    
    if (is_string($venueTypes)) {
        $types = array_filter(array_map('trim', explode(',', $venueTypes)));
    } elseif (is_array($venueTypes)) {
        $types = $venueTypes;
    } else {
        return false;
    }
    
    if (empty($types)) {
        return false;
    }
    
    foreach ($types as $type) {
        if (!in_array($type, $validTypes)) {
            return false;
        }
    }
    
    return implode(',', $types);
}

function validateOnboarding(int $onboarding): bool {
    return $onboarding >= 0 && $onboarding <= 7 && is_int($onboarding);
}