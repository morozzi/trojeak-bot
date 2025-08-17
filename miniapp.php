<?php
// miniapp.php - Serves the built Svelte Mini App

$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$parsedUri = parse_url($requestUri, PHP_URL_PATH);

// Remove query parameters and normalize path
$path = rtrim($parsedUri, '/');

// Handle _app assets (SvelteKit assets)
if (str_starts_with($path, '/_app/')) {
    $filePath = __DIR__ . '/miniapp/dist' . $path;
    
    if (file_exists($filePath)) {
        $extension = pathinfo($filePath, PATHINFO_EXTENSION);
        $mimeType = match($extension) {
            'css' => 'text/css',
            'js' => 'application/javascript',
            'png' => 'image/png',
            'jpg', 'jpeg' => 'image/jpeg',
            'gif' => 'image/gif',
            'svg' => 'image/svg+xml',
            'ico' => 'image/x-icon',
            'woff' => 'font/woff',
            'woff2' => 'font/woff2',
            default => 'application/octet-stream'
        };
        
        header('Content-Type: ' . $mimeType);
        header('Cache-Control: public, max-age=31536000');
        readfile($filePath);
        exit;
    }
}

// Handle other static assets
if (preg_match('/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/', $path)) {
    $filePath = __DIR__ . '/miniapp/dist' . $path;
    
    if (file_exists($filePath)) {
        $extension = pathinfo($filePath, PATHINFO_EXTENSION);
        $mimeType = match($extension) {
            'css' => 'text/css',
            'js' => 'application/javascript',
            'png' => 'image/png',
            'jpg', 'jpeg' => 'image/jpeg',
            'gif' => 'image/gif',
            'svg' => 'image/svg+xml',
            'ico' => 'image/x-icon',
            'woff' => 'font/woff',
            'woff2' => 'font/woff2',
            default => 'application/octet-stream'
        };
        
        header('Content-Type: ' . $mimeType);
        header('Cache-Control: public, max-age=31536000');
        readfile($filePath);
        exit;
    }
}

// Handle all other routes - serve main app
$indexPath = __DIR__ . '/miniapp/dist/index.html';

if (file_exists($indexPath)) {
    header('Content-Type: text/html; charset=utf-8');
    header('Cache-Control: no-cache, no-store, must-revalidate');
    readfile($indexPath);
} else {
    http_response_code(404);
    echo '<!DOCTYPE html><html><body><h1>Mini App Not Found</h1><p>Build files not uploaded.</p></body></html>';
}
?>