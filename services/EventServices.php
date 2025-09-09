<?php
// services/EventServices.php - Event discovery and filtering services

class EventService {
    
    public function __construct(
        private readonly Database $db,
        private readonly BrandService $brandService
    ) {}
    
    public function getSmartEventList(array $user, string $language): array {
        $cityId = isset($user['cityid']) && $user['cityid'] > 0 ? (int)$user['cityid'] : 0;
        $venueTypes = !empty($user['venue_types']) ? array_filter(explode(',', $user['venue_types'])) : [];
        
        $events = $this->getEvents($language, $cityId);
        
        if (!empty($venueTypes)) {
            $events = array_filter($events, fn($event) => in_array($event['venuetype'], $venueTypes));
        }
        
        $formattedEvents = $this->formatEvents($events);
        
        return [
            'events' => $formattedEvents,
            'totalCount' => count($events),
            'totalQueried' => count($events)
        ];
    }
    
    public function getEvents(string $language, int $cityId = 0): array {
        $conditions = $this->buildConditions($language, $cityId);
        
        return $this->db->selectRows(
            'event e JOIN eventlang el ON e.eventid = el.eventid JOIN venue v ON e.venueid = v.venueid JOIN venuelang vl ON v.venueid = vl.venueid JOIN citylang cl ON v.cityid = cl.cityid',
            $conditions,
            ['e.eventid', 'e.brandid', 'e.eventpic', 'e.eventschema', 'e.eventschemaprice', 'e.venueid', 'e.eventdate', 'e.eventfeatured', 'el.eventtitle', 'el.eventartist', 'vl.venuename', 'cl.cityname', 'v.venuetype'],
            SystemLimits::EVENTS_DISPLAY_LIMIT,
            'e.eventfeatured DESC, e.eventdate',
            'ASC'
        );
    }
    
    public function formatEvents(array $events): array {
        $formattedEvents = [];
        foreach ($events as $event) {
            $eventCard = $this->formatEventCard($event);
            if ($eventCard) {
                $formattedEvents[] = $eventCard;
            }
        }
        
        return $formattedEvents;
    }
    
    private function formatEventCard(array $event): ?array {
        $brandIds = $this->parseBrandIds($event['brandid']);
        $visibleBrandNames = $this->getBrandNames($brandIds);
        
        if (empty($visibleBrandNames)) {
            return null;
        }
        
        $eventDate = date('F j, Y', strtotime($event['eventdate']));
        $brandDisplay = implode(' & ', $visibleBrandNames);
        $artistDisplay = !empty($event['eventartist']) ? ' • 👨‍🎤 ' . $event['eventartist'] : '';
        $featuredDisplay = $event['eventfeatured'] ? ' ⭐' : '';
        $schemaDisplay = !empty($event['eventschema']) ? ' • 💰 ' . $event['eventschema'] : '';
        
        $caption = "{$event['eventtitle']}{$featuredDisplay}{$artistDisplay}\n";
        $caption .= "📅 {$eventDate}\n";
        $caption .= "📍 {$event['venuename']}, {$event['cityname']}\n";
        $caption .= "🍺 {$brandDisplay}{$schemaDisplay}";
        
        $hasImage = false;
        $imagePath = null;
        
        if (!empty($event['eventpic'])) {
            $imagePath = __DIR__ . '/../pic/event/' . $event['eventpic'];
            $hasImage = file_exists($imagePath);
        }
        
        return [
            'hasImage' => $hasImage,
            'imagePath' => $imagePath,
            'caption' => $caption
        ];
    }
    
    private function buildConditions(string $language, int $cityId): array {
        $conditions = [
            'e.eventvisible' => 1,
            'v.venuevisible' => 1,
            'el.languagesid' => $language,
            'vl.languagesid' => $language,
            'cl.languagesid' => $language,
            'e.eventdate' => ['>=', date('Y-m-d H:i:s')]
        ];
        
        if ($cityId > 0) {
            $conditions['v.cityid'] = $cityId;
        }
        
        return $conditions;
    }
    
    private function getBrandNames(array $brandIds): array {
        if (empty($brandIds)) {
            return [];
        }
        
        $brands = $this->brandService->getBrands();
        $formattedBrands = $this->brandService->formatBrands($brands);
        $visibleBrandNames = [];
        
        foreach ($brandIds as $brandId) {
            if (isset($formattedBrands[$brandId])) {
                $visibleBrandNames[] = strip_tags($formattedBrands[$brandId]);
            }
        }
        
        return $visibleBrandNames;
    }
    
    private function parseBrandIds(string $brandIds): array {
        if (empty($brandIds)) {
            return [];
        }
        
        if (preg_match_all('/\^(\d+)\^/', $brandIds, $matches)) {
            return $matches[1];
        }
        
        if (is_numeric($brandIds)) {
            return [$brandIds];
        }
        
        return [];
    }
}