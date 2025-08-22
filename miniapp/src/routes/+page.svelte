<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import * as Button from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Badge from '$lib/components/ui/badge/index.js';
	import LoadingAnimation from '$lib/components/LoadingAnimation.svelte';
	import Events from '$lib/components/Events.svelte';
	import Venues from '$lib/components/Venues.svelte';
	import Brands from '$lib/components/Brands.svelte';
	import BookingWizard from '$lib/components/BookingWizard.svelte';

	interface TelegramWebApp {
		ready(): void;
		initDataUnsafe?: { user?: TelegramUser };
	}

	interface TelegramUser {
		id: number;
		first_name: string;
		last_name?: string;
		username?: string;
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

	let currentView: 'main' | 'events' | 'venues' | 'brands' | 'booking' = $state('main');
	let selectedEventId: string | undefined = $state();
	let selectedEvent: Event | undefined = $state();
	let previousView: string = $state('main');
	let webApp: TelegramWebApp | null = $state(null);
	let userInfo: TelegramUser | null = $state(null);
	let isLoading: boolean = $state(true);
	let error: string | null = $state(null);

	const featuredEvents = [
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

	const availableBrands = [
		{
			id: 'brd_001',
			name: 'Angkor Beer',
			type: 'beer' as const,
			featured: true,
			description: 'Cambodia\'s premium beer brand with crisp, refreshing taste.'
		},
		{
			id: 'brd_002',
			name: 'Hennessy',
			type: 'spirits' as const,
			featured: true,
			description: 'World-renowned cognac for sophisticated evenings.'
		}
	];

	onMount(() => {
		try {
			webApp = window.Telegram?.WebApp;
			if (webApp) {
				webApp.ready();
				userInfo = webApp.initDataUnsafe?.user;
			}

			const startParam = $page.url.searchParams.get('start');
			if (startParam === 'events') {
				currentView = 'events';
			} else if (startParam === 'venues') {
				currentView = 'venues';
			} else if (startParam === 'brands') {
				currentView = 'brands';
			}
		} catch (err) {
			error = 'Failed to initialize mini app';
			console.error('WebApp initialization failed:', err);
		} finally {
			isLoading = false;
		}
	});

	function goToEvents(eventId?: string): void {
		selectedEventId = eventId;
		currentView = 'events';
	}

	function goToVenues(): void {
		currentView = 'venues';
	}

	function goToBrands(): void {
		currentView = 'brands';
	}

	function goToMain(): void {
		selectedEventId = undefined;
		currentView = 'main';
	}

	function handleStartBooking(event: CustomEvent<{event: Event}>) {
		selectedEvent = event.detail.event;
		previousView = currentView;
		currentView = 'booking';
	}

	function goToPreviousBookingView() {
		currentView = previousView;
	}
</script>

{#if isLoading}
	<LoadingAnimation message="Loading Trojeak..." />
{:else if error}
	<div class="flex items-center justify-center min-h-screen">
		<Card.Card class="w-full max-w-md mx-4">
			<Card.CardContent class="p-6 text-center">
				<h2 class="text-xl font-semibold mb-2">Connection Error</h2>
				<p class="text-muted-foreground">{error}</p>
			</Card.CardContent>
		</Card.Card>
	</div>
{:else}
	<div class="container mx-auto p-4 max-w-2xl">
		{#if currentView === 'main'}
			<div class="space-y-8">
				<div class="text-center space-y-4">
					<h1 class="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
						Welcome to Trojeak
					</h1>
					<p class="text-lg text-muted-foreground">Discover Cambodia's best nightlife events and venues</p>
				</div>

				<div class="grid gap-4">
					<Button.Button 
						variant="default" 
						size="lg" 
						class="h-auto p-6 justify-start"
						onclick={() => goToEvents()}
					>
						<div class="flex items-center gap-4 w-full">
							<div class="text-3xl">🎉</div>
							<div class="flex-1 text-left">
								<h3 class="text-xl font-bold">Discover Events</h3>
								<p class="text-sm text-primary-foreground/80">Live music, parties, and entertainment</p>
								<div class="flex items-baseline gap-2 mt-1">
									<span class="text-lg font-bold text-primary-foreground">3</span>
									<span class="text-xs uppercase tracking-wide">Events Available</span>
								</div>
							</div>
							<div class="text-xl">→</div>
						</div>
					</Button.Button>

					<Button.Button 
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
									<span class="text-lg font-bold text-primary">3</span>
									<span class="text-xs uppercase tracking-wide">Venues</span>
								</div>
							</div>
							<div class="text-xl">→</div>
						</div>
					</Button.Button>

					<Button.Button 
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
									<span class="text-lg font-bold text-primary">2</span>
									<span class="text-xs uppercase tracking-wide">Brands</span>
								</div>
							</div>
							<div class="text-xl">→</div>
						</div>
					</Button.Button>
				</div>

				<div class="space-y-6">
					<h2 class="text-2xl font-bold text-center">Featured Events</h2>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						{#each featuredEvents as event}
							<Card.Card class="cursor-pointer hover:shadow-lg transition-shadow" onclick={() => goToEvents(event.id)}>
								<Card.CardHeader>
									<div class="flex justify-between items-start mb-2">
										<Card.CardTitle class="text-lg">{event.title}</Card.CardTitle>
										<Badge.Badge>Featured</Badge.Badge>
									</div>
									<p class="text-sm text-muted-foreground">{event.venue_name}</p>
									<p class="text-sm text-muted-foreground">{event.city}</p>
								</Card.CardHeader>
								<Card.CardContent>
									<p class="text-sm mb-2">{event.description}</p>
									<p class="text-base font-semibold text-primary">{event.price_range}</p>
								</Card.CardContent>
							</Card.Card>
						{/each}
					</div>
				</div>
			</div>
		{:else if currentView === 'events'}
			<Events initialEventId={selectedEventId} on:goBack={goToMain} on:startBooking={handleStartBooking} />
		{:else if currentView === 'venues'}
			<Venues on:goBack={goToMain} />
		{:else if currentView === 'brands'}
			<Brands on:goBack={goToMain} />
		{:else if currentView === 'booking'}
			<BookingWizard 
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
	</div>
{/if}