<?php
// services/DiscoveryService.php - Event discovery and onboarding flow management

class DiscoveryService {
    
    public function __construct(
        private readonly EventService $eventService,
        private readonly CityService $cityService,
        private readonly VenueTypeService $venueTypeService,
        private readonly KeyboardService $keyboardService,
        private readonly UserService $userService,
        private readonly LanguageService $languageService
    ) {}
    
    public function handleEventDiscovery(int $chatId, array $user, string $language): void {
        $cityId = isset($user['cityid']) && $user['cityid'] > 0 ? (int)$user['cityid'] : 0;
        $venueTypes = !empty($user['venue_types']) ? array_filter(explode(',', $user['venue_types'])) : [];
        
        if ($cityId === 0) {
            $this->showCityOnboarding($chatId, $user, $language);
        } else {
            $cityEventsRaw = $this->eventService->getEvents($language, $cityId);
            $cityEvents = [
                'events' => $this->eventService->formatEvents($cityEventsRaw),
                'totalCount' => count($cityEventsRaw)
            ];
            
            if (empty($cityEvents['events'])) {
                $this->handleNoCityEvents($chatId, $user, $language);
            } elseif (empty($venueTypes)) {
                $this->handleNoVenueTypes($chatId, $user, $language, $cityEvents);
            } else {
                $userEventsRaw = $this->eventService->getEvents($language, $cityId);
                $filteredEventsRaw = array_filter($userEventsRaw, fn($event) => in_array($event['venuetype'], $venueTypes));
                $userEvents = [
                    'events' => $this->eventService->formatEvents($filteredEventsRaw),
                    'totalCount' => count($filteredEventsRaw)
                ];
                
                if (empty($userEvents['events'])) {
                    $this->handleNoMatchingEvents($chatId, $user, $language, $cityEvents, $venueTypes);
                } else {
                    $this->sendEventList($chatId, $user, $language, $userEvents['events'], $cityEvents);
                }
            }
        }
        
        $eventsKeyboard = $this->keyboardService->buildMenuKeyboard(
            CommandService::BUTTON_GROUPS['events'], $language);
        sendMessage(BotConfig::TOKEN, $chatId, Messages::get('events.filter_prompt', [], $language), ['reply_markup' => json_encode($eventsKeyboard)]);
    }
    
    private function handleNoCityEvents(int $chatId, array $user, string $language): void {
        $cityName = $this->getCityName($user['cityid'], $language);
        $message = Messages::get('events.no_results', ['', $cityName], $language);
        $message = preg_replace('/\s+/', ' ', trim($message));
        
        sendMessage(BotConfig::TOKEN, $chatId, $message);
        
        if (!OnboardingTracker::hasShown($user['onboarding'] ?? 0, OnboardingTracker::ALERTS_SHOWN)) {
            $this->showAlertsOnboarding($chatId, $user, $language);
        }
    }
    
    private function handleNoVenueTypes(int $chatId, array $user, string $language, array $cityEvents): void {
        if (!OnboardingTracker::hasShown($user['onboarding'] ?? 0, OnboardingTracker::VENUE_TYPES_SHOWN)) {
            $this->showVenueTypeOnboarding($chatId, $user, $language);
        } else {
            $this->sendEventList($chatId, $user, $language, $cityEvents['events'], $cityEvents);
        }
    }
    
    private function handleNoMatchingEvents(int $chatId, array $user, string $language, array $cityEvents, array $venueTypes): void {
        $venueTypeNames = $this->venueTypeService->getActiveVenueTypes();
        $venueTypeLabels = array_intersect_key($venueTypeNames, array_flip($venueTypes));
        $venueTypeDisplay = implode(' & ', array_map('strip_tags', $venueTypeLabels));
        
        $cityName = $this->getCityName($user['cityid'], $language);
        $message = Messages::get('events.no_results', [$venueTypeDisplay, $cityName], $language);
        $message = preg_replace('/\s+/', ' ', trim($message));
        
        sendMessage(BotConfig::TOKEN, $chatId, $message);
        
        if (!OnboardingTracker::hasShown($user['onboarding'] ?? 0, OnboardingTracker::ALERTS_SHOWN)) {
            $this->showAlertsOnboarding($chatId, $user, $language, $venueTypeDisplay);
        } else {
            $fallbackMessage = Messages::get('events.fallback_other_events', [], $language);
            sendMessage(BotConfig::TOKEN, $chatId, $fallbackMessage);
            $this->sendEventList($chatId, $user, $language, $cityEvents['events'], $cityEvents);
        }
    }
    
    private function sendEventList(int $chatId, array $user, string $language, array $events, array $cityEvents): void {
        $messageOptions = ['parse_mode' => 'HTML'];
        $showKeyboard = $cityEvents['totalCount'] > SystemLimits::EVENTS_DISPLAY_LIMIT && 
                       OnboardingTracker::hasShown($user['onboarding'] ?? 0, OnboardingTracker::VENUE_TYPES_SHOWN);
        
        foreach ($events as $index => $eventData) {
            $currentOptions = $messageOptions;
            
            if ($showKeyboard && $index === count($events) - 1) {
                $cityName = $this->getCityName($user['cityid'], $language);
                $keyboard = $this->keyboardService->getBrowseAllKeyboard('events', $language, $cityName);
                if (!empty($keyboard)) {
                    $currentOptions['reply_markup'] = json_encode($keyboard);
                }
            }
            
            if ($eventData['hasImage']) {
                $currentOptions['caption'] = $eventData['caption'];
                $response = sendPhoto(BotConfig::TOKEN, $chatId, $eventData['imagePath'], $currentOptions);
                
                if (!isset($response['ok']) || !$response['ok']) {
                    sendMessage(BotConfig::TOKEN, $chatId, $eventData['caption'], $currentOptions);
                }
            } else {
                sendMessage(BotConfig::TOKEN, $chatId, $eventData['caption'], $currentOptions);
            }
        }
    }
    
    private function showCityOnboarding(int $chatId, array $user, string $language): void {
        $messageText = Messages::get('settings.city_menu', [], $language);
        $cityKeyboard = $this->keyboardService->getSingleSelectButtons(
            $this->cityService->getActiveCities($language),
            $user['cityid'],
            'city'
        );
        
        sendMessage(BotConfig::TOKEN, $chatId, $messageText, [
            'parse_mode' => 'HTML',
            'reply_markup' => json_encode($cityKeyboard)
        ]);
        
        $this->userService->markOnboardingShown($user['telegram_id'], OnboardingTracker::CITY_SHOWN);
    }
    
    private function showVenueTypeOnboarding(int $chatId, array $user, string $language): void {
        $messageText = Messages::get('settings.venue_types_menu', [], $language);
        $venueTypesKeyboard = $this->keyboardService->getMultiSelectButtons(
            $this->venueTypeService->getActiveVenueTypes(),
            explode(',', $user['venue_types']),
            'venue_types'
        );
        
        sendMessage(BotConfig::TOKEN, $chatId, $messageText, [
            'parse_mode' => 'HTML',
            'reply_markup' => json_encode($venueTypesKeyboard)
        ]);
        
        $this->userService->markOnboardingShown($user['telegram_id'], OnboardingTracker::VENUE_TYPES_SHOWN);
    }
    
    private function showAlertsOnboarding(int $chatId, array $user, string $language, ?string $venueTypeDisplay = null): void {
        $messageText = Messages::get('events.alerts_onboarding_prompt', [$venueTypeDisplay ?? ''], $language);
        $alertsKeyboard = $this->keyboardService->getToggleButtons('alerts', $user['alerts'], $language);
        
        sendMessage(BotConfig::TOKEN, $chatId, $messageText, [
            'parse_mode' => 'HTML',
            'reply_markup' => json_encode($alertsKeyboard)
        ]);
        
        $this->userService->markOnboardingShown($user['telegram_id'], OnboardingTracker::ALERTS_SHOWN);
    }
    
    private function getCityName(int $cityId, string $language): string {
        $cities = $this->cityService->getCities($language);
        $formattedCities = $this->cityService->formatCities($cities);
        return $formattedCities[$cityId] ?? 'Unknown City';
    }
}