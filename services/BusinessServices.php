<?php
// services/BusinessServices.php - Core business domain services

class VenueTypeService {
    
    public function __construct(
        private readonly Database $db
    ) {}
    
    public function getVenueTypes(): array {
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
        
        apcu_store(Constants::NAMESPACE . ':venue_types:active', $rows, APCuConfig::LONG_TTL);
        return $rows;
    }
    
    public function formatVenueTypes(array $venueTypes): array {
        $formattedVenueTypes = [];
        foreach ($venueTypes as $venueType) {
            $formattedVenueTypes[$venueType['venuetypesid']] = "{$venueType['venuetypeicon']} {$venueType['venuetypename']}";
        }
        
        return $formattedVenueTypes;
    }
    
    public function clearCache(): void {
        apcu_delete(Constants::NAMESPACE . ':venue_types:active');
    }
}

class CityService {
    
    public function __construct(
        private readonly Database $db
    ) {}
    
    public function getCities(string $language): array {
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
        
        apcu_store($cacheKey, $rows, APCuConfig::LONG_TTL);
        return $rows;
    }
    
    public function formatCities(array $cities): array {
        $formattedCities = [];
        foreach ($cities as $city) {
            $formattedCities[$city['cityid']] = $city['cityname'];
        }
        
        return $formattedCities;
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
    
    public function getVenues(string $language, int $cityId = 0): array {
        $conditions = ['v.venuevisible' => 1, 'vl.languagesid' => $language, 'cl.languagesid' => $language];
        
        if ($cityId > 0) {
            $conditions['v.cityid'] = $cityId;
        }
        
        return $this->db->selectRows(
            'venue v JOIN venuelang vl ON v.venueid = vl.venueid JOIN citylang cl ON v.cityid = cl.cityid JOIN venuetype vt ON v.venuetype = vt.venuetypesid',
            $conditions,
            ['v.venueid', 'vl.venuename', 'v.venuepic1', 'v.venuepic2', 'v.venuelocation', 'v.venuelink', 'v.venuefeatured', 'cl.cityname', 'vt.venuetypeicon', 'vt.venuetypename', 'v.cityid', 'v.venuetype'],
            null,
            'v.venuefeatured DESC, v.venuesort',
            'ASC'
        );
    }
    
    public function formatVenues(array $venues): array {
        $formattedVenues = [];
        foreach ($venues as $venue) {
            $imageDisplay = '';
            if (!empty($venue['venuepic1']) && file_exists(__DIR__ . '/../pic/venue/' . $venue['venuepic1'])) {
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
    
    public function getBrands(): array {
        return $this->db->selectRows(
            'brand',
            ['brandvisible' => 1],
            ['brandid', 'brandname', 'brandpic1', 'brandpic2', 'brandfeatured'],
            null,
            'brandfeatured DESC, brandsort',
            'ASC'
        );
    }
    
    public function formatBrands(array $brands): array {
        $formattedBrands = [];
        foreach ($brands as $brand) {
            $featuredDisplay = $brand['brandfeatured'] ? ' ⭐' : '';
            $formattedBrands[$brand['brandid']] = "{$brand['brandname']}{$featuredDisplay}";
        }
        
        return $formattedBrands;
    }
    
    public function clearCache(): void {
        apcu_delete(Constants::NAMESPACE . ':brands:active');
    }
}