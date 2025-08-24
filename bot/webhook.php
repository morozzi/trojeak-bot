<?php
// bot/webhook.php - Main webhook handler

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../telegram_api.php';
require_once __DIR__ . '/../services/SecurityServices.php';
require_once __DIR__ . '/../services/AuthMiddleware.php';
require_once __DIR__ . '/handlers/MessageHandler.php';
require_once __DIR__ . '/handlers/CallbackHandler.php';
require_once __DIR__ . '/handlers/MemberUpdateHandler.php';

$rawInput = file_get_contents('php://input');

if (!WebhookValidator::validateRequest($rawInput)) {
    $container->get('error_log')->log('core', 'webhook_validation_failed', ErrorContext::create(), ['Webhook security validation failed']);
    http_response_code(403);
    exit('Forbidden');
}

$update = json_decode($rawInput, true);

$errorHandlingMiddleware = new ErrorHandlingMiddleware($container->get('error_log'));

$errorHandlingMiddleware->withErrorLogging(
    function() use ($update, $container) {
        $handlerDependencies = $container->get('handler_dependencies');

        $messageHandler = new MessageHandler($handlerDependencies);
        $callbackHandler = new CallbackHandler($handlerDependencies);
        $memberUpdateHandler = new MemberUpdateHandler($handlerDependencies);
        $authMiddleware = new AuthMiddleware($handlerDependencies);

        match (true) {
            isset($update['message']) => 
                $authMiddleware->process($update, fn($update) => $messageHandler->handle($update['message'])),
                
            isset($update['callback_query']) => 
                $authMiddleware->process($update, fn($update) => $callbackHandler->handle($update['callback_query'])),
                
            isset($update['my_chat_member']) => 
                $memberUpdateHandler->handleChatMember($update['my_chat_member']),
                
            isset($update['chat_member']) => 
                $memberUpdateHandler->handleChannelMember($update['chat_member']),
                
            default => 
                $container->get('error_log')->log('core', 'general_error', ErrorContext::create(), 
                    ['Unhandled update type: ' . json_encode(array_keys($update))])
        };
    },
    'system',
    'exception',
    new ErrorContext(null, null, 'WEBHOOK_HANDLER'),
    []
);

http_response_code(200);