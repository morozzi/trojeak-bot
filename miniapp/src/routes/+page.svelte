<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
	import LoadingAnimation from '$lib/components/LoadingAnimation.svelte';
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

	let currentView: 'main' | 'events' | 'venues' | 'brands' | 'booking' = $state('main');
	let viewMode: 'list' | 'detail' = $state('list');
	let selectedEventId: string | null = $state(null);
	let selectedVenueId: string | null = $state(null);
	let selectedBrandId: string | null = $state(null);
	let cityFilter: string = $state('all');
	let typeFilter: string = $state('all');
	let webApp: any = $state(null);
	let userInfo: any = $state(null);
	let isReady: boolean = $state(false);
	let error: string | null = $state(null);
	let isLoading: boolean = $state(true);

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
			}
		],
		venues: [
			{
				id: 'ven_001',
				name: 'Sky Bar Phnom Penh',
				type: 'bar' as const,
				city: 'Phnom Penh',
				address: '123 Riverside Blvd',
				featured: true,
				description: 'Rooftop bar with stunning city views and premium cocktails.'
			},
			{
				id: 'ven_002',
				name: 'Golden KTV',
				type: 'ktv' as const,
				city: 'Phnom Penh',
				address: '456 Entertainment District',
				featured: false,
				description: 'Private karaoke rooms with premium sound systems.'
			},
			{
				id: 'ven_003',
				name: 'Otres Beach Club',
				type: 'club' as const,
				city: 'Sihanoukville',
				address: '789 Beach Road',
				featured: true,
				description: 'Beachfront club with live DJs and tropical atmosphere.'
			},
			{
				id: 'ven_004',
				name: 'Embargo Bar',
				type: 'bar' as const,
				city: 'Siem Reap',
				address: '101 Pub Street',
				featured: false,
				description: 'Craft beer specialists with local and international selections.'
			}
		],
		brands: [
			{
				id: 'brd_001',
				name: 'Angkor Beer',
				type: 'beer' as const,
				featured: true,
				description: 'Cambodia\'s premium local beer'
			},
			{
				id: 'brd_002',
				name: 'Hennessy',
				type: 'spirits' as const,
				featured: true,
				description: 'Premium cognac for special occasions'
			},
			{
				id: 'brd_003',
				name: 'Absolut Vodka',
				type: 'spirits' as const,
				featured: false,
				description: 'Premium Swedish vodka'
			},
			{
				id: 'brd_004',
				name: 'Moët & Chandon',
				type: 'wine' as const,
				featured: true,
				description: 'Luxury champagne'
			},
			{
				id: 'brd_005',
				name: 'Tiger Beer',
				type: 'beer' as const,
				featured: false,
				description: 'Asia\'s premium beer'
			},
			{
				id: 'brd_006',
				name: 'Corona Extra',
				type: 'beer' as const,
				featured: false,
				description: 'Mexican beach beer'
			}
		]
	};

	const filteredEvents = $derived(() => {
		return MOCK_DATA.events.filter(event => 
			(cityFilter === 'all' || event.city === cityFilter)
		);
	});

	const filteredVenues = $derived(() => {
		return MOCK_DATA.venues.filter(venue => 
			(cityFilter === 'all' || venue.city === cityFilter) &&
			(typeFilter === 'all' || venue.type === typeFilter)
		);
	});

	const filteredBrands = $derived(() => {
		return MOCK_DATA.brands.filter(brand => 
			(typeFilter === 'all' || brand.type === typeFilter)
		);
	});

	const selectedEvent = $derived(() => {
		return selectedEventId ? MOCK_DATA.events.find(e => e.id === selectedEventId) : null;
	});

	const selectedVenue = $derived(() => {
		return selectedVenueId ? MOCK_DATA.venues.find(v => v.id === selectedVenueId) : null;
	});

	const selectedBrand = $derived(() => {
		return selectedBrandId ? MOCK_DATA.brands.find(b => b.id === selectedBrandId) : null;
	});

	const venueEvents = $derived(() => {
		return selectedVenue ? MOCK_DATA.events.filter(e => e.venue_id === selectedVenue.id) : [];
	});

	const cities = $derived(() => {
		const uniqueCities = [...new Set([...MOCK_DATA.events.map(e => e.city), ...MOCK_DATA.venues.map(v => v.city)])];
		return uniqueCities;
	});

	function goToEvents() {
		currentView = 'events';
		viewMode = 'list';
	}

	function goToVenues() {
		currentView = 'venues';
		viewMode = 'list';
	}

	function goToBrands() {
		currentView = 'brands';
		viewMode = 'list';
	}

	function goBack() {
		if (viewMode === 'detail') {
			viewMode = 'list';
			selectedEventId = null;
			selectedVenueId = null;
			selectedBrandId = null;
		} else {
			currentView = 'main';
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

	function startBooking() {
		currentView = 'booking';
	}

	function completeBooking() {
		alert('Booking completed successfully!');
		currentView = 'main';
		viewMode = 'list';
		selectedEventId = null;
	}

	function cancelBooking() {
		currentView = 'events';
		viewMode = 'detail';
	}

	onMount(async () => {
		try {
			const queryParams = new URLSearchParams($page.url.search);
			const startParam = queryParams.get('start');
			
			if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
				webApp = window.Telegram.WebApp;
				webApp.ready();
				webApp.expand();
				
				userInfo = webApp.initDataUnsafe?.user || {
					id: 12345,
					first_name: 'Demo',
					last_name: 'User',
					username: 'demouser'
				};

				webApp.BackButton.onClick(() => {
					goBack();
				});

				if (startParam) {
					switch(startParam) {
						case 'events':
							goToEvents();
							break;
						case 'venues':
							goToVenues();
							break;
						case 'brands':
							goToBrands();
							break;
					}
				}
			} else {
				userInfo = {
					id: 12345,
					first_name: 'Demo',
					last_name: 'User',
					username: 'demouser'
				};
			}

			isReady = true;
		} catch (err) {
			error = 'Failed to initialize application';
			console.error('Initialization error:', err);
		} finally {
			isLoading = false;
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

{#if isLoading}
	<div class="flex items-center justify-center min-h-screen bg-background">
		<LoadingAnimation size="lg" message="Loading Trojeak..." />
	</div>
{:else if error}
	<div class="flex items-center justify-center min-h-screen p-6">
		<Card class="max-w-md w-full">
			<CardContent class="text-center p-8">
				<div class="text-4xl mb-4">⚠️</div>
				<h2 class="text-xl font-bold text-destructive mb-3">Application Error</h2>
				<p class="text-muted-foreground mb-2">{error}</p>
				<p class="text-sm text-muted-foreground">Please try refreshing the page</p>
			</CardContent>
		</Card>
	</div>
{:else if currentView === 'booking' && selectedEvent}
	<BookingWizard 
		event={selectedEvent}
		availableBrands={MOCK_DATA.brands}
		onComplete={completeBooking}
		onCancel={cancelBooking}
	/>
{:else}
	<div class="p-6 max-w-4xl mx-auto min-h-screen bg-background">
		{#if currentView === 'main'}
			<div class="text-center mb-8">
				<h1 class="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
					Welcome to Trojeak
				</h1>
				<p class="text-xl text-muted-foreground mb-6">
					Discover events and pre-order drinks across Cambodia
				</p>
				
				{#if userInfo}
					<div class="flex flex-col gap-1">
						<p class="text-sm text-muted-foreground">Welcome back,</p>
						<p class="text-lg font-semibold text-primary">
							{userInfo.first_name} {userInfo.last_name}
						</p>
					</div>
				{/if}
			</div>

			<div class="grid gap-6 mb-10">
				<Button 
					variant="default" 
					size="lg" 
					class="h-auto p-6 justify-start"
					onclick={goToEvents}
				>
					<div class="flex items-center gap-4 w-full">
						<div class="text-3xl">🎉</div>
						<div class="flex-1 text-left">
							<h3 class="text-xl font-bold">Browse Events</h3>
							<p class="text-sm opacity-90">Discover parties, festivals, and nightlife</p>
							<div class="flex items-baseline gap-2 mt-1">
								<span class="text-lg font-bold text-primary">{MOCK_DATA.events.length}</span>
								<span class="text-xs uppercase tracking-wide">Events Available</span>
							</div>
						</div>
						<div class="text-xl">→</div>
					</div>
				</Button>

				<Button 
					variant="outline" 
					size="lg" 
					class="h-auto p-6 justify-start"
					onclick={goToVenues}
				>
					<div class="flex items-center gap-4 w-full">
						<div class="text-3xl">🏢</div>
						<div class="flex-1 text-left">
							<h3 class="text-xl font-bold">Explore Venues</h3>
							<p class="text-sm text-muted-foreground">Bars, KTVs, and clubs</p>
							<div class="flex items-baseline gap-2 mt-1">
								<span class="text-lg font-bold text-primary">{MOCK_DATA.venues.length}</span>
								<span class="text-xs uppercase tracking-wide">Venues</span>
							</div>
						</div>
						<div class="text-xl">→</div>
					</div>
				</Button>

				<Button 
					variant="outline" 
					size="lg" 
					class="h-auto p-6 justify-start"
					onclick={goToBrands}
				>
					<div class="flex items-center gap-4 w-full">
						<div class="text-3xl">🍺</div>
						<div class="flex-1 text-left">
							<h3 class="text-xl font-bold">Browse Brands</h3>
							<p class="text-sm text-muted-foreground">Premium drinks and beverages</p>
							<div class="flex items-baseline gap-2 mt-1">
								<span class="text-lg font-bold text-primary">{MOCK_DATA.brands.length}</span>
								<span class="text-xs uppercase tracking-wide">Brands</span>
							</div>
						</div>
						<div class="text-xl">→</div>
					</div>
				</Button>
			</div>

			<div class="space-y-6">
				<h2 class="text-2xl font-bold text-center">Featured Events</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					{#each MOCK_DATA.events.filter(e => e.featured) as event}
						<Card class="cursor-pointer hover:shadow-lg transition-shadow" onclick={() => selectEvent(event.id)}>
							<CardHeader>
								<div class="flex justify-between items-start mb-2">
									<CardTitle class="text-lg">{event.title}</CardTitle>
									<Badge>Featured</Badge>
								</div>
								<p class="text-sm text-muted-foreground">{event.venue_name}</p>
								<p class="text-sm text-muted-foreground">{event.city}</p>
							</CardHeader>
							<CardContent>
								<p class="text-sm mb-2">{event.description}</p>
								<p class="text-base font-semibold text-primary">{event.price_range}</p>
							</CardContent>
						</Card>
					{/each}
				</div>
			</div>
		{/if}

		{#if currentView === 'events'}
			<div class="space-y-6">
				{#if viewMode === 'list'}
					<div class="flex justify-between items-center">
						<h1 class="text-3xl font-bold">Events</h1>
						<Select bind:value={cityFilter}>
							<SelectTrigger class="w-40">
								{cityFilter === 'all' ? 'All Cities' : cityFilter}
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Cities</SelectItem>
								{#each cities as city}
									<SelectItem value={city}>{city}</SelectItem>
								{/each}
							</SelectContent>
						</Select>
					</div>

					<div class="grid gap-4">
						{#each filteredEvents as event}
							<Card class="cursor-pointer hover:shadow-lg transition-shadow" onclick={() => selectEvent(event.id)}>
								<CardHeader>
									<div class="flex justify-between items-start">
										<CardTitle>{event.title}</CardTitle>
										{#if event.featured}
											<Badge>Featured</Badge>
										{/if}
									</div>
									<p class="text-muted-foreground">{event.venue_name} • {event.city}</p>
								</CardHeader>
								<CardContent>
									<p class="mb-2">{event.description}</p>
									<p class="font-semibold text-primary">{event.price_range}</p>
								</CardContent>
							</Card>
						{/each}
					</div>
				{:else if selectedEvent}
					<div class="space-y-6">
						<div class="flex justify-between items-center">
							<h1 class="text-3xl font-bold">{selectedEvent.title}</h1>
							{#if selectedEvent.featured}
								<Badge>Featured</Badge>
							{/if}
						</div>
						
						<Card>
							<CardContent class="p-6">
								<div class="space-y-4">
									<div>
										<p class="text-muted-foreground"><span class="font-semibold">Venue:</span> {selectedEvent.venue_name}</p>
										<p class="text-muted-foreground"><span class="font-semibold">Location:</span> {selectedEvent.city}</p>
										<p class="text-muted-foreground"><span class="font-semibold">Date:</span> {selectedEvent.date}</p>
										<p class="text-muted-foreground"><span class="font-semibold">Price Range:</span> {selectedEvent.price_range}</p>
									</div>
									<p>{selectedEvent.description}</p>
									<Button onclick={startBooking} class="w-full">
										Book This Event
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				{/if}
			</div>
		{/if}

		{#if currentView === 'venues'}
			<div class="space-y-6">
				{#if viewMode === 'list'}
					<div class="flex justify-between items-center">
						<h1 class="text-3xl font-bold">Venues</h1>
						<div class="flex gap-2">
							<Select bind:value={cityFilter}>
								<SelectTrigger class="w-40">
									{cityFilter === 'all' ? 'All Cities' : cityFilter}
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Cities</SelectItem>
									{#each cities as city}
										<SelectItem value={city}>{city}</SelectItem>
									{/each}
								</SelectContent>
							</Select>
							<Select bind:value={typeFilter}>
								<SelectTrigger class="w-32">
									{typeFilter === 'all' ? 'All Types' : typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Types</SelectItem>
									<SelectItem value="bar">Bars</SelectItem>
									<SelectItem value="ktv">KTVs</SelectItem>
									<SelectItem value="club">Clubs</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div class="grid gap-4">
						{#each filteredVenues as venue}
							<Card class="cursor-pointer hover:shadow-lg transition-shadow" onclick={() => selectVenue(venue.id)}>
								<CardHeader>
									<div class="flex justify-between items-start">
										<CardTitle>{venue.name}</CardTitle>
										<div class="flex gap-2">
											<Badge variant="secondary">{venue.type.toUpperCase()}</Badge>
											{#if venue.featured}
												<Badge>Featured</Badge>
											{/if}
										</div>
									</div>
									<p class="text-muted-foreground">{venue.city} • {venue.address}</p>
								</CardHeader>
								<CardContent>
									<p>{venue.description}</p>
								</CardContent>
							</Card>
						{/each}
					</div>
				{:else if selectedVenue}
					<div class="space-y-6">
						<div class="flex justify-between items-start">
							<h1 class="text-3xl font-bold">{selectedVenue.name}</h1>
							<div class="flex gap-2">
								<Badge variant="secondary">{selectedVenue.type.toUpperCase()}</Badge>
								{#if selectedVenue.featured}
									<Badge>Featured</Badge>
								{/if}
							</div>
						</div>
						
						<Card>
							<CardContent class="p-6">
								<div class="space-y-4">
									<div>
										<p class="text-muted-foreground"><span class="font-semibold">Type:</span> {selectedVenue.type.charAt(0).toUpperCase() + selectedVenue.type.slice(1)}</p>
										<p class="text-muted-foreground"><span class="font-semibold">Location:</span> {selectedVenue.city}</p>
										<p class="text-muted-foreground"><span class="font-semibold">Address:</span> {selectedVenue.address}</p>
									</div>
									<p>{selectedVenue.description}</p>
								</div>
							</CardContent>
						</Card>

						{#if venueEvents.length > 0}
							<Card>
								<CardHeader>
									<CardTitle>Events at {selectedVenue.name}</CardTitle>
								</CardHeader>
								<CardContent>
									<div class="space-y-3">
										{#each venueEvents as event}
											<Card class="cursor-pointer hover:shadow-lg transition-shadow" onclick={() => selectEvent(event.id)}>
												<CardContent class="p-4">
													<h4 class="font-semibold">{event.title}</h4>
													<p class="text-sm text-muted-foreground">{event.date} • {event.price_range}</p>
												</CardContent>
											</Card>
										{/each}
									</div>
								</CardContent>
							</Card>
						{/if}
					</div>
				{/if}
			</div>
		{/if}

		{#if currentView === 'brands'}
			<div class="space-y-6">
				{#if viewMode === 'list'}
					<div class="flex justify-between items-center">
						<h1 class="text-3xl font-bold">Brands</h1>
						<Select bind:value={typeFilter}>
							<SelectTrigger class="w-40">
								{typeFilter === 'all' ? 'All Types' : typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Types</SelectItem>
								<SelectItem value="beer">Beer</SelectItem>
								<SelectItem value="wine">Wine</SelectItem>
								<SelectItem value="spirits">Spirits</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div class="grid gap-4">
						{#each filteredBrands as brand}
							<Card class="cursor-pointer hover:shadow-lg transition-shadow" onclick={() => selectBrand(brand.id)}>
								<CardHeader>
									<div class="flex justify-between items-start">
										<CardTitle>{brand.name}</CardTitle>
										<div class="flex gap-2">
											<Badge variant="secondary">{brand.type.toUpperCase()}</Badge>
											{#if brand.featured}
												<Badge>Featured</Badge>
											{/if}
										</div>
									</div>
								</CardHeader>
								<CardContent>
									<p>{brand.description}</p>
								</CardContent>
							</Card>
						{/each}
					</div>
				{:else if selectedBrand}
					<div class="space-y-6">
						<div class="flex justify-between items-start">
							<h1 class="text-3xl font-bold">{selectedBrand.name}</h1>
							<div class="flex gap-2">
								<Badge variant="secondary">{selectedBrand.type.toUpperCase()}</Badge>
								{#if selectedBrand.featured}
									<Badge>Featured</Badge>
								{/if}
							</div>
						</div>
						
						<Card>
							<CardContent class="p-6">
								<p>{selectedBrand.description}</p>
							</CardContent>
						</Card>
					</div>
				{/if}
			</div>
		{/if}
	</div>
{/if}