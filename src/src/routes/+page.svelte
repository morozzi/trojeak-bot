<script lang="ts">
	import { onMount } from 'svelte';
	import type { WebApp } from '@twa-dev/sdk';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Button from '$lib/components/ui/button/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as Skeleton from '$lib/components/ui/skeleton/index.js';
	import * as AspectRatio from '$lib/components/ui/aspect-ratio/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Separator from '$lib/components/ui/separator/index.js';
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
	];

	const availableBrands: Brand[] = [
		{
			id: 'brd_001',
			name: 'Angkor Beer',
			type: 'beer',
			featured: true,
			description: 'Cambodia\'s premium beer.'
		},
		{
			id: 'brd_002',
			name: 'Hennessy',
			type: 'spirits', 
			featured: true,
			description: 'World-renowned cognac.'
		}
	];

	const userInitials = $derived(userInfo ? 
		userInfo.first_name[0] + (userInfo.last_name?.[0] || '') : 
		'JD'
	);

	onMount(() => {
		try {
			webApp = window.Telegram?.WebApp;
			if (webApp) {
				webApp.ready();
				webApp.expand();
				userInfo = webApp.initDataUnsafe?.user;

				if (webApp.themeParams) {
					themeParams = {
						backgroundColor: webApp.themeParams.header_bg_color || '#f9fafb',
						textColor: '#1f2937'
					};
					webApp.setHeaderColor(themeParams.backgroundColor);
				}
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
			error = 'Failed to initialize mini app';
			console.error('WebApp initialization failed:', err);
		} finally {
			isLoading = false;
		}
	});

	function goToPage(page: 'main' | 'events' | 'venues' | 'brands', eventId?: string): void {
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
	<div class="container mx-auto px-4 pt-4 pb-32 max-w-2xl">
		<div class="flex items-center justify-between pb-4">
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

		{#if currentView === 'main'}
			<div class="space-y-8 pt-6">
				<div class="text-center space-y-4">
					<h1 class="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
						Let's Trojeak
					</h1>
					<p class="text-lg text-muted-foreground">🇰🇭 Cambodia #1 event app</p>
				</div>

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
							<Card.Card class="py-4 pb-0 gap-0 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onclick={() => goToPage('events', event.id)}>
								<Card.CardHeader class="gap-0 pb-4">
									<Card.CardTitle class="text-lg font-semibold">{event.title}</Card.CardTitle>
								</Card.CardHeader>
								
								<AspectRatio.Root class="pb-2" ratio={16/9}>
									<div class="bg-gray-200 text-gray-600 text-center font-medium h-full flex items-center justify-center">
										Featured Event Banner
									</div>
								</AspectRatio.Root>
								
								<Card.CardContent class="p-4 pb-4 space-y-4">
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

	<div class="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t z-40">
		<div class="container mx-auto max-w-2xl">
			<div class="flex justify-around py-8">
				<Button.Button variant="outline" size="sm" onclick={() => goToPage('events')} class="flex flex-col items-center gap-1 px-4 py-2">
					<span class="text-sm font-medium">Events</span>
				</Button.Button>
				
				<Button.Button variant="outline" size="sm" onclick={() => goToPage('venues')} class="flex flex-col items-center gap-1 px-4 py-2">
					<span class="text-sm font-medium">Venues</span>
				</Button.Button>
				
				<Button.Button variant="outline" size="sm" onclick={() => goToPage('brands')} class="flex flex-col items-center gap-1 px-4 py-2">
					<span class="text-sm font-medium">Brands</span>
				</Button.Button>
			</div>
		</div>
	</div>
{/if}