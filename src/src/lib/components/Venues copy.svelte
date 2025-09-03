<script lang="ts">
	import * as Button from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Badge from '$lib/components/ui/badge/index.js';
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
	];

	function selectVenue(venueId: string): void {
		selectedVenueId = venueId;
		viewMode = 'detail';
	}

	function goToList(): void {
		viewMode = 'list';
		selectedVenueId = null;
	}

	function goBack(): void {
		dispatch('goBack');
	}
</script>

<div class="space-y-8">
	{#if viewMode === 'list'}
		<div class="space-y-4">
			<h1 class="text-3xl font-bold">Venues ({venues.length})</h1>
		</div>
		
		<div class="grid gap-4">
			{#each venues as venue}
				<Card.Card class="cursor-pointer hover:shadow-lg transition-shadow" onclick={() => selectVenue(venue.id)}>
					<Card.CardHeader>
						<div class="flex justify-between items-start">
							<Card.CardTitle>{venue.name}</Card.CardTitle>
							<div class="flex gap-2">
								<Badge.Badge variant="secondary">{venue.type.toUpperCase()}</Badge.Badge>
								{#if venue.featured}
									<Badge.Badge>Featured</Badge.Badge>
								{/if}
							</div>
						</div>
					</Card.CardHeader>
					<Card.CardContent>
						<div class="space-y-2">
							<p class="text-sm text-muted-foreground">📍 {venue.address}</p>
							<p class="text-sm text-muted-foreground">🏙️ {venue.city}</p>
							<p>{venue.description}</p>
						</div>
					</Card.CardContent>
				</Card.Card>
			{/each}
		</div>
	{:else if viewMode === 'detail' && selectedVenueId}
		{@const selectedVenue = venues.find(v => v.id === selectedVenueId)}
		{#if selectedVenue}
			<div class="space-y-8">
				<div class="flex justify-between items-center">
					<div class="flex gap-2">
						<Badge.Badge variant="secondary">{selectedVenue.type.toUpperCase()}</Badge.Badge>
						{#if selectedVenue.featured}
							<Badge.Badge>Featured</Badge.Badge>
						{/if}
					</div>
				</div>

				<h1 class="text-3xl font-bold">{selectedVenue.name}</h1>
				
				<Card.Card>
					<Card.CardContent class="p-6 space-y-4">
						<div class="space-y-2">
							<p class="text-sm text-muted-foreground">📍 {selectedVenue.address}</p>
							<p class="text-sm text-muted-foreground">🏙️ {selectedVenue.city}</p>
						</div>
						<p>{selectedVenue.description}</p>
					</Card.CardContent>
				</Card.Card>

				<Card.Card>
					<Card.CardHeader>
						<Card.CardTitle>Upcoming Events</Card.CardTitle>
					</Card.CardHeader>
					<Card.CardContent>
						<p class="text-muted-foreground">No upcoming events at this venue.</p>
					</Card.CardContent>
				</Card.Card>
			</div>
		{/if}
	{/if}
</div>

<nav class="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-t z-50">
	<div class="mx-auto w-full max-w-2xl px-4">
		<div class="grid grid-cols-[1fr_auto_1fr] items-center pt-4 pb-8">
			<div class="flex items-center justify-start">
				{#if viewMode === 'list'}
					<Button.Button variant="outline" onclick={goBack}>
						← Back to Main
					</Button.Button>
				{:else}
					<Button.Button variant="outline" onclick={goToList}>
						← Back to Venues
					</Button.Button>
				{/if}
			</div>
			<div class="flex items-center justify-center"></div>
			<div class="flex items-center justify-end"></div>
		</div>
	</div>
</nav>