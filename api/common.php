<?php
// api/common.php - Foundation data endpoint

require_once __DIR__ . '/../config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

try {
    $language = $_GET['lang'] ?? 'en';
    
    if (!preg_match('/^[a-z]{2}$/', $language)) {
        $language = 'en';
    }
    
    $languageService = $container->get('language_service');
    $cityService = $container->get('city_service');
    
    $languages = $languageService->getLanguages();
    $cities = $cityService->getCities($language);
    
    $response = [
        'languages' => $languages,
        'cities' => $cities
    ];
    
    echo json_encode($response);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Internal server error',
        'success' => false
    ]);
}