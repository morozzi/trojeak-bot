<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import LoadingAnimation from '$lib/components/LoadingAnimation.svelte';

	let currentView: 'main' | 'events' | 'venues' | 'brands' = $state('main');
	let viewMode: 'list' | 'detail' = $state('list');
	let selectedEventId: string | null = $state(null);
	let selectedVenueId: string | null = $state(null);
	let selectedBrandId: string | null = $state(null);
	let webApp: any = $state(null);
	let userInfo: any = $state(null);
	let isLoading: boolean = $state(true);
	let error: string | null = $state(null);

	const events = [
		{
			id: 'evt_001',
			title: 'Friday Night Party',
			venue_name: 'Sky Bar Phnom Penh',
			city: 'Phnom Penh',
			featured: true,
			price_range: '$15-25',
			date: '2025-08-22',
			description: 'Ultimate rooftop party with city views and premium cocktails.'
		},
		{
			id: 'evt_002', 
			title: 'Karaoke Night Special',
			venue_name: 'Golden KTV',
			city: 'Phnom Penh',
			featured: false,
			price_range: '$10-20',
			date: '2025-08-23',
			description: 'Private rooms with premium sound system and drink promotions.'
		},
		{
			id: 'evt_003',
			title: 'Weekend Beach Club',
			venue_name: 'Otres Beach Club',
			city: 'Sihanoukville',
			featured: true,
			price_range: '$12-22',
			date: '2025-08-24',
			description: 'Beachfront party with live DJ and tropical cocktails.'
		}
	];

	const venues = [
		{
			id: 'ven_001',
			name: 'Sky Bar Phnom Penh',
			type: 'bar',
			city: 'Phnom Penh',
			address: '123 Riverside, Phnom Penh',
			featured: true,
			description: 'Rooftop bar with panoramic city views and premium cocktails.'
		},
		{
			id: 'ven_002',
			name: 'Golden KTV',
			type: 'ktv',
			city: 'Phnom Penh',
			address: '456 Central Market Area',
			featured: false,
			description: 'Modern KTV with private rooms and professional sound systems.'
		},
		{
			id: 'ven_003',
			name: 'Otres Beach Club',
			type: 'club',
			city: 'Sihanoukville',
			address: 'Otres Beach, Sihanoukville',
			featured: true,
			description: 'Beachfront club with live music and tropical atmosphere.'
		}
	];

	const brands = [
		{
			id: 'brd_001',
			name: 'Angkor Beer',
			type: 'beer',
			featured: true,
			description: 'Cambodia\'s premium local beer'
		},
		{
			id: 'brd_002',
			name: 'Hennessy',
			type: 'spirits',
			featured: true,
			description: 'Premium cognac for special occasions'
		},
		{
			id: 'brd_003',
			name: 'Tiger Beer',
			type: 'beer',
			featured: false,
			description: 'Asia\'s premium beer'
		}
	];

	function goToEvents() {
		currentView = 'events';
		viewMode = 'list';
		selectedEventId = null;
	}

	function goToVenues() {
		currentView = 'venues';
		viewMode = 'list';
		selectedVenueId = null;
	}

	function goToBrands() {
		currentView = 'brands';
		viewMode = 'list';
		selectedBrandId = null;
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
		currentView = 'events';
		viewMode = 'detail';
	}

	function selectVenue(venueId: string) {
		selectedVenueId = venueId;
		currentView = 'venues';
		viewMode = 'detail';
	}

	function selectBrand(brandId: string) {
		selectedBrandId = brandId;
		currentView = 'brands';
		viewMode = 'detail';
	}

	onMount(async () => {
		try {
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
			} else {
				userInfo = {
					id: 12345,
					first_name: 'Demo',
					last_name: 'User',
					username: 'demouser'
				};
			}
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

<!-- DEBUG INFO -->
<div class="fixed top-0 left-0 bg-red-500 text-white p-2 text-xs z-50">
	View: {currentView} | Mode: {viewMode} | Selected: {selectedEventId || selectedVenueId || selectedBrandId || 'none'}
</div>

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
{:else}
	<div class="p-6 max-w-4xl mx-auto min-h-screen bg-background pt-12">
		<!-- MAIN HOME PAGE -->
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

			<!-- Main Navigation -->
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
								<span class="text-lg font-bold text-primary-foreground">{events.length}</span>
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
								<span class="text-lg font-bold text-primary">{venues.length}</span>
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
								<span class="text-lg font-bold text-primary">{brands.length}</span>
								<span class="text-xs uppercase tracking-wide">Brands</span>
							</div>
						</div>
						<div class="text-xl">→</div>
					</div>
				</Button>
			</div>

			<!-- Featured Events Section -->
			<div class="space-y-6">
				<h2 class="text-2xl font-bold text-center">Featured Events</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					{#each events.filter(e => e.featured) as event}
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

		<!-- EVENTS PAGE -->
		{#if currentView === 'events'}
			<div class="space-y-6">
				{#if viewMode === 'list'}
					<h1 class="text-3xl font-bold">Events ({events.length})</h1>
					
					<div class="grid gap-4">
						{#each events as event}
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
				{:else if viewMode === 'detail' && selectedEventId}
					{@const selectedEvent = events.find(e => e.id === selectedEventId)}
					{#if selectedEvent}
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
										<Button class="w-full">
											Book This Event
										</Button>
									</div>
								</CardContent>
							</Card>
						</div>
					{/if}
				{/if}
			</div>
		{/if}

		<!-- VENUES PAGE -->
		{#if currentView === 'venues'}
			<div class="space-y-6">
				{#if viewMode === 'list'}
					<h1 class="text-3xl font-bold">Venues ({venues.length})</h1>
					
					<div class="grid gap-4">
						{#each venues as venue}
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
				{:else if viewMode === 'detail' && selectedVenueId}
					{@const selectedVenue = venues.find(v => v.id === selectedVenueId)}
					{#if selectedVenue}
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
						</div>
					{/if}
				{/if}
			</div>
		{/if}

		<!-- BRANDS PAGE -->
		{#if currentView === 'brands'}
			<div class="space-y-6">
				{#if viewMode === 'list'}
					<h1 class="text-3xl font-bold">Brands ({brands.length})</h1>
					
					<div class="grid gap-4">
						{#each brands as brand}
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
				{:else if viewMode === 'detail' && selectedBrandId}
					{@const selectedBrand = brands.find(b => b.id === selectedBrandId)}
					{#if selectedBrand}
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
				{/if}
			</div>
		{/if}
	</div>
{/if}