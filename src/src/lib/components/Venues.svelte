<script lang="ts">
	import * as Button from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Badge from '$lib/components/ui/badge/index.js';
	import * as AspectRatio from '$lib/components/ui/aspect-ratio/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as Skeleton from '$lib/components/ui/skeleton/index.js';
	import { createEventDispatcher } from 'svelte';

	interface Venue {
		id: string;
		name: string;
		type: string;
		city: string;
		address: string;
		featured: boolean;
		description: string;
	}

	const dispatch = createEventDispatcher<{
		goBack: void;
	}>();

	let viewMode: 'list' | 'detail' = $state('list');
	let selectedVenueId: string | null = $state(null);

	const venues: Venue[] = [
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
		},
		{
			id: 'ven_004',
			name: 'Temple Club',
			type: 'club',
			city: 'Siem Reap',
			address: 'Pub Street, Siem Reap',
			featured: false,
			description: 'Historic venue with traditional Khmer architecture and modern amenities.'
		}
	].sort((a, b) => Number(b.featured) - Number(a.featured));

	function selectVenue(venueId: string): void {
		selectedVenueId = venueId;
		viewMode = 'detail';
		window.scrollTo(0, 0);
	}

	function goToList(): void {
		viewMode = 'list';
		selectedVenueId = null;
		window.scrollTo(0, 0);
	}

	function goBack(): void {
		dispatch('goBack');
	}

	function goToEvent(eventId: string): void {
		// Navigate to specific event
		console.log('Navigate to event:', eventId);
	}
</script>

<div class="space-y-8">
	{#if viewMode === 'list'}
		<div class="space-y-4">
			<h1 class="text-3xl font-bold">Venues</h1>
		</div>
		
		<div class="grid gap-4">
			{#if venues.length === 0}
				<Card.Card>
					<Skeleton.Skeleton class="h-16 w-full" />
					<Card.CardContent class="p-4 space-y-2">
						<Skeleton.Skeleton class="h-4 w-full" />
						<Skeleton.Skeleton class="h-4 w-3/4" />
						<Skeleton.Skeleton class="h-4 w-1/2" />
					</Card.CardContent>
				</Card.Card>
			{:else}
				{#each venues as venue}
					<Card.Card class="py-4 pb-0 gap-0 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onclick={() => selectVenue(venue.id)}>
						<Card.CardHeader class="gap-0 pb-4">
							<div class="flex justify-between items-center">
								<div class="flex items-center gap-2">
									<Card.CardTitle class="text-lg font-semibold">{venue.name}</Card.CardTitle>
									<Badge.Badge variant="secondary">{venue.type.toUpperCase()}</Badge.Badge>
								</div>
								<div class="flex gap-2">
									{#if venue.featured}
										<Badge.Badge>Featured</Badge.Badge>
									{/if}
								</div>
							</div>
						</Card.CardHeader>
						
						{#if venue.featured}
							<AspectRatio.Root class="pb-2" ratio={16/9}>
								<div class="bg-gray-200 text-gray-600 text-center font-medium h-full flex items-center justify-center">
									Featured Venue Banner
								</div>
							</AspectRatio.Root>
						{/if}

						<Card.CardContent class="p-4 pb-4 space-y-4">
							<div class="text-sm text-muted-foreground">
								📍 {venue.address}
							</div>

							<div class="text-sm text-muted-foreground">
								🏙️ {venue.city}
							</div>

							<div class="text-sm">
								🏢 {venue.type.toUpperCase()}
							</div>

							<p>{venue.description}</p>
						</Card.CardContent>
					</Card.Card>
				{/each}
			{/if}
		</div>
	{:else if viewMode === 'detail' && selectedVenueId}
		{@const selectedVenue = venues.find(v => v.id === selectedVenueId)}
		{#if selectedVenue}
			<div class="space-y-8">
				{#if selectedVenue.featured}
					<AspectRatio.Root class="pb-2" ratio={16/9}>
						<div class="bg-gray-200 text-gray-600 text-center font-medium h-full flex items-center justify-center">
							Featured Venue Banner
						</div>
					</AspectRatio.Root>
				{/if}

				<Card.Card>
					<Card.CardHeader>
						<h1 class="text-3xl font-bold">{selectedVenue.name}</h1>
						<div class="flex gap-2">
							<Badge.Badge variant="secondary">{selectedVenue.type.toUpperCase()}</Badge.Badge>
							{#if selectedVenue.featured}
								<Badge.Badge>Featured</Badge.Badge>
							{/if}
						</div>
					</Card.CardHeader>
					<Card.CardContent class="p-6 space-y-4">
						<div class="space-y-2">
							<p class="text-sm text-muted-foreground">📍 {selectedVenue.address}</p>
							<p class="text-sm text-muted-foreground">🏙️ {selectedVenue.city}</p>
						</div>
						<p>{selectedVenue.description}</p>
					</Card.CardContent>
				</Card.Card>

				<h3 class="text-lg font-semibold mb-4">Upcoming Events</h3>
				{#if selectedVenue.featured}
					<Card.Card class="py-4 pb-0 gap-0 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onclick={() => goToEvent('evt_001')}>
						<Card.CardHeader class="gap-0 pb-4">
							<Card.CardTitle class="text-lg font-semibold">Friday Night Live</Card.CardTitle>
						</Card.CardHeader>
						
						<AspectRatio.Root class="pb-2" ratio={16/9}>
							<div class="bg-gray-200 text-gray-600 text-center font-medium h-full flex items-center justify-center">
								Featured Event Banner
							</div>
						</AspectRatio.Root>

						<Card.CardContent class="p-4 pb-4 space-y-4">
							<div class="text-sm text-muted-foreground">
								📅 August 24, 2025 • 📍 {selectedVenue.city}
							</div>

							<div class="text-sm">
								🏢 {selectedVenue.name}
							</div>

							<div class="text-sm">🎵 Artist Name</div>

							<div class="flex gap-2 items-center">
								<span class="text-sm text-muted-foreground mr-2">💰 12+2 Schema</span>
								<Avatar.Root class="w-8 h-8 rounded-lg">
									<Avatar.Fallback class="rounded-lg bg-muted" />
								</Avatar.Root>
								<Avatar.Root class="w-8 h-8 rounded-lg">
									<Avatar.Fallback class="rounded-lg bg-muted" />
								</Avatar.Root>
								<Avatar.Root class="w-8 h-8 rounded-lg">
									<Avatar.Fallback class="rounded-lg bg-muted" />
								</Avatar.Root>
							</div>
						</Card.CardContent>
					</Card.Card>
				{:else}
					<p class="text-muted-foreground">No upcoming events.</p>
				{/if}
			</div>
		{/if}
	{/if}
</div>

<nav class="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-t z-50">
	<div class="mx-auto w-full max-w-2xl px-4">
		<div class="grid grid-cols-[1fr_auto_1fr] items-center pt-4 pb-8">
			<div class="flex items-center justify-start">
				{#if viewMode === 'list'}
					<Button.Button variant="outline" size="sm" onclick={goBack}>
						← Back to Main
					</Button.Button>
				{:else}
					<Button.Button variant="outline" size="sm" onclick={goToList}>
						← Back to Venues
					</Button.Button>
				{/if}
			</div>
			<div class="flex items-center justify-center"></div>
			<div class="flex items-center justify-end"></div>
		</div>
	</div>
</nav>