<script lang="ts">
	import { onMount } from 'svelte';
	import type { WebApp } from '@twa-dev/sdk';
	import * as Card from '$lib/components/ui/card/index.js';
	import Loading from '$lib/components/Loading.svelte';
	import Header from '$lib/components/Header.svelte';
	import Home from '$lib/components/Home.svelte';
	import Events from '$lib/components/Events.svelte';
	import Venues from '$lib/components/Venues.svelte';
	import Brands from '$lib/components/Brands.svelte';
	import Booking from '$lib/components/Booking.svelte';

	interface TelegramUser {
		id: number;
		first_name: string;
		last_name?: string;
		username?: string;
		photo_url?: string;
	}

	interface Event {
		id: string;
		title: string;
		venue_name: string;
		city: string;
		featured: boolean;
		price_range: string;
		date: string;
		description: string;
	}

	interface Brand {
		id: string;
		name: string;
		type: string;
		featured: boolean;
		description: string;
	}

	let webApp: WebApp | null = $state(null);
	let isLoading: boolean = $state(true);
	let error: string = $state('');
	let userInfo: TelegramUser | null = $state(null);
	let currentView: 'main' | 'events' | 'venues' | 'brands' | 'booking' = $state('main');
	let selectedEventId: string | undefined = $state(undefined);
	let selectedEvent: Event | null = $state(null);
	let previousView: 'main' | 'events' | 'venues' | 'brands' = $state('main');
	let selectedCity = $state('pp');
	let selectedLanguage = $state('en');
	let themeParams = $state({
		backgroundColor: '#f9fafb',
		textColor: '#1f2937'
	});

	const featuredEvents: Event[] = [
		{
			id: 'evt_001', 
			title: 'Friday Night Live',
			venue_name: 'Sky Bar',
			city: 'Phnom Penh',
			featured: true,
			price_range: '$8-15',
			date: 'August 23, 2025',
			description: 'Live music and craft cocktails with city views.'
		},
		{
			id: 'evt_002', 
			title: 'Karaoke Night Special',
			venue_name: 'Golden KTV',
			city: 'Phnom Penh',
			featured: false,
			price_range: '$10-20',
			date: 'August 23, 2025',
			description: 'Private rooms with premium sound system and drink promotions.'
		},
		{
			id: 'evt_003',
			title: 'Weekend Beach Club',
			venue_name: 'Otres Beach Club',
			city: 'Sihanoukville',
			featured: true,
			price_range: '$12-22',
			date: 'August 24, 2025',
			description: 'Beachfront party with live DJ and tropical cocktails.'
		}
	].sort((a, b) => Number(b.featured) - Number(a.featured));

	const availableBrands: Brand[] = [
		{ id: 'brd_001', name: 'Cambodia Lite', type: 'Beer', featured: true, description: 'Local favorite light beer' },
		{ id: 'brd_002', name: 'Cambodia Premium', type: 'Beer', featured: false, description: 'Premium local beer' },
		{ id: 'brd_003', name: 'Tiger Beer', type: 'Beer', featured: true, description: 'International beer brand' }
	];

	onMount(async () => {
		try {
			const WebApp = (await import('@twa-dev/sdk')).default;
			webApp = WebApp;
			
			WebApp.ready();
			WebApp.expand();
			
			const initData = WebApp.initData;
			if (initData) {
				const urlParams = new URLSearchParams(initData);
				const userParam = urlParams.get('user');
				if (userParam) {
					userInfo = JSON.parse(decodeURIComponent(userParam));
				}
			}

			if (WebApp.themeParams) {
				themeParams = {
					backgroundColor: WebApp.themeParams.bg_color || '#f9fafb',
					textColor: WebApp.themeParams.text_color || '#1f2937'
				};
			}

			const urlParams = new URLSearchParams(window.location.search);
			const startParam = urlParams.get('tgWebAppStartParam');
			if (startParam) {
				const [action, id] = startParam.split('_');
				if (action === 'event' && id) {
					selectedEventId = `evt_${id}`;
					currentView = 'events';
				} else if (action === 'venue' && id) {
					currentView = 'venues';
				} else if (action === 'brand' && id) {
					currentView = 'brands';
				}
			}
		} catch (err) {
			error = 'Failed to initialize Telegram Web App';
			console.error('Telegram Web App initialization error:', err);
		} finally {
			isLoading = false;
		}
	});

	function goToPage(page: 'main' | 'events' | 'venues' | 'brands', eventId?: string): void {
		if (page === 'events') selectedEventId = eventId;
		if (page === 'main') selectedEventId = undefined;
		currentView = page;
		window.scrollTo(0, 0);
	}

	function handleStartBooking(event: CustomEvent<{event: Event}>) {
		selectedEvent = event.detail.event;
		previousView = currentView;
		currentView = 'booking';
		window.scrollTo(0, 0);
	}
	
	function handleGoToEvent(event: CustomEvent<{eventId: string}>) {
		goToPage('events', event.detail.eventId);
	}

	function goToPreviousBookingView() {
		currentView = previousView;
		window.scrollTo(0, 0);
	}

	function handleCityChange(event: CustomEvent<{city: string}>) {
		selectedCity = event.detail.city;
	}

	function handleLanguageChange(event: CustomEvent<{language: string}>) {
		selectedLanguage = event.detail.language;
	}

	function handleShareToStory() {
		if (webApp) {
			try {
				webApp.shareToStory('https://trojeak.morozzi.com', {
					text: 'Check out these amazing events in Cambodia! 🇰🇭',
					widget_link: {
						url: 'https://trojeak.morozzi.com',
						name: 'Trojeak Events'
					}
				});
			} catch (err) {
				console.error('Share to story failed:', err);
			}
		}
	}

	function handleAccountAction(event: CustomEvent<{action: string}>) {
		console.log('Account action:', event.detail.action);
	}

	function handleEventClick(event: CustomEvent<{eventId: string}>) {
		goToPage('events', event.detail.eventId);
	}

	function handleNavigate(event: CustomEvent<{page: string}>) {
		goToPage(event.detail.page as 'main' | 'events' | 'venues' | 'brands');
	}
</script>

<div 
	class="min-h-[100svh] bg-background"
	style="--app-footer-h: calc(var(--footer-h, 72px) + env(safe-area-inset-bottom, 0px));"
>
	{#if isLoading}
		<Loading message="Loading Trojeak..." />
	{:else if error}
		<div class="flex items-center justify-center min-h-screen">
			<Card.Card class="w-full max-w-2xl mx-auto">
				<Card.CardContent class="p-6 text-center">
					<h2 class="text-xl font-semibold mb-2">Connection Error</h2>
					<p class="text-muted-foreground">{error}</p>
				</Card.CardContent>
			</Card.Card>
		</div>
	{:else}
		{#if currentView !== 'booking'}
			<Header 
				{userInfo}
				{selectedCity}
				{selectedLanguage}
				on:cityChange={handleCityChange}
				on:languageChange={handleLanguageChange}
				on:shareToStory={handleShareToStory}
				on:accountAction={handleAccountAction}
			/>
		{/if}

		<main class="mx-auto w-full max-w-2xl px-4 pt-0 pb-[var(--app-footer-h)] mb-8">
			{#if currentView === 'main'}
				<Home 
					{featuredEvents}
					{selectedCity}
					{selectedLanguage}
					{userInfo}
					on:eventClick={handleEventClick}
					on:navigate={handleNavigate}
				/>
			{:else if currentView === 'events'}
				<Events initialEventId={selectedEventId} on:goBack={() => goToPage('main')} on:startBooking={handleStartBooking} />
			{:else if currentView === 'venues'}
				<Venues on:goBack={() => goToPage('main')} on:goToEvent={handleGoToEvent} />
			{:else if currentView === 'brands'}
				<Brands on:goBack={() => goToPage('main')} on:goToEvent={handleGoToEvent} />
			{:else if currentView === 'booking'}
				<Booking 
					event={{
						...selectedEvent,
						venue_id: 'ven_001',
						brands: ['brd_001', 'brd_002']
					}}
					availableBrands={availableBrands}
					onComplete={goToPreviousBookingView}
					onCancel={goToPreviousBookingView}
				/>
			{/if}
		</main>
	{/if}
</div>