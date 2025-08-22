<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { createEventDispatcher } from 'svelte';

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

	let { initialEventId }: { initialEventId?: string } = $props();

	const dispatch = createEventDispatcher<{
		goBack: void;
	}>();

	let viewMode: 'list' | 'detail' = $state(initialEventId ? 'detail' : 'list');
	let selectedEventId: string | null = $state(initialEventId || null);

	const events: Event[] = [
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
			id: 'evt_002', 
			title: 'Karaoke Night Special',
			venue_name: 'Golden KTV',
			city: 'Phnom Penh',
			featured: false,
			price_range: '$10-20',
			date: '2025-08-23',
			description: 'Private rooms with premium sound system and drink promotions.'
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

	function selectEvent(eventId: string): void {
		selectedEventId = eventId;
		viewMode = 'detail';
	}

	function goToList(): void {
		viewMode = 'list';
		selectedEventId = null;
	}

	function goBack(): void {
		dispatch('goBack');
	}
</script>

<div class="space-y-6">
	{#if viewMode === 'list'}
		<div class="flex justify-between items-center">
			<h1 class="text-3xl font-bold">Events ({events.length})</h1>
			<Button variant="outline" onclick={goBack}>
				← Back to Main
			</Button>
		</div>
		
		<div class="grid gap-4">
			{#each events as event}
				<Card class="cursor-pointer hover:shadow-lg transition-shadow" onclick={() => selectEvent(event.id)}>
					<CardHeader>
						<div class="flex justify-between items-start">
							<CardTitle>{event.title}</CardTitle>
							{#if event.featured}
								<Badge>Featured</Badge>
							{/if}
						</div>
						<p class="text-muted-foreground">{event.venue_name} • {event.city}</p>
					</CardHeader>
					<CardContent>
						<p class="mb-2">{event.description}</p>
						<p class="font-semibold text-primary">{event.price_range}</p>
					</CardContent>
				</Card>
			{/each}
		</div>
	{:else if viewMode === 'detail' && selectedEventId}
		{@const selectedEvent = events.find(e => e.id === selectedEventId)}
		{#if selectedEvent}
			<div class="space-y-6">
				<div class="flex justify-between items-center">
					<Button variant="outline" onclick={goToList}>
						← Back to Events
					</Button>
					{#if selectedEvent.featured}
						<Badge>Featured</Badge>
					{/if}
				</div>

				<h1 class="text-3xl font-bold">{selectedEvent.title}</h1>
				
				<Card>
					<CardContent class="p-6">
						<div class="space-y-4">
							<div>
								<p class="text-muted-foreground"><span class="font-semibold">Venue:</span> {selectedEvent.venue_name}</p>
								<p class="text-muted-foreground"><span class="font-semibold">Location:</span> {selectedEvent.city}</p>
								<p class="text-muted-foreground"><span class="font-semibold">Date:</span> {selectedEvent.date}</p>
								<p class="text-muted-foreground"><span class="font-semibold">Price Range:</span> {selectedEvent.price_range}</p>
							</div>
							<p>{selectedEvent.description}</p>
							<Button class="w-full">
								Book This Event
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		{/if}
	{/if}
</div>