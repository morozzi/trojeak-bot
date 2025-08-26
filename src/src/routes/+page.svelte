<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import * as Button from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Badge from '$lib/components/ui/badge/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Separator from '$lib/components/ui/separator/index.js';
	import * as Skeleton from '$lib/components/ui/skeleton/index.js';
	import * as AspectRatio from '$lib/components/ui/aspect-ratio/index.js';
	import { Share2 } from '@lucide/svelte';
	import LoadingAnimation from '$lib/components/LoadingAnimation.svelte';
	import Events from '$lib/components/Events.svelte';
	import Venues from '$lib/components/Venues.svelte';
	import Brands from '$lib/components/Brands.svelte';
	import BookingWizard from '$lib/components/BookingWizard.svelte';

	interface TelegramUser {
		id: number;
		first_name: string;
		last_name?: string;
		username?: string;
		photo_url?: string;
	}

	interface ThemeParams {
		header_bg_color?: string;
	}

	interface TelegramWebApp {
		ready(): void;
		expand(): void;
		setHeaderColor(color: string): void;
		themeParams: ThemeParams;
		initDataUnsafe?: { user?: TelegramUser };
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

	let headerTheme = $state({
		backgroundColor: '#f9fafb',
		textColor: '#1f2937'
	});

	let selectedCity = $state("pp");
	let selectedLanguage = $state("en");

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
			description: 'Cambodia\'s premium beer.'
		},
		{
			id: 'brd_002',
			name: 'Hennessy',
			type: 'spirits' as const,
			featured: true,
			description: 'World-renowned cognac.'
		}
	];

	const userInitials = $derived(userInfo 
		? userInfo.first_name[0] + (userInfo.last_name?.[0] || '')
		: "JD");

	onMount(() => {
		try {
			webApp = window.Telegram?.WebApp;
			if (webApp) {
				webApp.ready();
				webApp.expand();
				userInfo = webApp.initDataUnsafe?.user;

				if (webApp.themeParams) {
					headerTheme = {
						backgroundColor: webApp.themeParams.header_bg_color || '#f9fafb',
						textColor: '#1f2937'
					};
					webApp.setHeaderColor(headerTheme.backgroundColor);
				}
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

	function goToPage(page: typeof currentView, eventId?: string): void {
		if (page === 'events') selectedEventId = eventId;
		if (page === 'main') selectedEventId = undefined;
		currentView = page;
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
		<Card.Card class="w-full max-w-2xl mx-auto">
			<Card.CardContent class="p-6 text-center">
				<h2 class="text-xl font-semibold mb-2">Connection Error</h2>
				<p class="text-muted-foreground">{error}</p>
			</Card.CardContent>
		</Card.Card>
	</div>
{:else}
	<div class="container mx-auto p-4 max-w-2xl">
		<div class="flex items-center justify-between py-4">
			<div class="flex items-center gap-3">
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Avatar.Root {...props} class="cursor-pointer hover:opacity-80 transition-opacity">
								{#if userInfo?.photo_url}
									<Avatar.Image src={userInfo.photo_url} alt="User" />
								{/if}
								<Avatar.Fallback>{userInitials}</Avatar.Fallback>
							</Avatar.Root>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content class="w-56" align="start">
						<DropdownMenu.Label>My Account</DropdownMenu.Label>
						<DropdownMenu.Separator />
						<DropdownMenu.Item onclick={() => {}}>
							⚙️ Account Settings
						</DropdownMenu.Item>
						<DropdownMenu.Item onclick={() => {}}>
							📢 Channel Subscription
						</DropdownMenu.Item>
						<DropdownMenu.Item onclick={() => {}}>
							📋 My Bookings
						</DropdownMenu.Item>
						<DropdownMenu.Separator />
						<DropdownMenu.Item onclick={() => {}}>
							💬 Support
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>

				<Select.Root type="single" bind:value={selectedCity}>
					<Select.Trigger class="w-20">
						{selectedCity.toUpperCase()}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="pp">Phnom Penh</Select.Item>
						<Select.Item value="shv">Sihanoukville</Select.Item>
						<Select.Item value="sr">Siem Reap</Select.Item>
						<Select.Item value="btb">Battambang</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>

			<Button.Button variant="ghost" size="sm" onclick={() => {}}>📱</Button.Button>

			<div class="flex items-center gap-3">
				<Select.Root type="single" bind:value={selectedLanguage}>
					<Select.Trigger class="w-16">
						{selectedLanguage === "en" ? "🇺🇸" : "🇰🇭"}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="en">🇺🇸 English</Select.Item>
						<Select.Item value="kh">🇰🇭 ភាសាខ្មែរ</Select.Item>
					</Select.Content>
				</Select.Root>

				<Button.Button variant="ghost" size="sm" onclick={() => {}}>
					<Share2 size={16} />
				</Button.Button>
			</div>
		</div>

		<Separator.Separator />

		<div class="pt-6 pb-20">
			{#if currentView === 'main'}
				<div class="space-y-8">
					<div class="text-center space-y-4">
						<h1 class="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
							Let's Trojeak
						</h1>
						<p class="text-lg text-muted-foreground">🇰🇭 Cambodia #1 event app</p>
					</div>

					<div class="grid grid-cols-1 gap-4">
						<Button.Button 
							variant="outline" 
							size="lg" 
							class="h-auto p-6 justify-start"
							onclick={() => goToPage('events')}
						>
							<div class="flex items-center gap-4 w-full">
								<div class="text-3xl">🎉</div>
								<div class="flex-1 text-left">
									<h3 class="text-xl font-bold">Discover Events</h3>
									<p class="text-sm text-muted-foreground">Live music, parties, and entertainment</p>
									<div class="flex items-baseline gap-2 mt-1">
										<span class="text-lg font-bold text-primary">3</span>
										<span class="text-xs uppercase tracking-wide">Events</span>
									</div>
								</div>
								<div class="text-xl">→</div>
							</div>
						</Button.Button>

						<Button.Button 
							variant="outline" 
							size="lg" 
							class="h-auto p-6 justify-start"
							onclick={() => goToPage('venues')}
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
							onclick={() => goToPage('brands')}
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
							{#if featuredEvents.length === 0}
								<Card.Card>
									<Skeleton.Skeleton class="h-16 w-full" />
									<Card.CardContent class="p-4 space-y-2">
										<Skeleton.Skeleton class="h-4 w-full" />
										<Skeleton.Skeleton class="h-4 w-3/4" />
										<Skeleton.Skeleton class="h-4 w-1/2" />
									</Card.CardContent>
								</Card.Card>
								<Card.Card>
									<Skeleton.Skeleton class="h-16 w-full" />
									<Card.CardContent class="p-4 space-y-2">
										<Skeleton.Skeleton class="h-4 w-full" />
										<Skeleton.Skeleton class="h-4 w-3/4" />
										<Skeleton.Skeleton class="h-4 w-1/2" />
									</Card.CardContent>
								</Card.Card>
							{:else}
								{#each featuredEvents as event}
									<Card.Card class="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onclick={() => goToPage('events', event.id)}>
										<AspectRatio.Root ratio={16/4}>
											<div class="bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center font-medium h-full">
												[Featured Event Banner - Full Width]
											</div>
										</AspectRatio.Root>
										
										<Card.CardContent class="p-4 space-y-2">
											<div class="text-sm text-muted-foreground">
												📅 August 24, 2025 • 📍 {event.city}
											</div>
											
											<div class="text-sm">
												🏢 {event.venue_name}
											</div>
											
											<div class="text-sm">🎵 Artist Name</div>
											
											<div class="flex gap-2 items-center">
												<Avatar.Root class="w-8 h-8 rounded-lg">
													<Avatar.Fallback class="rounded-lg bg-muted"></Avatar.Fallback>
												</Avatar.Root>
												<Avatar.Root class="w-8 h-8 rounded-lg">
													<Avatar.Fallback class="rounded-lg bg-muted"></Avatar.Fallback>
												</Avatar.Root>
												<Avatar.Root class="w-8 h-8 rounded-lg">
													<Avatar.Fallback class="rounded-lg bg-muted"></Avatar.Fallback>
												</Avatar.Root>
												<span class="text-sm text-muted-foreground ml-2">Brand Logos</span>
											</div>
											
											<div class="text-sm">💰 12+2 Schema</div>
										</Card.CardContent>
									</Card.Card>
								{/each}
							{/if}
						</div>
					</div>
				</div>

				<div class="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t z-40">
					<div class="container mx-auto max-w-2xl">
						<div class="flex justify-around py-3">
							<Button.Button variant="ghost" size="sm" onclick={() => goToPage('events')} class="flex flex-col items-center gap-1">
								<span class="text-xl">🎉</span>
								<span class="text-xs">Events</span>
							</Button.Button>
							
							<Button.Button variant="ghost" size="sm" onclick={() => goToPage('venues')} class="flex flex-col items-center gap-1">
								<span class="text-xl">🏢</span>
								<span class="text-xs">Venues</span>
							</Button.Button>
							
							<Button.Button variant="ghost" size="sm" onclick={() => goToPage('brands')} class="flex flex-col items-center gap-1">
								<span class="text-xl">🍺</span>
								<span class="text-xs">Brands</span>
							</Button.Button>
						</div>
					</div>
				</div>
			{:else if currentView === 'events'}
				<Events initialEventId={selectedEventId} on:goBack={() => goToPage('main')} on:startBooking={handleStartBooking} />
			{:else if currentView === 'venues'}
				<Venues on:goBack={() => goToPage('main')} />
			{:else if currentView === 'brands'}
				<Brands on:goBack={() => goToPage('main')} />
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
	</div>
{/if}