<?php
// services/BusinessServices.php - Core business domain services

class VenueTypeService {
    
    public function __construct(
        private readonly Database $db
    ) {}
    
    public function getActiveVenueTypes(): array {
        $success = false;
        $venueTypes = apcu_fetch(Constants::NAMESPACE . ':venue_types:active', $success);
        
        if ($success) {
            return $venueTypes;
        }
        
        $rows = $this->db->selectRows(
            'venuetype',
            ['venuetypevisible' => 1],
            ['venuetypesid', 'venuetypename', 'venuetypeicon', 'venuetypesort'],
            null,
            'venuetypesort',
            'ASC'
        );
        
        $venueTypes = [];
        foreach ($rows as $row) {
            $venueTypes[$row['venuetypesid']] = "{$row['venuetypeicon']} {$row['venuetypename']}";
        }
        
        apcu_store(Constants::NAMESPACE . ':venue_types:active', $venueTypes, APCuConfig::LONG_TTL);
        return $venueTypes;
    }
    
    public function clearCache(): void {
        apcu_delete(Constants::NAMESPACE . ':venue_types:active');
    }
}

class CityService {
    
    public function __construct(
        private readonly Database $db
    ) {}
    
    public function getActiveCities(string $language): array {
        $success = false;
        $cacheKey = Constants::NAMESPACE . ':cities:active:' . $language;
        $cities = apcu_fetch($cacheKey, $success);
        
        if ($success) {
            return $cities;
        }
        
        $rows = $this->db->selectRows(
            'city c JOIN citylang cl ON c.cityid = cl.cityid',
            ['c.cityvisible' => 1, 'cl.languagesid' => $language],
            ['c.cityid', 'cl.cityname'],
            null,
            'c.citysort',
            'ASC'
        );
        
        $cities = [];
        foreach ($rows as $row) {
            $cities[$row['cityid']] = $row['cityname'];
        }
        
        apcu_store($cacheKey, $cities, APCuConfig::LONG_TTL);
        return $cities;
    }
    
    public function clearCache(): void {
        $pattern = '/^' . preg_quote(Constants::NAMESPACE . ':cities:active:') . '/';
        $iterator = new APCUIterator($pattern);
        foreach ($iterator as $item) {
            apcu_delete($item['key']);
        }
    }
}

class VenueService {
    
    public function __construct(
        private readonly Database $db
    ) {}
    
    public function getActiveVenues(string $language, int $userCityId = 0, array $userVenueTypes = []): array {
        $conditions = ['v.venuevisible' => 1, 'vl.languagesid' => $language, 'cl.languagesid' => $language];
        
        if ($userCityId > 0) {
            $conditions['v.cityid'] = $userCityId;
        }
        
        if (!empty($userVenueTypes)) {
            $conditions['v.venuetype'] = ['IN', $userVenueTypes];
        }
        
        $rows = $this->db->selectRows(
            'venue v JOIN venuelang vl ON v.venueid = vl.venueid JOIN citylang cl ON v.cityid = cl.cityid JOIN venuetype vt ON v.venuetype = vt.venuetypesid',
            $conditions,
            ['v.venueid', 'vl.venuename', 'v.venuepic', 'v.venuelink', 'v.venuefeatured', 'cl.cityname', 'vt.venuetypeicon', 'vt.venuetypename', 'v.cityid', 'v.venuetype'],
            null,
            'v.venuefeatured DESC, v.venuesort',
            'ASC'
        );
        
        $formattedVenues = [];
        foreach ($rows as $venue) {
            $imageDisplay = '';
            if (!empty($venue['venuepic']) && file_exists(__DIR__ . '/../pic/venue/' . $venue['venuepic'])) {
                $imageDisplay = '[Image] ';
            }
            
            $featuredDisplay = $venue['venuefeatured'] ? ' ⭐' : '';
            $formattedVenues[] = "🏢 {$imageDisplay}{$venue['venuename']}{$featuredDisplay}\n📍 {$venue['cityname']} • {$venue['venuetypeicon']} {$venue['venuetypename']}\n🔗 Google Maps";
        }
        
        return $formattedVenues;
    }
    
    public function clearCache(): void {
        $pattern = '/^' . preg_quote(Constants::NAMESPACE . ':venues:active:') . '/';
        $iterator = new APCUIterator($pattern);
        foreach ($iterator as $item) {
            apcu_delete($item['key']);
        }
    }
}

class BrandService {
    
    public function __construct(
        private readonly Database $db
    ) {}
    
    public function getActiveBrands(): array {
        $rows = $this->db->selectRows(
            'brand',
            ['brandvisible' => 1],
            ['brandid', 'brandname', 'brandpic', 'brandfeatured'],
            null,
            'brandfeatured DESC, brandsort',
            'ASC'
        );
        
        $formattedBrands = [];
        foreach ($rows as $brand) {
            $featuredDisplay = $brand['brandfeatured'] ? ' ⭐' : '';
            $formattedBrands[$brand['brandid']] = "{$brand['brandname']}{$featuredDisplay}";
        }
        
        return $formattedBrands;
    }
    
    public function clearCache(): void {
        apcu_delete(Constants::NAMESPACE . ':brands:active');
    }
}