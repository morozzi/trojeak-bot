<?php
// api/events.php - Events content endpoint

require_once __DIR__ . '/../config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

try {
    $language = $_GET['lang'] ?? 'en';
    $cityId = (int)($_GET['city'] ?? 0);
    $featured = isset($_GET['featured']);
    
    if (!preg_match('/^[a-z]{2}$/', $language)) {
        $language = 'en';
    }
    
    $eventService = $container->get('event_service');
    $events = $eventService->getEvents($language, $cityId);
    
    if ($featured) {
        $events = array_filter($events, fn($event) => $event['eventfeatured'] == 1);
    }
    
    $eventsWithBooleans = array_map(function($event) {
    		$event['eventfeatured'] = (bool)$event['eventfeatured'];
    		return $event;
		}, $events);

		echo json_encode(array_values($eventsWithBooleans));
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Internal server error',
        'success' => false
    ]);
}