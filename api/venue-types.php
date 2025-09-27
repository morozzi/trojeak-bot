<?php
// api/venue-types.php - Venue types data endpoint

require_once __DIR__ . '/../config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

try {
    $venueTypeService = $container->get('venue_type_service');
    $venueTypes = $venueTypeService->getVenueTypes();
    
    echo json_encode($venueTypes);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Internal server error',
        'success' => false
    ]);
}