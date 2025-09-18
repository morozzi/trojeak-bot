<?php
// api/brands.php - Brands data endpoint

require_once __DIR__ . '/../config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

try {
    $brandService = $container->get('brand_service');
    $brands = $brandService->getBrands();
    
    $brandsWithBooleans = array_map(function($brand) {
    		$brand['brandfeatured'] = (bool)$brand['brandfeatured'];
    		return $brand;
		}, $brands);

		echo json_encode($brandsWithBooleans);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Internal server error',
        'success' => false
    ]);
}