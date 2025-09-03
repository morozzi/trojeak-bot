<script lang="ts">
	import * as Button from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Badge from '$lib/components/ui/badge/index.js';
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

	interface Props {
		initialEventId?: string;
	}

	const { initialEventId }: Props = $props();

	const dispatch = createEventDispatcher<{
		goBack: void;
		startBooking: { event: Event };
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
			date: 'August 22, 2025',
			description: 'Ultimate rooftop party with city views and premium cocktails.'
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
		<div class="space-y-4">
			<Button.Button variant="outline" onclick={goBack}>
				← Back to Main
			</Button.Button>
			<h1 class="text-3xl font-bold">Events ({events.length})</h1>
		</div>
		
		<div class="grid gap-4">
			{#each events as event}
				<Card.Card class="cursor-pointer hover:shadow-lg transition-shadow" onclick={() => selectEvent(event.id)}>
					<Card.CardHeader>
						<div class="flex justify-between items-start">
							<Card.CardTitle>{event.title}</Card.CardTitle>
							{#if event.featured}
								<Badge.Badge>Featured</Badge.Badge>
							{/if}
						</div>
						<p class="text-muted-foreground">{event.venue_name} • {event.city}</p>
					</Card.CardHeader>
					<Card.CardContent>
						<p class="mb-2">{event.description}</p>
						<p class="font-semibold text-primary">{event.price_range}</p>
					</Card.CardContent>
				</Card.Card>
			{/each}
		</div>
	{:else if viewMode === 'detail' && selectedEventId}
		{@const selectedEvent = events.find(e => e.id === selectedEventId)}
		{#if selectedEvent}
			<div class="space-y-6">
				<div class="flex justify-between items-center">
					<Button.Button variant="outline" onclick={goToList}>
						← Back to Events
					</Button.Button>
					{#if selectedEvent.featured}
						<Badge.Badge>Featured</Badge.Badge>
					{/if}
				</div>

				<h1 class="text-3xl font-bold">{selectedEvent.title}</h1>
				
				<Card.Card>
					<Card.CardContent class="p-6">
						<div class="space-y-4">
							<div>
								<p class="text-muted-foreground"><span class="font-semibold">Venue:</span> {selectedEvent.venue_name}</p>
								<p class="text-muted-foreground"><span class="font-semibold">Location:</span> {selectedEvent.city}</p>
								<p class="text-muted-foreground"><span class="font-semibold">Date:</span> {selectedEvent.date}</p>
								<p class="text-muted-foreground"><span class="font-semibold">Price Range:</span> {selectedEvent.price_range}</p>
							</div>
							<p>{selectedEvent.description}</p>
							<Button.Button class="w-full" onclick={() => dispatch('startBooking', { event: selectedEvent })}>
								Book This Event
							</Button.Button>
						</div>
					</Card.CardContent>
				</Card.Card>
			</div>
		{/if}
	{/if}
</div>