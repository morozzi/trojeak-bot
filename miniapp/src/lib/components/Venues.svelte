<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
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

<div class="space-y-6">
	{#if viewMode === 'list'}
		<div class="space-y-4">
			<Button variant="outline" onclick={goBack}>
				← Back to Main
			</Button>
			<h1 class="text-3xl font-bold">Venues ({venues.length})</h1>
		</div>
		
		<div class="grid gap-4">
			{#each venues as venue}
				<Card class="cursor-pointer hover:shadow-lg transition-shadow" onclick={() => selectVenue(venue.id)}>
					<CardHeader>
						<div class="flex justify-between items-start">
							<CardTitle>{venue.name}</CardTitle>
							<div class="flex gap-2">
								<Badge variant="secondary">{venue.type.toUpperCase()}</Badge>
								{#if venue.featured}
									<Badge>Featured</Badge>
								{/if}
							</div>
						</div>
						<p class="text-muted-foreground">{venue.city} • {venue.address}</p>
					</CardHeader>
					<CardContent>
						<p>{venue.description}</p>
					</CardContent>
				</Card>
			{/each}
		</div>
	{:else if viewMode === 'detail' && selectedVenueId}
		{@const selectedVenue = venues.find(v => v.id === selectedVenueId)}
		{#if selectedVenue}
			<div class="space-y-6">
				<div class="flex justify-between items-center">
					<Button variant="outline" onclick={goToList}>
						← Back to Venues
					</Button>
					<div class="flex gap-2">
						<Badge variant="secondary">{selectedVenue.type.toUpperCase()}</Badge>
						{#if selectedVenue.featured}
							<Badge>Featured</Badge>
						{/if}
					</div>
				</div>

				<h1 class="text-3xl font-bold">{selectedVenue.name}</h1>
				
				<Card>
					<CardContent class="p-6">
						<div class="space-y-4">
							<div>
								<p class="text-muted-foreground"><span class="font-semibold">Type:</span> {selectedVenue.type.charAt(0).toUpperCase() + selectedVenue.type.slice(1)}</p>
								<p class="text-muted-foreground"><span class="font-semibold">Location:</span> {selectedVenue.city}</p>
								<p class="text-muted-foreground"><span class="font-semibold">Address:</span> {selectedVenue.address}</p>
							</div>
							<p>{selectedVenue.description}</p>
						</div>
					</CardContent>
				</Card>
			</div>
		{/if}
	{/if}
</div>