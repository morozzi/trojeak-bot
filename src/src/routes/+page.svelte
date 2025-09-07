<!-- routes/+page.svelte - Main application page -->
<script lang="ts">
	import { onMount } from 'svelte';
	import type { WebApp } from '@twa-dev/sdk';
	import type { TelegramUser, ViewType } from '$lib/types/components.js';
	import type { Event, Brand, Venue } from '$lib/types/api.js';
	import { events, brandData, cityData, languageData, venueData } from '$lib/data/mockData.js';
	import Loading from '$lib/components/Loading.svelte';
	import Header from '$lib/components/Header.svelte';
	import Home from '$lib/components/Home.svelte';
	import Events from '$lib/components/Events.svelte';
	import Venues from '$lib/components/Venues.svelte';
	import Brands from '$lib/components/Brands.svelte';
	import Booking from '$lib/components/Booking.svelte';

	let webApp: WebApp | null = $state(null);
	let isLoading: boolean = $state(true);
	let error: string = $state('');
	let userInfo: TelegramUser | null = $state(null);
	let currentView: ViewType = $state('home');
	let selectedEventId: string | undefined = $state(undefined);
	let selectedEvent: Event | null = $state(null);
	let selectedVenue: Venue | null = $state(null);
	let previousView: ViewType = $state('home');
	let selectedCity = $state(cityData[0].citysid);
	let selectedLanguage = $state(languageData[0].languagesid);
	let themeParams = $state({
		backgroundColor: '#f9fafb',
		textColor: '#1f2937'
	});

	const featuredEvents = events.filter(event => event.eventfeatured === 1);
	const availableBrands = brandData.filter(brand => brand.brandfeatured === 1);

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
					backgroundColor: WebApp.themeParams.header_bg_color || '#f9fafb',
					textColor: WebApp.themeParams.text_color || '#1f2937'
				};
				WebApp.setHeaderColor(themeParams.backgroundColor);
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
		} catch (err) {
			error = 'Failed to initialize Telegram Web App';
		} finally {
			isLoading = false;
		}
	});

	function goToPage(page: ViewType, eventId?: string): void {
		if (page === 'events') selectedEventId = eventId;
		if (page === 'home') selectedEventId = undefined;
		currentView = page;
		window.scrollTo(0, 0);
	}

	function handleStartBooking(event: CustomEvent<{event: Event}>) {
		selectedEvent = event.detail.event;
		selectedVenue = venueData.find(v => v.venueid === selectedEvent?.venueid) || null;
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
		if (webApp?.shareToStory) {
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
		const action = event.detail.action;
	}

	function handleEventClick(event: CustomEvent<{eventId: string}>) {
		goToPage('events', event.detail.eventId);
	}

	function handleNavigate(event: CustomEvent<{page: string}>) {
		goToPage(event.detail.page as ViewType);
	}

	function handleFooterHeight(event: CustomEvent<{height: number}>) {
		document.documentElement.style.setProperty('--footer-h', `${event.detail.height}px`);
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
			<div class="w-full max-w-2xl mx-auto p-6 bg-card text-card-foreground shadow-sm border rounded-lg">
				<div class="text-center">
					<h2 class="text-xl font-semibold mb-2">Connection Error</h2>
					<p class="text-muted-foreground">{error}</p>
				</div>
			</div>
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
			{#if currentView === 'home'}
				<Home 
					{featuredEvents}
					{selectedCity}
					{selectedLanguage}
					{userInfo}
					on:eventClick={handleEventClick}
					on:navigate={handleNavigate}
					on:footerHeight={handleFooterHeight}
				/>
			{:else if currentView === 'events'}
				<Events 
					initialEventId={selectedEventId} 
					on:goBack={() => goToPage('home')} 
					on:startBooking={handleStartBooking} 
					on:footerHeight={handleFooterHeight}
				/>
			{:else if currentView === 'venues'}
				<Venues 
					on:goBack={() => goToPage('home')} 
					on:goToEvent={handleGoToEvent} 
					on:footerHeight={handleFooterHeight}
				/>
			{:else if currentView === 'brands'}
				<Brands 
					on:goBack={() => goToPage('home')} 
					on:goToEvent={handleGoToEvent} 
					on:footerHeight={handleFooterHeight}
				/>
			{:else if currentView === 'booking'}
				{#if selectedEvent && selectedVenue}
					<Booking 
						event={selectedEvent}
						venue={selectedVenue}
						{availableBrands}
						onComplete={goToPreviousBookingView}
						onCancel={goToPreviousBookingView}
						on:footerHeight={handleFooterHeight}
					/>
				{/if}
			{/if}
		</main>
	{/if}
</div>