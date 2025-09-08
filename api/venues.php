<?php
// api/venues.php - Venues data endpoint

require_once __DIR__ . '/../config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

try {
    $language = $_GET['lang'] ?? 'en';
    $cityId = (int)($_GET['city'] ?? 0);
    
    if (!preg_match('/^[a-z]{2}$/', $language)) {
        $language = 'en';
    }
    
    $venueService = $container->get('venue_service');
    $venues = $venueService->getVenues($language, $cityId);
    
    echo json_encode($venues);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Internal server error',
        'success' => false
    ]);
}