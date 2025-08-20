<!-- src/routes/+page.svelte - Fixed interactions and booking -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
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

	// State management
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

	// Mock data
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
				description: 'Beachfront club with stunning ocean views and international DJs.'
			},
			{
				id: 'ven_004',
				name: 'Embargo Bar',
				type: 'bar' as const,
				city: 'Siem Reap',
				address: 'Pub Street, Siem Reap',
				featured: false,
				description: 'Craft beer bar with local and international selections.'
			},
			{
				id: 'ven_005',
				name: 'Pontoon Club',
				type: 'club' as const,
				city: 'Phnom Penh',
				address: 'Sisowath Quay, Phnom Penh',
				featured: true,
				description: 'Floating club on the Mekong River with live music and dancing.'
			}
		] as Venue[],
		brands: [
			{
				id: 'brd_001',
				name: 'Anchor Beer',
				type: 'beer' as const,
				featured: true,
				description: 'Cambodia\'s premium lager beer'
			},
			{
				id: 'brd_002',
				name: 'Absolut Vodka',
				type: 'spirits' as const,
				featured: false,
				description: 'Premium Swedish vodka'
			},
			{
				id: 'brd_003',
				name: 'Grey Goose',
				type: 'spirits' as const,
				featured: true,
				description: 'Ultra-premium French vodka'
			},
			{
				id: 'brd_004',
				name: 'Heineken',
				type: 'beer' as const,
				featured: false,
				description: 'International premium lager'
			},
			{
				id: 'brd_005',
				name: 'Corona',
				type: 'beer' as const,
				featured: true,
				description: 'Mexican beach beer'
			},
			{
				id: 'brd_006',
				name: 'Craft IPA',
				type: 'beer' as const,
				featured: false,
				description: 'Local craft India Pale Ale'
			},
			{
				id: 'brd_007',
				name: 'Bacardi',
				type: 'spirits' as const,
				featured: true,
				description: 'Premium white rum'
			}
		] as Brand[]
	};

	// Computed values
	const cities = $derived(['all', ...Array.from(new Set(MOCK_DATA.events.map(e => e.city)))]);
	const types = $derived(['all', 'bar', 'club', 'ktv']);

	const filteredEvents = $derived(
		MOCK_DATA.events
			.filter(e => cityFilter === 'all' || e.city === cityFilter)
			.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
	);

	const filteredVenues = $derived(
		MOCK_DATA.venues
			.filter(v => typeFilter === 'all' || v.type === typeFilter)
			.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
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

	// Navigation functions - FIXED
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

	// FIXED: Clear navigation functions
	function selectEvent(eventId: string) {
		selectedEventId = eventId;
		selectedVenueId = null;
		selectedBrandId = null;
		currentView = 'events';
		viewMode = 'detail';
	}

	function selectVenue(venueId: string) {
		selectedVenueId = venueId;
		selectedEventId = null;
		selectedBrandId = null;
		currentView = 'venues';
		viewMode = 'detail';
	}

	function selectBrand(brandId: string) {
		selectedBrandId = brandId;
		selectedEventId = null;
		selectedVenueId = null;
		currentView = 'brands';
		viewMode = 'detail';
	}

	function startBooking(eventId: string) {
		selectedEventId = eventId;
		currentView = 'booking';
	}

	function completeBooking() {
		currentView = 'main';
		selectedEventId = null;
		selectedVenueId = null;
		selectedBrandId = null;
		viewMode = 'list';
	}

	function cancelBooking() {
		if (selectedEventId) {
			currentView = 'events';
			viewMode = 'detail';
		} else {
			currentView = 'main';
		}
	}

	onMount(() => {
		// Simulate loading time
		setTimeout(() => {
			isLoading = false;
		}, 1500);

		// Deep linking parameter handling
		if (typeof window !== 'undefined') {
			const currentUrl = window.location.pathname;
			if (currentUrl !== '/' && !currentUrl.startsWith('/app/')) {
				window.history.replaceState({}, '', '/');
			}

			const urlParams = new URLSearchParams(window.location.search);
			const startParam = urlParams.get('start');
			
			if (startParam === 'events') {
				currentView = 'events';
			} else if (startParam === 'venues') {
				currentView = 'venues';
			} else if (startParam === 'brands') {
				currentView = 'brands';
			}
		}

		// Telegram WebApp initialization
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

<main style="min-height: 100vh;">
	{#if isLoading}
		<div class="loading-screen">
			<LoadingAnimation size="lg" message="Welcome to Trojeak" />
		</div>
	{:else if error}
		<div class="error-container">
			<div class="error-card">
				<div class="error-icon">⚠️</div>
				<h2 class="error-title">Oops!</h2>
				<p class="error-message">{error}</p>
				<p class="error-hint">Try opening this in Telegram</p>
			</div>
		</div>
	{:else if currentView === 'booking' && selectedEvent}
		<!-- FIXED: Actual BookingWizard component -->
		<BookingWizard 
			event={selectedEvent}
			availableBrands={MOCK_DATA.brands.filter(b => selectedEvent.brands.includes(b.id))}
			onComplete={completeBooking}
			onCancel={cancelBooking}
		/>
	{:else if currentView === 'main'}
		<div class="main-container animate-fade-in">
			<!-- Hero Header -->
			<div class="hero-section">
				<div class="hero-content">
					<h1 class="hero-title">
						<span class="gradient-text">🍺 Trojeak</span>
					</h1>
					<p class="hero-subtitle">Discover events and pre-order drinks</p>
					{#if userInfo}
						<div class="user-welcome">
							<span class="welcome-text">Welcome back,</span>
							<span class="user-name">{userInfo.first_name}!</span>
						</div>
					{/if}
				</div>
				<div class="hero-glow"></div>
			</div>

			<!-- Navigation Cards -->
			<div class="nav-grid">
				<button 
					onclick={() => { currentView = 'events'; viewMode = 'list'; }}
					class="nav-card animate-slide-up"
					style="animation-delay: 0.1s"
				>
					<div class="nav-card-icon">🎉</div>
					<div class="nav-card-content">
						<h3 class="nav-card-title">Events</h3>
						<p class="nav-card-description">Browse upcoming events and parties</p>
						<div class="nav-card-stats">
							<span class="stats-number">{filteredEvents.length}</span>
							<span class="stats-label">events available</span>
						</div>
					</div>
					<div class="nav-card-arrow">→</div>
				</button>

				<button 
					onclick={() => { currentView = 'venues'; viewMode = 'list'; }}
					class="nav-card animate-slide-up"
					style="animation-delay: 0.2s"
				>
					<div class="nav-card-icon">🏢</div>
					<div class="nav-card-content">
						<h3 class="nav-card-title">Venues</h3>
						<p class="nav-card-description">Discover bars, KTVs, and clubs</p>
						<div class="nav-card-stats">
							<span class="stats-number">{MOCK_DATA.venues.length}</span>
							<span class="stats-label">venues available</span>
						</div>
					</div>
					<div class="nav-card-arrow">→</div>
				</button>

				<button 
					onclick={() => { currentView = 'brands'; viewMode = 'list'; }}
					class="nav-card animate-slide-up"
					style="animation-delay: 0.3s"
				>
					<div class="nav-card-icon">🥃</div>
					<div class="nav-card-content">
						<h3 class="nav-card-title">Brands</h3>
						<p class="nav-card-description">Explore drink brands and promotions</p>
						<div class="nav-card-stats">
							<span class="stats-number">{MOCK_DATA.brands.length}</span>
							<span class="stats-label">brands available</span>
						</div>
					</div>
					<div class="nav-card-arrow">→</div>
				</button>
			</div>

			<!-- Featured Section - FIXED onclick handlers -->
			<div class="featured-section animate-slide-up" style="animation-delay: 0.4s">
				<h2 class="section-title">
					<span class="gradient-text">✨ Featured Tonight</span>
				</h2>
				<div class="featured-grid">
					{#each filteredEvents.filter(e => e.featured).slice(0, 2) as event}
						<button 
							onclick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								selectEvent(event.id);
							}}
							class="featured-card"
						>
							<div class="featured-badge">Featured</div>
							<h4 class="featured-title">{event.title}</h4>
							<p class="featured-venue">{event.venue_name}</p>
							<p class="featured-price">{event.price_range}</p>
						</button>
					{/each}
				</div>
			</div>
		</div>

	{:else if currentView === 'events'}
		{#if viewMode === 'list'}
			<div class="main-container animate-fade-in">
				<h2 class="page-title gradient-text">Events</h2>
				
				<div style="margin-bottom: var(--space-6);">
					<select bind:value={cityFilter} class="form-input form-select">
						{#each cities as city}
							<option value={city}>{city === 'all' ? 'All Cities' : city}</option>
						{/each}
					</select>
				</div>

				<div class="featured-grid">
					{#each filteredEvents as event}
						<button 
							onclick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								selectEvent(event.id);
							}}
							class="card"
						>
							{#if event.featured}
								<div class="badge-featured" style="margin-bottom: var(--space-3);">Featured</div>
							{/if}
							<h3 style="font-size: var(--text-lg); font-weight: 700; color: var(--text-primary); margin-bottom: var(--space-2);">{event.title}</h3>
							<p style="font-size: var(--text-sm); color: var(--text-secondary); margin-bottom: var(--space-2);">{event.venue_name} • {event.city}</p>
							<p style="font-size: var(--text-sm); color: var(--text-muted); margin-bottom: var(--space-3);">{event.date} • {event.price_range}</p>
							<p style="font-size: var(--text-sm); color: var(--text-secondary);">{event.description}</p>
						</button>
					{/each}
				</div>
			</div>
		{:else if selectedEvent}
			<div class="main-container animate-fade-in">
				<div class="card card-featured" style="margin-bottom: var(--space-6);">
					<div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: var(--space-4);">
						<h2 style="font-size: var(--text-2xl); font-weight: 700; color: var(--text-primary);">{selectedEvent.title}</h2>
						{#if selectedEvent.featured}
							<div class="badge-featured">Featured</div>
						{/if}
					</div>
					
					<div style="margin-bottom: var(--space-6);">
						<p style="color: var(--text-secondary); margin-bottom: var(--space-2);"><span style="font-weight: 600;">Venue:</span> {selectedEvent.venue_name}</p>
						<p style="color: var(--text-secondary); margin-bottom: var(--space-2);"><span style="font-weight: 600;">Location:</span> {selectedEvent.city}</p>
						<p style="color: var(--text-secondary); margin-bottom: var(--space-2);"><span style="font-weight: 600;">Date:</span> {selectedEvent.date}</p>
						<p style="color: var(--text-secondary); margin-bottom: var(--space-2);"><span style="font-weight: 600;">Price Range:</span> {selectedEvent.price_range}</p>
					</div>
					
					<p style="color: var(--text-primary); margin-bottom: var(--space-6);">{selectedEvent.description}</p>
					
					<button class="btn btn-primary" onclick={() => startBooking(selectedEvent.id)}>
						Book Now
					</button>
				</div>
			</div>
		{/if}

	{:else if currentView === 'venues'}
		{#if viewMode === 'list'}
			<div class="main-container animate-fade-in">
				<h2 class="page-title gradient-text">Venues</h2>
				
				<div style="margin-bottom: var(--space-6);">
					<select bind:value={typeFilter} class="form-input form-select">
						{#each types as type}
							<option value={type}>{type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}</option>
						{/each}
					</select>
				</div>

				<div class="featured-grid">
					{#each filteredVenues as venue}
						<button 
							onclick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								selectVenue(venue.id);
							}}
							class="card"
						>
							{#if venue.featured}
								<div class="badge-featured" style="margin-bottom: var(--space-3);">Featured</div>
							{/if}
							<h3 style="font-size: var(--text-lg); font-weight: 700; color: var(--text-primary); margin-bottom: var(--space-2);">{venue.name}</h3>
							<p style="font-size: var(--text-sm); color: var(--text-secondary); margin-bottom: var(--space-2);">{venue.city} • {venue.type.charAt(0).toUpperCase() + venue.type.slice(1)}</p>
							<p style="font-size: var(--text-sm); color: var(--text-muted); margin-bottom: var(--space-3);">{venue.address}</p>
							<p style="font-size: var(--text-sm); color: var(--text-secondary);">{venue.description}</p>
						</button>
					{/each}
				</div>
			</div>
		{:else if selectedVenue}
			<div class="main-container animate-fade-in">
				<div class="card card-featured" style="margin-bottom: var(--space-6);">
					<div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: var(--space-4);">
						<h2 style="font-size: var(--text-2xl); font-weight: 700; color: var(--text-primary);">{selectedVenue.name}</h2>
						{#if selectedVenue.featured}
							<div class="badge-featured">Featured</div>
						{/if}
					</div>
					
					<div style="margin-bottom: var(--space-6);">
						<p style="color: var(--text-secondary); margin-bottom: var(--space-2);"><span style="font-weight: 600;">Type:</span> {selectedVenue.type.charAt(0).toUpperCase() + selectedVenue.type.slice(1)}</p>
						<p style="color: var(--text-secondary); margin-bottom: var(--space-2);"><span style="font-weight: 600;">Location:</span> {selectedVenue.city}</p>
						<p style="color: var(--text-secondary); margin-bottom: var(--space-2);"><span style="font-weight: 600;">Address:</span> {selectedVenue.address}</p>
					</div>
					
					<p style="color: var(--text-primary); margin-bottom: var(--space-6);">{selectedVenue.description}</p>
				</div>

				{#if venueEvents.length > 0}
					<div class="card">
						<h3 style="font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-4);">Events at {selectedVenue.name}</h3>
						<div style="display: flex; flex-direction: column; gap: var(--space-3);">
							{#each venueEvents as event}
								<button 
									onclick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										selectEvent(event.id);
									}}
									class="card"
									style="text-align: left; padding: var(--space-4); border: 1px solid rgba(255, 255, 255, 0.1); cursor: pointer;"
								>
									<h4 style="font-weight: 600; color: var(--text-primary);">{event.title}</h4>
									<p style="color: var(--text-secondary); font-size: var(--text-sm);">{event.date} • {event.price_range}</p>
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{/if}

	{:else if currentView === 'brands'}
		{#if viewMode === 'list'}
			<div class="main-container animate-fade-in">
				<h2 class="page-title gradient-text">Brands</h2>
				
				<div class="featured-grid">
					{#each MOCK_DATA.brands as brand}
						<button 
							onclick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								selectBrand(brand.id);
							}}
							class="card"
						>
							{#if brand.featured}
								<div class="badge-featured" style="margin-bottom: var(--space-3);">Featured</div>
							{/if}
							<h3 style="font-size: var(--text-lg); font-weight: 700; color: var(--text-primary); margin-bottom: var(--space-2);">{brand.name}</h3>
							<p style="font-size: var(--text-sm); color: var(--text-secondary); margin-bottom: var(--space-2);">{brand.type.charAt(0).toUpperCase() + brand.type.slice(1)}</p>
							<p style="font-size: var(--text-sm); color: var(--text-secondary);">{brand.description}</p>
						</button>
					{/each}
				</div>
			</div>
		{:else if selectedBrand}
			<div class="main-container animate-fade-in">
				<div class="card card-featured" style="margin-bottom: var(--space-6);">
					<div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: var(--space-4);">
						<h2 style="font-size: var(--text-2xl); font-weight: 700; color: var(--text-primary);">{selectedBrand.name}</h2>
						{#if selectedBrand.featured}
							<div class="badge-featured">Featured</div>
						{/if}
					</div>
					
					<div style="margin-bottom: var(--space-6);">
						<p style="color: var(--text-secondary); margin-bottom: var(--space-2);"><span style="font-weight: 600;">Type:</span> {selectedBrand.type.charAt(0).toUpperCase() + selectedBrand.type.slice(1)}</p>
					</div>
					
					<p style="color: var(--text-primary); margin-bottom: var(--space-6);">{selectedBrand.description}</p>
				</div>

				{#if brandEvents.length > 0}
					<div class="card">
						<h3 style="font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-4);">Events featuring {selectedBrand.name}</h3>
						<div style="display: flex; flex-direction: column; gap: var(--space-3);">
							{#each brandEvents as event}
								<button 
									onclick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										selectEvent(event.id);
									}}
									class="card"
									style="text-align: left; padding: var(--space-4); border: 1px solid rgba(255, 255, 255, 0.1); cursor: pointer;"
								>
									<h4 style="font-weight: 600; color: var(--text-primary);">{event.title}</h4>
									<p style="color: var(--text-secondary); font-size: var(--text-sm);">{event.venue_name} • {event.city}</p>
									<p style="color: var(--text-muted); font-size: var(--text-sm);">{event.date} • {event.price_range}</p>
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{/if}
	{/if}
</main>