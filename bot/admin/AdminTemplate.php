<?php
// admin/AdminTemplate.php - Pure HTML/CSS rendering methods

final class AdminTemplate {
    public static function layout(string $title, string $content): string {
        return sprintf(
            self::getDocumentStructure(),
            htmlspecialchars($title),
            self::getCSS(),
            htmlspecialchars($title),
            $content
        );
    }
    
    public static function table(array $headers, array $rows): string {
        $html = '<table>';
        
        if (!empty($headers)) {
            $html .= '<tr>';
            foreach ($headers as $header) {
                $html .= '<th>' . htmlspecialchars($header) . '</th>';
            }
            $html .= '</tr>';
        }
        
        foreach ($rows as $row) {
            $html .= '<tr>';
            foreach ($row as $cell) {
                $html .= '<td>' . $cell . '</td>';
            }
            $html .= '</tr>';
        }
        
        $html .= '</table>';
        return $html;
    }
    
    public static function statusPanel(array $items): string {
        $html = '<div class="section"><h3 style="margin-top: 0;">System Status</h3>';
        
        foreach ($items as $label => $status) {
            $html .= '<p><strong>' . htmlspecialchars($label) . ':</strong> ' . $status . '</p>';
        }
        
        $html .= '</div>';
        return $html;
    }
    
    public static function form(array $config): string {
        $html = '<form method="' . ($config['method'] ?? 'post') . '"';
        if (isset($config['action'])) {
            $html .= ' action="' . htmlspecialchars($config['action']) . '"';
        }
        $html .= ' class="section">';
        
        if (isset($config['title'])) {
            $html .= '<h2>' . htmlspecialchars($config['title']) . '</h2>';
        }
        
        foreach ($config['fields'] ?? [] as $field) {
            $html .= self::renderFormField($field);
        }
        
        if (isset($config['submit'])) {
            $html .= '<p><button type="submit" style="background-color: #4CAF50; color: white; padding: 8px 15px; border: none; border-radius: 4px; cursor: pointer;">';
            $html .= htmlspecialchars($config['submit']);
            $html .= '</button></p>';
        }
        
        $html .= '</form>';
        return $html;
    }
    
    public static function successMessage(string $message): string {
        return '<p style="color: green;">' . htmlspecialchars($message) . '</p>';
    }
    
    public static function errorMessage(string $message): string {
        return '<p style="color: red;">' . htmlspecialchars($message) . '</p>';
    }
    
    public static function infoMessage(string $message): string {
        return '<p style="color: blue;">' . htmlspecialchars($message) . '</p>';
    }
    
    public static function warningMessage(string $message): string {
        return '<p style="color: orange; font-weight: bold;">' . htmlspecialchars($message) . '</p>';
    }
    
    public static function successDiv(string $message): string {
        return '<div class="success">✅ ' . htmlspecialchars($message) . '</div>';
    }
    
    public static function errorDiv(string $message): string {
        return '<div class="error">' . htmlspecialchars($message) . '</div>';
    }
    
    public static function infoDiv(string $message): string {
        return '<div class="info">' . htmlspecialchars($message) . '</div>';
    }
    
    public static function warningDiv(string $message): string {
        return '<div class="warning">' . htmlspecialchars($message) . '</div>';
    }
    
    public static function navigationLinks(array $links): string {
        $html = '<div class="nav">';
        foreach ($links as $text => $url) {
            $html .= '<a href="' . htmlspecialchars($url) . '">' . htmlspecialchars($text) . '</a>';
            if (count($links) > 1) $html .= ' | ';
        }
        $html .= '</div>';
        return $html;
    }
    
    public static function adminToolsMenu(): string {
        $html = '<h2>Admin Tools</h2>';
        $html .= '<ul>';
        $html .= '<li><a href="?page=apcu">APCu Diagnostics</a> - Cache performance and memory analysis</li>';
        $html .= '<li><a href="?page=logs">Log Analysis</a> - Analyze error logs and patterns</li>';
        $html .= '<li><a href="?page=json">JSON Validation</a> - Validate bot configuration files</li>';
        $html .= '</ul>';
        return $html;
    }
    
    public static function databaseManagementMenu(): string {
        $html = '<h2>Database Management</h2>';
        $html .= '<ul>';
        $html .= '<li><a href="?action=setup" style="color: green; font-weight: bold;">Setup Database</a> - Create tables and set webhook</li>';
        $html .= '<li><a href="?action=webhook" style="color: blue; font-weight: bold;">Set Webhook Only</a> - Connect Telegram without database changes</li>';
        $html .= '<li><a href="?action=channel_message" style="color: purple; font-weight: bold;">Send Channel Message</a> - Send pinned message with Web App button</li>';
        $html .= '<li><a href="?action=flush" style="color: orange; font-weight: bold;">Flush Tables</a> - Empty all data but keep structure</li>';
        $html .= '<li><a href="?action=drop" style="color: red; font-weight: bold;">Drop Tables</a> - Delete all tables</li>';
        $html .= '<li><a href="?action=clearcache" style="color: blue; font-weight: bold;">Clear Cache</a> - Clear APCu cache</li>';
        $html .= '</ul>';
        return $html;
    }
    
    public static function backToDashboard(): string {
        return self::navigationLinks(['Return to Dashboard' => '?']);
    }
    
    private static function renderFormField(array $field): string {
        $type = $field['type'] ?? 'text';
        $html = '<div style="margin-bottom: 10px;">';
        
        if (isset($field['label'])) {
            $html .= '<label';
            if (isset($field['id'])) {
                $html .= ' for="' . htmlspecialchars($field['id']) . '"';
            }
            $html .= '>' . htmlspecialchars($field['label']) . '</label> ';
        }
        
        switch ($type) {
            case 'checkbox':
                $html .= '<input type="checkbox"';
                if (isset($field['name'])) $html .= ' name="' . htmlspecialchars($field['name']) . '"';
                if (isset($field['value'])) $html .= ' value="' . htmlspecialchars($field['value']) . '"';
                if (isset($field['id'])) $html .= ' id="' . htmlspecialchars($field['id']) . '"';
                if ($field['checked'] ?? false) $html .= ' checked';
                $html .= '>';
                break;
                
            case 'number':
                $html .= '<input type="number"';
                if (isset($field['name'])) $html .= ' name="' . htmlspecialchars($field['name']) . '"';
                if (isset($field['id'])) $html .= ' id="' . htmlspecialchars($field['id']) . '"';
                if (isset($field['value'])) $html .= ' value="' . htmlspecialchars($field['value']) . '"';
                if (isset($field['min'])) $html .= ' min="' . htmlspecialchars($field['min']) . '"';
                if (isset($field['max'])) $html .= ' max="' . htmlspecialchars($field['max']) . '"';
                if (isset($field['style'])) $html .= ' style="' . htmlspecialchars($field['style']) . '"';
                $html .= '>';
                break;
                
            default:
                $html .= '<input type="text"';
                if (isset($field['name'])) $html .= ' name="' . htmlspecialchars($field['name']) . '"';
                if (isset($field['id'])) $html .= ' id="' . htmlspecialchars($field['id']) . '"';
                if (isset($field['value'])) $html .= ' value="' . htmlspecialchars($field['value']) . '"';
                $html .= '>';
        }
        
        $html .= '</div>';
        return $html;
    }
    
    private static function getDocumentStructure(): string {
        return '<!DOCTYPE html>
<html>
<head>
    <title>%s</title>
    %s
</head>
<body>
    <h1>%s</h1>
    %s
</body>
</html>';
    }
    
    public static function getCSS(): string {
        return '<style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            line-height: 1.6; 
        }
        h1, h2, h3 { 
            color: #333; 
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 20px; 
        }
        table, th, td { 
            border: 1px solid #ddd; 
        }
        th, td { 
            padding: 8px; 
            text-align: left; 
        }
        th { 
            background-color: #f2f2f2; 
        }
        tr:hover { 
            background-color: #f5f5f5; 
        }
        .nav { 
            margin-top: 20px; 
            padding-top: 10px; 
            border-top: 1px solid #ddd; 
        }
        .section { 
            margin-bottom: 20px; 
            padding: 10px; 
            border: 1px solid #ddd; 
            background-color: #f9f9f9; 
        }
        a { 
            color: #0066cc; 
            text-decoration: none; 
        }
        a:hover { 
            text-decoration: underline; 
        }
        .success { 
            color: green; 
            font-weight: bold; 
        }
        .error { 
            color: red; 
        }
        .warning { 
            color: orange; 
            font-weight: bold; 
        }
        .info { 
            color: blue; 
        }
    </style>';
    }
}