<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import BookingWizard from '$lib/components/BookingWizard.svelte';

	interface Event {
		id: string;
		title: string;
		venue_id: string;
		venue_name: string;
		city: string;
		featured: boolean;
		brands: string[];
		price_range: string;
		date: string;
		description: string;
	}

	interface Venue {
		id: string;
		name: string;
		type: 'bar' | 'ktv' | 'club';
		city: string;
		address: string;
		featured: boolean;
		description: string;
	}

	interface Brand {
		id: string;
		name: string;
		type: 'beer' | 'wine' | 'spirits';
		featured: boolean;
		description: string;
	}

	const MOCK_DATA = {
		events: [
			{
				id: 'evt_001',
				title: 'Friday Night Party',
				venue_id: 'ven_001',
				venue_name: 'Sky Bar Phnom Penh',
				city: 'Phnom Penh',
				featured: true,
				brands: ['brd_001', 'brd_003'],
				price_range: '$15-25',
				date: '2025-08-22',
				description: 'Ultimate rooftop party with city views and premium cocktails.'
			},
			{
				id: 'evt_002', 
				title: 'Karaoke Night Special',
				venue_id: 'ven_002',
				venue_name: 'Golden KTV',
				city: 'Phnom Penh',
				featured: false,
				brands: ['brd_002', 'brd_004'],
				price_range: '$10-20',
				date: '2025-08-23',
				description: 'Private rooms with premium sound system and drink promotions.'
			},
			{
				id: 'evt_003',
				title: 'Weekend Beach Club',
				venue_id: 'ven_003', 
				venue_name: 'Otres Beach Club',
				city: 'Sihanoukville',
				featured: true,
				brands: ['brd_001', 'brd_005'],
				price_range: '$12-22',
				date: '2025-08-24',
				description: 'Beachfront party with live DJ and tropical cocktails.'
			},
			{
				id: 'evt_004',
				title: 'Craft Beer Festival',
				venue_id: 'ven_004',
				venue_name: 'Embargo Bar',
				city: 'Siem Reap',
				featured: false,
				brands: ['brd_002', 'brd_006'],
				price_range: '$8-18',
				date: '2025-08-25',
				description: 'Local and international craft beers with food pairings.'
			},
			{
				id: 'evt_005',
				title: 'Latin Night',
				venue_id: 'ven_005',
				venue_name: 'Pontoon Club',
				city: 'Phnom Penh',
				featured: true,
				brands: ['brd_003', 'brd_007'],
				price_range: '$18-30',
				date: '2025-08-26',
				description: 'Salsa dancing with authentic Latin cocktails and live music.'
			}
		] as Event[],
		venues: [
			{
				id: 'ven_001',
				name: 'Sky Bar Phnom Penh',
				type: 'bar' as const,
				city: 'Phnom Penh',
				address: 'Riverside, Central Phnom Penh',
				featured: true,
				description: 'Premium rooftop bar with panoramic city views and signature cocktails.'
			},
			{
				id: 'ven_002',
				name: 'Golden KTV',
				type: 'ktv' as const,
				city: 'Phnom Penh', 
				address: 'BKK1, Phnom Penh',
				featured: false,
				description: 'Luxury karaoke with private rooms and premium sound systems.'
			},
			{
				id: 'ven_003',
				name: 'Otres Beach Club',
				type: 'club' as const,
				city: 'Sihanoukville',
				address: 'Otres Beach, Sihanoukville',
				featured: true,
				description: 'Beachfront club with international DJs and beach party atmosphere.'
			},
			{
				id: 'ven_004',
				name: 'Embargo Bar',
				type: 'bar' as const,
				city: 'Siem Reap',
				address: 'Pub Street, Siem Reap',
				featured: false,
				description: 'Craft beer specialist with local and international selections.'
			},
			{
				id: 'ven_005',
				name: 'Pontoon Club',
				type: 'club' as const,
				city: 'Phnom Penh',
				address: 'Sisowath Quay, Phnom Penh',
				featured: true,
				description: 'Floating club on Mekong River with themed nights and premium drinks.'
			}
		] as Venue[],
		brands: [
			{
				id: 'brd_001',
				name: 'Angkor Beer',
				type: 'beer' as const,
				featured: true,
				description: 'Cambodia\'s premium local beer, crisp and refreshing.'
			},
			{
				id: 'brd_002',
				name: 'Kingdom Brew',
				type: 'beer' as const,
				featured: false,
				description: 'Craft beer made locally with international standards.'
			},
			{
				id: 'brd_003',
				name: 'Samai Rum',
				type: 'spirits' as const,
				featured: true,
				description: 'Premium Cambodian rum with traditional distillation methods.'
			},
			{
				id: 'brd_004',
				name: 'Mekong Wine',
				type: 'wine' as const,
				featured: false,
				description: 'Local wine made from tropical fruits and traditional grapes.'
			},
			{
				id: 'brd_005',
				name: 'Cambodia Premium',
				type: 'beer' as const,
				featured: true,
				description: 'Export quality beer with smooth taste and premium ingredients.'
			},
			{
				id: 'brd_006',
				name: 'Highland Coffee',
				type: 'spirits' as const,
				featured: false,
				description: 'Coffee-infused spirits perfect for evening cocktails.'
			},
			{
				id: 'brd_007',
				name: 'Tropical Spirits',
				type: 'spirits' as const,
				featured: true,
				description: 'Exotic fruit-infused spirits with authentic Cambodian flavors.'
			}
		] as Brand[]
	};

	let webApp: any = null;
	let isReady = $state(false);
	let userInfo = $state<any>(null);
	let error = $state<string | null>(null);

	let currentView = $state<'main' | 'events' | 'venues' | 'brands' | 'booking'>('main');
	let selectedEventId = $state<string | null>(null);
	let selectedVenueId = $state<string | null>(null);
	let selectedBrandId = $state<string | null>(null);
	let viewMode = $state<'list' | 'detail'>('list');

	let cityFilter = $state<string>('all');
	let venueTypeFilter = $state<'all' | 'bar' | 'ktv' | 'club'>('all');
	let brandTypeFilter = $state<'all' | 'beer' | 'wine' | 'spirits'>('all');

	const cities = $derived(['all', ...new Set(MOCK_DATA.events.map(e => e.city))]);
	const venueTypes = $derived(['all', 'bar', 'ktv', 'club'] as const);
	const brandTypes = $derived(['all', 'beer', 'wine', 'spirits'] as const);

	const filteredEvents = $derived(
		MOCK_DATA.events.filter(event => 
			(cityFilter === 'all' || event.city === cityFilter)
		).sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
	);

	const filteredVenues = $derived(
		MOCK_DATA.venues.filter(venue => 
			(cityFilter === 'all' || venue.city === cityFilter) &&
			(venueTypeFilter === 'all' || venue.type === venueTypeFilter)
		).sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
	);

	const filteredBrands = $derived(
		MOCK_DATA.brands.filter(brand => 
			(brandTypeFilter === 'all' || brand.type === brandTypeFilter)
		).sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
	);

	const selectedEvent = $derived(
		selectedEventId ? MOCK_DATA.events.find(e => e.id === selectedEventId) : null
	);

	const selectedVenue = $derived(
		selectedVenueId ? MOCK_DATA.venues.find(v => v.id === selectedVenueId) : null
	);

	const selectedBrand = $derived(
		selectedBrandId ? MOCK_DATA.brands.find(b => b.id === selectedBrandId) : null
	);

	const venueEvents = $derived(
		selectedVenueId ? MOCK_DATA.events.filter(e => e.venue_id === selectedVenueId) : []
	);

	const brandEvents = $derived(
		selectedBrandId ? MOCK_DATA.events.filter(e => e.brands.includes(selectedBrandId)) : []
	);

	function navigateBack() {
		if (currentView === 'booking') {
			if (selectedEventId) {
				currentView = 'events';
				viewMode = 'detail';
			} else {
				currentView = 'main';
			}
		} else if (viewMode === 'detail') {
			viewMode = 'list';
			selectedEventId = null;
			selectedVenueId = null;
			selectedBrandId = null;
		} else if (currentView !== 'main') {
			currentView = 'main';
			viewMode = 'list';
		}
	}

	function selectEvent(eventId: string) {
		selectedEventId = eventId;
		viewMode = 'detail';
	}

	function selectVenue(venueId: string) {
		selectedVenueId = venueId;
		viewMode = 'detail';
	}

	function selectBrand(brandId: string) {
		selectedBrandId = brandId;
		viewMode = 'detail';
	}

	function startBooking(eventId: string) {
		selectedEventId = eventId;
		currentView = 'booking';
	}

	function completeBooking() {
		currentView = 'main';
		selectedEventId = null;
		viewMode = 'list';
	}

	onMount(() => {
		if (typeof window !== 'undefined') {
			const currentUrl = window.location.pathname;
			if (currentUrl !== '/' && !currentUrl.startsWith('/app/')) {
				window.history.replaceState({}, '', '/');
			}

			const urlParams = new URLSearchParams(window.location.search);
			const startParam = urlParams.get('start');
			if (startParam === 'events') currentView = 'events';
			else if (startParam === 'venues') currentView = 'venues';
			else if (startParam === 'brands') currentView = 'brands';
		}

		try {
			if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
				webApp = window.Telegram.WebApp;
				
				webApp.ready();
				webApp.expand();
				
				if (webApp.initDataUnsafe?.user) {
					userInfo = webApp.initDataUnsafe.user;
				}
				
				webApp.BackButton.onClick(navigateBack);
				
				isReady = true;
			} else {
				error = 'Telegram WebApp not available. Open this in Telegram.';
			}
		} catch (err) {
			error = 'Failed to initialize Telegram WebApp';
			console.error('WebApp initialization error:', err);
		}
	});

	$effect(() => {
		if (webApp) {
			if (currentView !== 'main' || viewMode === 'detail') {
				webApp.BackButton.show();
			} else {
				webApp.BackButton.hide();
			}
		}
	});
</script>

<main class="min-h-screen bg-gray-50">
	{#if error}
		<div class="container mx-auto px-4 py-8">
			<div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
				<p class="text-red-800 font-medium">⚠️ {error}</p>
				<p class="text-red-600 text-sm mt-2">Try opening this in Telegram</p>
			</div>
		</div>
	{:else if !isReady}
		<div class="container mx-auto px-4 py-8">
			<div class="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
				<p class="text-blue-800">🔄 Initializing...</p>
			</div>
		</div>
	{:else if currentView === 'main'}
		<div class="container mx-auto px-4 py-6">
			<div class="text-center mb-8">
				<h1 class="text-3xl font-bold text-gray-900 mb-2">🍺 Trojeak</h1>
				<p class="text-gray-600">Discover events and pre-order drinks</p>
				{#if userInfo}
					<p class="text-sm text-gray-500 mt-2">Welcome, {userInfo.first_name}!</p>
				{/if}
			</div>

			<div class="grid grid-cols-1 gap-4">
				<button 
					onclick={() => { currentView = 'events'; viewMode = 'list'; }}
					class="bg-white border border-gray-200 rounded-lg p-6 text-left hover:bg-gray-50 transition-colors"
				>
					<div class="flex items-center">
						<span class="text-2xl mr-4">🎉</span>
						<div>
							<h3 class="font-semibold text-gray-900">Events</h3>
							<p class="text-gray-600 text-sm">Browse upcoming events and parties</p>
							<p class="text-blue-600 text-sm font-medium mt-1">{filteredEvents.length} events available</p>
						</div>
					</div>
				</button>

				<button 
					onclick={() => { currentView = 'venues'; viewMode = 'list'; }}
					class="bg-white border border-gray-200 rounded-lg p-6 text-left hover:bg-gray-50 transition-colors"
				>
					<div class="flex items-center">
						<span class="text-2xl mr-4">🏢</span>
						<div>
							<h3 class="font-semibold text-gray-900">Venues</h3>
							<p class="text-gray-600 text-sm">Discover bars, KTVs, and clubs</p>
							<p class="text-blue-600 text-sm font-medium mt-1">{MOCK_DATA.venues.length} venues available</p>
						</div>
					</div>
				</button>

				<button 
					onclick={() => { currentView = 'brands'; viewMode = 'list'; }}
					class="bg-white border border-gray-200 rounded-lg p-6 text-left hover:bg-gray-50 transition-colors"
				>
					<div class="flex items-center">
						<span class="text-2xl mr-4">🥃</span>
						<div>
							<h3 class="font-semibold text-gray-900">Brands</h3>
							<p class="text-gray-600 text-sm">Explore drink brands and promotions</p>
							<p class="text-blue-600 text-sm font-medium mt-1">{MOCK_DATA.brands.length} brands available</p>
						</div>
					</div>
				</button>
			</div>
		</div>

	{:else if currentView === 'events'}
		{#if viewMode === 'list'}
			<div class="container mx-auto px-4 py-6">
				<h2 class="text-2xl font-bold text-gray-900 mb-4">Events</h2>
				
				<div class="mb-4">
					<select bind:value={cityFilter} class="w-full p-3 border border-gray-300 rounded-lg">
						{#each cities as city}
							<option value={city}>{city === 'all' ? 'All Cities' : city}</option>
						{/each}
					</select>
				</div>

				<div class="space-y-4">
					{#each filteredEvents as event}
						<button 
							onclick={() => selectEvent(event.id)}
							class="w-full bg-white border border-gray-200 rounded-lg p-4 text-left hover:bg-gray-50 transition-colors"
						>
							<div class="flex justify-between items-start mb-2">
								<h3 class="font-semibold text-gray-900">{event.title}</h3>
								{#if event.featured}
									<span class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Featured</span>
								{/if}
							</div>
							<p class="text-gray-600 text-sm mb-1">{event.venue_name} • {event.city}</p>
							<p class="text-gray-500 text-sm mb-2">{event.date} • {event.price_range}</p>
							<p class="text-gray-700 text-sm">{event.description}</p>
						</button>
					{/each}
				</div>
			</div>
		{:else if selectedEvent}
			<div class="container mx-auto px-4 py-6">
				<div class="bg-white rounded-lg p-6 mb-6">
					<div class="flex justify-between items-start mb-4">
						<h2 class="text-2xl font-bold text-gray-900">{selectedEvent.title}</h2>
						{#if selectedEvent.featured}
							<span class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Featured</span>
						{/if}
					</div>
					
					<div class="space-y-3 mb-6">
						<p class="text-gray-600"><span class="font-medium">Venue:</span> {selectedEvent.venue_name}</p>
						<p class="text-gray-600"><span class="font-medium">Location:</span> {selectedEvent.city}</p>
						<p class="text-gray-600"><span class="font-medium">Date:</span> {selectedEvent.date}</p>
						<p class="text-gray-600"><span class="font-medium">Price Range:</span> {selectedEvent.price_range}</p>
					</div>
					
					<p class="text-gray-700 mb-6">{selectedEvent.description}</p>
					
					<div class="mb-6">
						<h3 class="font-semibold text-gray-900 mb-3">Available Brands</h3>
						<div class="grid grid-cols-2 gap-2">
							{#each selectedEvent.brands as brandId}
								{@const brand = MOCK_DATA.brands.find(b => b.id === brandId)}
								{#if brand}
									<div class="bg-gray-50 rounded-lg p-3">
										<p class="font-medium text-gray-900">{brand.name}</p>
										<p class="text-gray-600 text-sm">{brand.type}</p>
									</div>
								{/if}
							{/each}
						</div>
					</div>
					
					<button 
						onclick={() => startBooking(selectedEvent.id)}
						class="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
					>
						Book Now
					</button>
				</div>
			</div>
		{/if}

	{:else if currentView === 'venues'}
		{#if viewMode === 'list'}
			<div class="container mx-auto px-4 py-6">
				<h2 class="text-2xl font-bold text-gray-900 mb-4">Venues</h2>
				
				<div class="grid grid-cols-2 gap-4 mb-4">
					<select bind:value={cityFilter} class="p-3 border border-gray-300 rounded-lg">
						{#each cities as city}
							<option value={city}>{city === 'all' ? 'All Cities' : city}</option>
						{/each}
					</select>
					
					<select bind:value={venueTypeFilter} class="p-3 border border-gray-300 rounded-lg">
						{#each venueTypes as type}
							<option value={type}>{type === 'all' ? 'All Types' : type.toUpperCase()}</option>
						{/each}
					</select>
				</div>

				<div class="space-y-4">
					{#each filteredVenues as venue}
						<button 
							onclick={() => selectVenue(venue.id)}
							class="w-full bg-white border border-gray-200 rounded-lg p-4 text-left hover:bg-gray-50 transition-colors"
						>
							<div class="flex justify-between items-start mb-2">
								<h3 class="font-semibold text-gray-900">{venue.name}</h3>
								{#if venue.featured}
									<span class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Featured</span>
								{/if}
							</div>
							<p class="text-gray-600 text-sm mb-1">{venue.type.toUpperCase()} • {venue.city}</p>
							<p class="text-gray-500 text-sm mb-2">{venue.address}</p>
							<p class="text-gray-700 text-sm">{venue.description}</p>
						</button>
					{/each}
				</div>
			</div>
		{:else if selectedVenue}
			<div class="container mx-auto px-4 py-6">
				<div class="bg-white rounded-lg p-6 mb-6">
					<div class="flex justify-between items-start mb-4">
						<h2 class="text-2xl font-bold text-gray-900">{selectedVenue.name}</h2>
						{#if selectedVenue.featured}
							<span class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Featured</span>
						{/if}
					</div>
					
					<div class="space-y-3 mb-6">
						<p class="text-gray-600"><span class="font-medium">Type:</span> {selectedVenue.type.toUpperCase()}</p>
						<p class="text-gray-600"><span class="font-medium">Location:</span> {selectedVenue.city}</p>
						<p class="text-gray-600"><span class="font-medium">Address:</span> {selectedVenue.address}</p>
					</div>
					
					<p class="text-gray-700 mb-6">{selectedVenue.description}</p>
					
					<div class="mb-6">
						<h3 class="font-semibold text-gray-900 mb-3">Upcoming Events</h3>
						{#if venueEvents.length > 0}
							<div class="space-y-3">
								{#each venueEvents as event}
									<button 
										onclick={() => { currentView = 'events'; selectEvent(event.id); }}
										class="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-left hover:bg-gray-100 transition-colors"
									>
										<h4 class="font-medium text-gray-900">{event.title}</h4>
										<p class="text-gray-600 text-sm">{event.date} • {event.price_range}</p>
									</button>
								{/each}
							</div>
						{:else}
							<p class="text-gray-500 text-sm">No upcoming events</p>
						{/if}
					</div>
				</div>
			</div>
		{/if}

	{:else if currentView === 'brands'}
		{#if viewMode === 'list'}
			<div class="container mx-auto px-4 py-6">
				<h2 class="text-2xl font-bold text-gray-900 mb-4">Brands</h2>
				
				<div class="mb-4">
					<select bind:value={brandTypeFilter} class="w-full p-3 border border-gray-300 rounded-lg">
						{#each brandTypes as type}
							<option value={type}>{type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}</option>
						{/each}
					</select>
				</div>

				<div class="grid grid-cols-2 gap-4">
					{#each filteredBrands as brand}
						<button 
							onclick={() => selectBrand(brand.id)}
							class="bg-white border border-gray-200 rounded-lg p-4 text-left hover:bg-gray-50 transition-colors"
						>
							<div class="flex justify-between items-start mb-2">
								<h3 class="font-semibold text-gray-900 text-sm">{brand.name}</h3>
								{#if brand.featured}
									<span class="bg-yellow-100 text-yellow-800 text-xs px-1 py-0.5 rounded-full">★</span>
								{/if}
							</div>
							<p class="text-gray-600 text-xs mb-2">{brand.type}</p>
							<p class="text-gray-700 text-xs">{brand.description}</p>
						</button>
					{/each}
				</div>
			</div>
		{:else if selectedBrand}
			<div class="container mx-auto px-4 py-6">
				<div class="bg-white rounded-lg p-6 mb-6">
					<div class="flex justify-between items-start mb-4">
						<h2 class="text-2xl font-bold text-gray-900">{selectedBrand.name}</h2>
						{#if selectedBrand.featured}
							<span class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Featured</span>
						{/if}
					</div>
					
					<div class="space-y-3 mb-6">
						<p class="text-gray-600"><span class="font-medium">Type:</span> {selectedBrand.type.charAt(0).toUpperCase() + selectedBrand.type.slice(1)}</p>
					</div>
					
					<p class="text-gray-700 mb-6">{selectedBrand.description}</p>
					
					<div class="mb-6">
						<h3 class="font-semibold text-gray-900 mb-3">Events featuring {selectedBrand.name}</h3>
						{#if brandEvents.length > 0}
							<div class="space-y-3">
								{#each brandEvents as event}
									<button 
										onclick={() => { currentView = 'events'; selectEvent(event.id); }}
										class="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-left hover:bg-gray-100 transition-colors"
									>
										<h4 class="font-medium text-gray-900">{event.title}</h4>
										<p class="text-gray-600 text-sm">{event.venue_name} • {event.date}</p>
									</button>
								{/each}
							</div>
						{:else}
							<p class="text-gray-500 text-sm">No events featuring this brand</p>
						{/if}
					</div>
				</div>
			</div>
		{/if}

	{:else if currentView === 'booking' && selectedEvent}
		<BookingWizard 
			event={selectedEvent}
			availableBrands={selectedEvent.brands.map(id => MOCK_DATA.brands.find(b => b.id === id)).filter(Boolean)}
			onComplete={completeBooking}
			onCancel={() => { currentView = 'events'; viewMode = 'detail'; }}
		/>
	{/if}
</main>