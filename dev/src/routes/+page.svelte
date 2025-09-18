<!-- routes/+page.svelte - Main application page -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import type { WebApp } from '@twa-dev/sdk';
	import type { Event, Venue } from '$lib/types/api.js';
	import type { ViewType } from '$lib/types/components.js';
	import { userStore, userActions } from '$lib/stores/user.js';
	import { appStore, appActions } from '$lib/stores/app.js';
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

	$effect(() => {
		if ($userStore.initData && !$userStore.userData && !$userStore.userError) {
			fetch(`/api/user.php?_auth=${encodeURIComponent($userStore.initData)}`)
				.then(response => response.json())
				.then(data => {
					userActions.setUserData(data);
					userActions.setUserDataLoaded(true);
					queryClient.invalidateQueries({ queryKey: ['events'] });
				})
				.catch(err => {
					userActions.setUserError(err.message);
					userActions.setUserDataLoaded(true);
				});
		}
	});

	$effect(() => {
		if ($appStore.webApp) {
			$appStore.webApp.onEvent('backButtonClicked', () => {
				if ($appStore.canGoBack) {
					appActions.goBack();
				}
			});

			if ($appStore.canGoBack) {
				$appStore.webApp.BackButton.show();
			} else {
				$appStore.webApp.BackButton.hide();
			}
		}
	});

	onMount(async () => {
		try {
			const WebApp = (await import('@twa-dev/sdk')).default;
			appActions.setWebApp(WebApp);
			
			WebApp.ready();
			WebApp.expand();
			
			userActions.setInitData(WebApp.initData);
			
			appActions.setThemeFromWebApp();
			if (WebApp.themeParams?.header_bg_color) {
				WebApp.setHeaderColor($appStore.backgroundColor);
			}
			
			const urlParams = new URLSearchParams(window.location.search);
			const startParam = urlParams.get('start');
			appActions.handleDeepLink(startParam || undefined);
			
		} catch (err) {
			appActions.setError('Failed to initialize Telegram Web App');
		} finally {
			appActions.setLoading(false);
		}
	});

	function handleStartBooking(event: CustomEvent<{event: Event}>) {
		appActions.setSelectedEvent(event.detail.event);
		appActions.startBooking(event.detail.event.eventid.toString());
		appActions.navigate('booking-step-1');
		window.scrollTo(0, 0);
	}
	
	function handleGoToEvent(event: CustomEvent<{eventId: string}>) {
		appActions.setSelectedEventId(event.detail.eventId);
		appActions.navigate('events-detail');
		window.scrollTo(0, 0);
	}

	function handleCityChange(event: CustomEvent<{city: string}>) {
		userActions.setPreference('city', event.detail.city);
		queryClient.invalidateQueries({ queryKey: ['events'] });
		queryClient.invalidateQueries({ queryKey: ['venues'] });
	}

	function handleLanguageChange(event: CustomEvent<{language: string}>) {
		userActions.setPreference('language', event.detail.language);
		queryClient.invalidateQueries({ queryKey: ['common'] });
		queryClient.invalidateQueries({ queryKey: ['events'] });
		queryClient.invalidateQueries({ queryKey: ['venues'] });
	}

	function handleShareToStory() {
		if ($appStore.webApp?.shareToStory) {
			try {
				$appStore.webApp.shareToStory('https://trojeak.morozzi.com', {
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

	function handleNavigate(event: CustomEvent<{view: string; eventId?: string; venueId?: string; brandId?: string}>) {
		const { view, eventId, venueId, brandId } = event.detail;
		
		if (eventId) appActions.setSelectedEventId(eventId);
		if (venueId) appActions.setSelectedVenueId(venueId);
		if (brandId) appActions.setSelectedBrandId(brandId);
		
		appActions.navigate(view as ViewType);
		window.scrollTo(0, 0);
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
		{#if $appStore.isLoading}
			<Loading message="Loading Trojeak..." />
		{:else if $appStore.error}
			<div class="flex items-center justify-center min-h-screen">
				<div class="w-full max-w-2xl mx-auto p-6 bg-card text-card-foreground shadow-sm border rounded-lg">
					<div class="text-center">
						<h2 class="text-xl font-semibold mb-2">Connection Error</h2>
						<p class="text-muted-foreground">{$appStore.error}</p>
					</div>
				</div>
			</div>
		{:else if $userStore.isUserDataLoaded}
			{#if !$appStore.currentView.startsWith('booking-step-')}
				<Header 
					on:cityChange={handleCityChange}
					on:languageChange={handleLanguageChange}
					on:shareToStory={handleShareToStory}
					on:accountAction={handleAccountAction}
				/>
			{/if}

			<main class="mx-auto w-full max-w-2xl px-4 pt-0 pb-[var(--app-footer-h)] mb-8">
				{#if $appStore.currentView === 'home'}
					<Home 
						on:goToEvent={handleGoToEvent}
						on:navigate={handleNavigate}
						on:footerHeight={handleFooterHeight}
					/>
				{:else if $appStore.currentView.startsWith('events-')}
					<Events 
						initialEventId={$appStore.selectedEventId} 
						on:navigate={handleNavigate}
						on:goToEvent={handleGoToEvent}
						on:startBooking={handleStartBooking} 
						on:footerHeight={handleFooterHeight}
					/>
				{:else if $appStore.currentView.startsWith('venues-')}
					<Venues 
						on:navigate={handleNavigate}
						on:goToEvent={handleGoToEvent} 
						on:footerHeight={handleFooterHeight}
					/>
				{:else if $appStore.currentView.startsWith('brands-')}
					<Brands 
						on:navigate={handleNavigate}
						on:goToEvent={handleGoToEvent} 
						on:footerHeight={handleFooterHeight}
					/>
				{:else if $appStore.currentView.startsWith('booking-step-')}
					{#if $appStore.selectedEvent && $appStore.selectedVenue}
						<Booking 
							event={$appStore.selectedEvent}
							venue={$appStore.selectedVenue}
							on:navigate={handleNavigate}
							on:footerHeight={handleFooterHeight}
						/>
					{/if}
				{/if}
			</main>
		{:else}
			<Loading message="Loading user preferences..." />
		{/if}
	</div>
</QueryClientProvider>