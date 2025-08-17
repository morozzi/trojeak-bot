<?php
// config.php - Configuration file with PHP 8.3 typed constants

require_once __DIR__ . '/env.php';
Env::load();

define('_ENV_DB_HOST', Env::get('DB_HOST'));
define('_ENV_DB_USER', Env::get('DB_USER'));
define('_ENV_DB_PASS', Env::get('DB_PASS'));
define('_ENV_DB_NAME', Env::get('DB_NAME'));
define('_ENV_BOT_TOKEN', Env::get('BOT_TOKEN'));
define('_ENV_BOT_USERNAME', Env::get('BOT_USERNAME'));
define('_ENV_WEBHOOK_URL', Env::get('WEBHOOK_URL'));
define('_ENV_CHANNEL_ID', Env::get('CHANNEL_ID'));
define('_ENV_WEBHOOK_SECRET_TOKEN', Env::get('WEBHOOK_SECRET_TOKEN'));

ini_set('default_charset', 'utf-8');
ini_set('memory_limit', '768M');
ini_set('max_execution_time', '300');
ini_set('display_startup_errors', '0');
ini_set('display_errors', '0');
ini_set('html_errors', '1');
ini_set('log_errors', '1');
ini_set('ignore_repeated_errors', '0');
ini_set('ignore_repeated_source', '0');
ini_set('docref_root', '0');
ini_set('docref_ext', '0');
ini_set('error_log', __DIR__ . '/logs/php.log');
ini_set('error_reporting', E_ALL);
ini_set('log_errors_max_len', '0');

if (!ob_start("ob_gzhandler")) { ob_start(); }

mb_internal_encoding("UTF-8");
date_default_timezone_set("Asia/Phnom_Penh");

final class Constants {
    public const string NAMESPACE = 'trojeakbot';
    public const string JSON_VERSION = '1.2';
    
    public const string USER_ACTIVE = 'active';
    public const string USER_BLOCKED = 'blocked';
    
    public const int MAX_GUESTS = 10;
    public const int MAX_COMMENT_LENGTH = 200;
    public const int MAX_QTY_PER_BRAND = 10;
    public const string DEFAULT_CURRENCY = 'USD';
    public const string CURRENCY_SYMBOL = '$';
    public const int CURRENCY_PRECISION = 2;
}

final class APCuConfig {
    public const int SHORT_TTL = 70;
    public const int MEDIUM_TTL = 300;
    public const int CHANNEL_TTL = 120;
    public const int USER_TTL = 600;
    public const int LONG_TTL = 3600;
}

final class CacheKeys {
    public const string USER_PREFIX = Constants::NAMESPACE . ':user:';
    public const string CHANNEL_MEMBER_PREFIX = Constants::NAMESPACE . ':channel:';
    public const string CALLBACK_PREFIX = Constants::NAMESPACE . ':callback:';
    public const string RATE_LIMIT_PREFIX = Constants::NAMESPACE . ':rate:';
    public const string DB_CACHE_PREFIX = Constants::NAMESPACE . ':db:';
    public const string MESSAGES_KEY = Constants::NAMESPACE . ':messages:';
    public const string ERROR_MESSAGES_KEY = Constants::NAMESPACE . ':error_messages:';
    public const string GENERATOR_PREFIX = Constants::NAMESPACE . ':generator:';
    public const string RATE_BUCKET_PREFIX = Constants::NAMESPACE . ':ratebucket:';
    public const string PENDING_REQUEST_PREFIX = Constants::NAMESPACE . ':pending:';
    
    public static function user(int $telegramId): string {
        return self::USER_PREFIX . $telegramId;
    }
    
    public static function channelMember(int $telegramId): string {
        return self::CHANNEL_MEMBER_PREFIX . $telegramId;
    }
    
    public static function rateLimit(string $endpoint, string $type): string {
        return Constants::NAMESPACE . ':rate:' . $endpoint . ':' . $type;
    }
    
    public static function rateBucket(string $bucketType): string {
        return self::RATE_BUCKET_PREFIX . $bucketType;
    }
    
    public static function endpointDelay(string $endpoint): string {
        return Constants::NAMESPACE . ':endpoint_delay:' . $endpoint;
    }
}

final class SystemLimits {
    public const int MAX_MESSAGE_LENGTH = 4096;
    public const int CALLBACK_DEBOUNCE_SECONDS = 2;
    public const int MAX_SERVICE_DEPENDENCIES = 4;
    public const int MAX_LOG_LINES = 50000;
    public const int ADMIN_MEMORY_LIMIT_MB = 512;
    public const int ADMIN_EXECUTION_TIME = 300;
    public const int MAX_TEST_USERS = 1000;
    public const int MIN_TEST_USERS = 10;
    public const int EVENTS_DISPLAY_LIMIT = 3;
}

final class DatabaseConfig {
    public const string HOST = _ENV_DB_HOST;
    public const string USER = _ENV_DB_USER;
    public const string PASS = _ENV_DB_PASS;
    public const string NAME = _ENV_DB_NAME;
}

final class BotConfig {
    public const string TOKEN = _ENV_BOT_TOKEN;
    public const string USERNAME = _ENV_BOT_USERNAME;
    public const string WEBHOOK_URL = _ENV_WEBHOOK_URL;
    public const string CHANNEL_ID = _ENV_CHANNEL_ID;
}

final class TelegramApiConfig {
    public const string API_VERSION = '';
    
    public const int INDIVIDUAL_CHAT_PER_SEC = 1;
    public const int GROUP_CHAT_PER_MIN = 20;
    public const int BULK_BROADCAST_PER_SEC = 30;
    public const int GENERAL_API_PER_SEC = 30;
    
    public const int BASE_DELAY_MS = 300;
    public const int MAX_DELAY_MS = 30000;
    public const float JITTER_FACTOR = 0.15;
    public const float BACKOFF_MULTIPLIER = 1.5;
}

final class TelegramIPRanges {
    public const array ALLOWED_RANGES = [
        '149.154.160.0/20',
        '91.108.4.0/22',
    ];
}

final class WebhookSecurity {
    public const bool ENABLE_IP_VALIDATION = true;
    public const bool ENABLE_SECRET_TOKEN = true;
    public const bool IP_STRICT_MODE = false;
    public const int MAX_PAYLOAD_SIZE = 1048576;
    public const string SECRET_TOKEN = _ENV_WEBHOOK_SECRET_TOKEN;
}

final class LogPaths {
    public const string APP_LOG = __DIR__ . '/logs/bot.log';
    public const string TEXT_LOG = __DIR__ . '/logs/text.log';
    public const string ERROR_LOG = __DIR__ . '/logs/error.log';
}

require_once __DIR__ . '/services/ErrorServices.php';
require_once __DIR__ . '/services/ServiceContainer.php';
require_once __DIR__ . '/database.php';
require_once __DIR__ . '/services/CoreServices.php';
require_once __DIR__ . '/services/UserServices.php';
require_once __DIR__ . '/services/BusinessServices.php';
require_once __DIR__ . '/services/EventServices.php';
require_once __DIR__ . '/services/KeyboardService.php';
require_once __DIR__ . '/services/CommandService.php';
require_once __DIR__ . '/services/DiscoveryService.php';
require_once __DIR__ . '/messages.php';

$container = new ServiceContainer();

$container->singleton('error_log', fn() => new ErrorLogService());
$container->singleton('database', fn($c) => new Database($c->get('error_log')));
$container->singleton('language_service', fn($c) => new LanguageService($c->get('database')));
$container->singleton('log_service', fn($c) => new LogService($c->get('error_log')));
$container->singleton('user_service', fn($c) => new UserService($c->get('database'), $c->get('log_service'), $c->get('error_log'), $c->get('language_service')));
$container->singleton('venue_type_service', fn($c) => new VenueTypeService($c->get('database')));
$container->singleton('city_service', fn($c) => new CityService($c->get('database')));
$container->singleton('venue_service', fn($c) => new VenueService($c->get('database')));
$container->singleton('brand_service', fn($c) => new BrandService($c->get('database')));
$container->singleton('event_service', fn($c) => new EventService($c->get('database'), $c->get('brand_service')));
$container->singleton('keyboard_service', fn($c) => new KeyboardService($c->get('language_service')));
$container->singleton('command_service', fn($c) => new CommandService($c->get('language_service')));
$container->singleton('discovery_service', fn($c) => new DiscoveryService($c->get('event_service'), $c->get('city_service'), $c->get('venue_type_service'), $c->get('keyboard_service'), $c->get('user_service'), $c->get('language_service')));
$container->singleton('handler_dependencies', fn($c) => new HandlerDependencies(
    $c->get('user_service'),
    $c->get('log_service'), 
    $c->get('keyboard_service'),
    $c->get('command_service'),
    $c->get('error_log'),
    $c->get('language_service'),
    $c->get('venue_type_service'),
    $c->get('city_service'),
    $c->get('venue_service'),
    $c->get('brand_service'),
    $c->get('event_service'),
    $c->get('discovery_service')
));
$container->singleton('webhook_security', fn() => new WebhookSecurity());

Messages::initialize($container->get('error_log'), $container->get('language_service'));
Messages::load();