<!-- routes/+page.svelte - Main application page -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { QueryClient, QueryClientProvider, createQuery } from '@tanstack/svelte-query';
	import type { WebApp } from '@twa-dev/sdk';
	import type { TelegramUser, ViewType } from '$lib/types/components.js';
	import type { Event, Brand, Venue } from '$lib/types/api.js';
	import Loading from '$lib/components/Loading.svelte';
	import Header from '$lib/components/Header.svelte';
	import Home from '$lib/components/Home.svelte';
	import Events from '$lib/components/Events.svelte';
	import Venues from '$lib/components/Venues.svelte';
	import Brands from '$lib/components/Brands.svelte';
	import Booking from '$lib/components/Booking.svelte';

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 5 * 60 * 1000,
				gcTime: 10 * 60 * 1000,
			},
		},
	});

	let webApp: WebApp | null = $state(null);
	let isLoading: boolean = $state(true);
	let error: string = $state('');
	let userInfo: TelegramUser | null = $state(null);
	let currentView: ViewType = $state('home');
	let selectedEventId: string | undefined = $state(undefined);
	let selectedEvent: Event | null = $state(null);
	let selectedVenue: Venue | null = $state(null);
	let previousView: ViewType = $state('home');
	let initData = $state('');
	let userSelectedCity = $state<string | null>(null);
	let userSelectedLanguage = $state<string | null>(null);
	let themeParams = $state({
		backgroundColor: '#f9fafb',
		textColor: '#1f2937'
	});

	const userQuery = createQuery(() => ({
	queryKey: ['user', initData],
	queryFn: async () => {
		const response = await fetch(`/api/user.php?_auth=${encodeURIComponent(initData)}`);
		if (!response.ok) throw new Error('Failed to fetch user');
		return response.json();
	},
	enabled: !!initData
}));

	const selectedLanguage = $derived(
		userSelectedLanguage || 
		(userQuery?.data?.success && userQuery.data.user ? userQuery.data.user.language : null) ||
		(userQuery?.error && webApp?.initDataUnsafe?.user?.language_code) ||
		'en'
	);

	const selectedCity = $derived(
		userSelectedCity ||
		(userQuery?.data?.success && userQuery.data.user ? 
			(userQuery.data.user.cityid === 0 ? '1' : userQuery.data.user.cityid.toString()) : null) ||
		'1'
	);

	onMount(async () => {
		try {
			const WebApp = (await import('@twa-dev/sdk')).default;
			webApp = WebApp;
			
			WebApp.ready();
			WebApp.expand();
			
			initData = WebApp.initData;
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
		selectedVenue = null;
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
		userSelectedCity = event.detail.city;
		queryClient.invalidateQueries({ queryKey: ['events'] });
		queryClient.invalidateQueries({ queryKey: ['venues'] });
	}

	function handleLanguageChange(event: CustomEvent<{language: string}>) {
		userSelectedLanguage = event.detail.language;
		queryClient.invalidateQueries({ queryKey: ['common'] });
		queryClient.invalidateQueries({ queryKey: ['events'] });
		queryClient.invalidateQueries({ queryKey: ['venues'] });
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

<QueryClientProvider client={queryClient}>
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
			<!-- DEBUG INFO - Remove after testing -->
	<div class="fixed top-0 left-0 w-full bg-red-100 p-2 text-xs z-50">
		<div>initData: {initData ? 'Present' : 'Missing'}</div>
		<div>userQuery: {userQuery ? 'Created' : 'Not created'}</div>
		<div>Query data: {userQuery?.data ? JSON.stringify(userQuery.data) : 'No data'}</div>
		<div>Query error: {userQuery?.error ? userQuery.error.message : 'No error'}</div>
		<div>selectedLanguage: {selectedLanguage}</div>
		<div>selectedCity: {selectedCity}</div>
	</div>
	<!-- END DEBUG -->
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
						{selectedCity}
						{selectedLanguage}
						{userInfo}
						on:eventClick={handleEventClick}
						on:navigate={handleNavigate}
						on:footerHeight={handleFooterHeight}
					/>
				{:else if currentView === 'events'}
					<Events 
						{selectedCity}
						{selectedLanguage}
						initialEventId={selectedEventId} 
						on:goBack={() => goToPage('home')} 
						on:startBooking={handleStartBooking} 
						on:footerHeight={handleFooterHeight}
					/>
				{:else if currentView === 'venues'}
					<Venues 
						{selectedCity}
						{selectedLanguage}
						on:goBack={() => goToPage('home')} 
						on:goToEvent={handleGoToEvent} 
						on:footerHeight={handleFooterHeight}
					/>
				{:else if currentView === 'brands'}
					<Brands 
						{selectedCity}
						{selectedLanguage}
						on:goBack={() => goToPage('home')} 
						on:goToEvent={handleGoToEvent} 
						on:footerHeight={handleFooterHeight}
					/>
				{:else if currentView === 'booking'}
					{#if selectedEvent}
						<Booking 
							event={selectedEvent}
							venue={selectedVenue}
							onComplete={goToPreviousBookingView}
							onCancel={goToPreviousBookingView}
							on:footerHeight={handleFooterHeight}
						/>
					{/if}
				{/if}
			</main>
		{/if}
	</div>
</QueryClientProvider>