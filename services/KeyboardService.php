<?php
// services/KeyboardService.php - Keyboard service for bot UI

class KeyboardService {
    
    private const array KEYBOARD_OPTIONS = [
        'resize_keyboard' => true,
        'one_time_keyboard' => false
    ];
    
    public function __construct(
        private readonly LanguageService $languageService
    ) {}
    
    private function inlineKeyboard(array $buttons): array {
        return ['inline_keyboard' => [$buttons]];
    }
    
    public function buildMenuKeyboard(array $buttonLayout, string $language): array {
        $keyboard = [];
        
        foreach ($buttonLayout as $row) {
            $buttonRow = [];
            foreach ($row as $commandKey) {
                $buttonRow[] = ['text' => Messages::getButton($commandKey, $language)];
            }
            $keyboard[] = $buttonRow;
        }
        
        return array_merge([
            'keyboard' => $keyboard
        ], self::KEYBOARD_OPTIONS);
    }
    
    public function getChannelJoinPrompt(string $language): array {
        $channelUrl = 'https://t.me/' . ltrim(BotConfig::CHANNEL_ID, '@');
        
        return $this->inlineKeyboard([
            [
                'text' => Messages::get('channel.join_button', [], $language),
                'url' => $channelUrl
            ]
        ]);
    }
    
    public function getToggleButtons(string $preferenceType, mixed $currentValue, string $language): array {
        $isEnabled = (bool)$currentValue;
        
        if ($preferenceType === 'alerts') {
            if ($isEnabled) {
                $button = [
                    'text' => Messages::getButton('alerts_disable', $language),
                    'callback_data' => 'alerts_0'
                ];
            } else {
                $button = [
                    'text' => Messages::getButton('alerts_enable', $language),
                    'callback_data' => 'alerts_1'
                ];
            }
            
            return $this->inlineKeyboard([$button]);
        }
    }
    
    public function getSingleSelectButtons(array $options, mixed $currentValue, string $callbackPrefix, int $buttonsPerRow = 2): array {
        $buttons = [];
        
        foreach ($options as $key => $label) {
            $text = $label;
            if ($key === $currentValue) {
                $text .= ' ✅';
            }
            $buttons[] = [
                'text' => $text,
                'callback_data' => "{$callbackPrefix}_{$key}"
            ];
        }
        
        $rows = array_chunk($buttons, $buttonsPerRow);
        return ['inline_keyboard' => $rows];
    }
    
    public function getMultiSelectButtons(array $options, array $currentValues, string $callbackPrefix): array {
        $buttons = [];
        
        foreach ($options as $key => $label) {
            $text = $label;
            if (in_array($key, $currentValues)) {
                $text .= ' ✅';
            }
            $buttons[] = [
                'text' => $text,
                'callback_data' => "{$callbackPrefix}_{$key}"
            ];
        }
        
        return $this->inlineKeyboard($buttons);
    }
    
    public function getSimpleEventKeyboard(string $language, ?string $cityName = null): array {
        $buttonText = Messages::get('events.browse_all', [$cityName ?? ''], $language);
        
        return [
            'inline_keyboard' => [[
                ['text' => $buttonText, 'callback_data' => 'app_events']
            ]]
        ];
    }
}