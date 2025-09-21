<!-- routes/+page.svelte - Main application page -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import type { WebApp } from '@twa-dev/sdk';
	import type { Event, Venue } from '$lib/types/api.js';
	import type { ViewType, BookingAction } from '$lib/types/components.js';
	import { userStore, userActions } from '$lib/stores/user.js';
	import { appStore, appActions } from '$lib/stores/app.js';
	import Loading from '$lib/components/Loading.svelte';
	import Header from '$lib/components/Header.svelte';
	import Home from '$lib/components/Home.svelte';
	import Events from '$lib/components/Events.svelte';
	import Venues from '$lib/components/Venues.svelte';
	import Brands from '$lib/components/Brands.svelte';
	import Booking from '$lib/components/Booking.svelte';
	import Navigation from '$lib/components/Navigation.svelte';

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 5 * 60 * 1000,
				gcTime: 10 * 60 * 1000,
			},
		},
	});

	let currentFooterEl: HTMLElement | undefined = $state();
	let footerVisible = $state(true);
	let canProceedBooking = $state(false);
	let canCompleteBooking = $state(false);
	let isBookingProcessing = $state(false);

	function updateFooterHeight() {
		const height = currentFooterEl.offsetHeight;
		document.documentElement.style.setProperty('--footer-h', `${height}px`);
	}

	$effect(() => {
		if (currentFooterEl) {
			updateFooterHeight();
			const ro = new ResizeObserver(updateFooterHeight);
			ro.observe(currentFooterEl);
			return () => ro.disconnect();
		}
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
			
			if (WebApp.themeParams?.header_bg_color) {
				WebApp.setHeaderColor(WebApp.themeParams.header_bg_color);
			}
			
			WebApp.BackButton.onClick(() => {
				if ($appStore.canGoBack) {
					appActions.goBack();
				}
			});
			
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

	function handleNavigate(event: CustomEvent<{view: ViewType, eventId?: string, venueId?: string, brandId?: string}>) {
		const { view, eventId, venueId, brandId } = event.detail;
			
		if (view === 'events-detail' && eventId) {
    	const isFromHome = $appStore.currentView === 'home';
    	const cacheKey = isFromHome 
        ? ['events', $userStore.selectedLanguage, $userStore.selectedCity, 'featured']
        : ['events', $userStore.selectedLanguage, $userStore.selectedCity];
    
    	const foundEvent = queryClient.getQueryData(cacheKey)?.find(e => e.eventid.toString() === eventId);
    	if (foundEvent) appActions.setSelectedEvent(foundEvent);

		} else if (view === 'venues-detail' && venueId) {
			const foundVenue = queryClient.getQueryData(['venues', $userStore.selectedLanguage, $userStore.selectedCity])?.find(v => v.venueid.toString() === venueId);
			if (foundVenue) appActions.setSelectedVenue(foundVenue);
		} else if (view === 'brands-detail' && brandId) {
			const foundBrand = queryClient.getQueryData(['brands'])?.find(b => b.brandid.toString() === brandId);
			if (foundBrand) appActions.setSelectedBrand(foundBrand);
		}
		
		appActions.navigate(view);
		window.scrollTo(0, 0);
	}

	function handleGoBack() {
		appActions.goBack();
	}

	function handleBookingAction(event: CustomEvent<{action: BookingAction}>) {
		const { action } = event.detail;
		
		if (action === 'prev') {
			if ($appStore.bookingState && $appStore.bookingState.currentStep > 1) {
				appActions.updateBookingState({ currentStep: $appStore.bookingState.currentStep - 1 });
			}
		} else if (action === 'next') {
			if ($appStore.bookingState && $appStore.bookingState.currentStep < 4) {
				appActions.updateBookingState({ currentStep: $appStore.bookingState.currentStep + 1 });
			}
		} else if (action === 'cancel') {
			appActions.clearBooking();
			appActions.goBack();
		} else if (action === 'complete') {
			isBookingProcessing = true;
			
			setTimeout(() => {
				isBookingProcessing = false;
				alert('Booking completed!');
				appActions.clearBooking();
				appActions.goBack();
			}, 2000);
		}
	}

	function handleFooterVisibilityChange(event: CustomEvent<{visible: boolean}>) {
		footerVisible = event.detail.visible;
	}
	
	function handleFooterReady(event: CustomEvent<{element: HTMLElement}>) {
		currentFooterEl = event.detail.element;
	}

	function handleValidationChange(event: CustomEvent<{canProceed: boolean; canComplete: boolean; isProcessing: boolean}>) {
		const { canProceed, canComplete, isProcessing } = event.detail;
		canProceedBooking = canProceed;
		canCompleteBooking = canComplete;
		isBookingProcessing = isProcessing;
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
						on:navigate={handleNavigate}
					/>
				{:else if $appStore.currentView.startsWith('events-')}
					<Events 
						initialEventId={$appStore.selectedEventId} 
						on:navigate={handleNavigate}
						on:startBooking={handleStartBooking} 
					/>
				{:else if $appStore.currentView.startsWith('venues-')}
					<Venues 
						on:navigate={handleNavigate}
					/>
				{:else if $appStore.currentView.startsWith('brands-')}
					<Brands 
						on:navigate={handleNavigate}
					/>
				{:else if $appStore.currentView.startsWith('booking-step-')}
					{#if $appStore.selectedEvent}
						<Booking 
							event={$appStore.selectedEvent}
							on:navigate={handleNavigate}
							on:footerVisibilityChange={handleFooterVisibilityChange}
							on:validationChange={handleValidationChange}
						/>
					{/if}
				{/if}
			</main>

			<Navigation 
				currentView={$appStore.currentView}
				canGoBack={$appStore.canGoBack}
				bookingStep={$appStore.bookingState?.currentStep}
				isBookingProcessing={isBookingProcessing}
				canProceedBooking={canProceedBooking}
				canCompleteBooking={canCompleteBooking}
				footerVisible={footerVisible}
				on:goBack={handleGoBack}
				on:navigate={handleNavigate}
				on:bookingAction={handleBookingAction}
				on:footerReady={handleFooterReady}
			/>
		{:else}
			<Loading message="Loading user preferences..." />
		{/if}
	</div>
</QueryClientProvider>