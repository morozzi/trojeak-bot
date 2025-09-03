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

	function startBooking(event: Event): void {
		dispatch('startBooking', { event });
	}
</script>

<div class="space-y-8">
	{#if viewMode === 'list'}
		<div class="space-y-4">
			<h1 class="text-3xl font-bold">Events ({events.length})</h1>
		</div>
		
		<div class="grid gap-4">
			{#each events as event}
				<Card.Card class="cursor-pointer hover:shadow-lg transition-shadow" onclick={() => selectEvent(event.id)}>
					<Card.CardHeader>
						<div class="flex justify-between items-start">
							<Card.CardTitle>{event.title}</Card.CardTitle>
							<div class="flex gap-2">
								<Badge.Badge variant="secondary">{event.city}</Badge.Badge>
								{#if event.featured}
									<Badge.Badge>Featured</Badge.Badge>
								{/if}
							</div>
						</div>
					</Card.CardHeader>
					<Card.CardContent>
						<div class="space-y-2">
							<p class="text-sm text-muted-foreground">📍 {event.venue_name}</p>
							<p class="text-sm text-muted-foreground">💰 {event.price_range}</p>
							<p class="text-sm text-muted-foreground">📅 {event.date}</p>
							<p>{event.description}</p>
						</div>
					</Card.CardContent>
				</Card.Card>
			{/each}
		</div>
	{:else if viewMode === 'detail' && selectedEventId}
		{@const selectedEvent = events.find(e => e.id === selectedEventId)}
		{#if selectedEvent}
			<div class="space-y-8">
				<div class="flex justify-between items-center">
					<div class="flex gap-2">
						<Badge.Badge variant="secondary">{selectedEvent.city}</Badge.Badge>
						{#if selectedEvent.featured}
							<Badge.Badge>Featured</Badge.Badge>
						{/if}
					</div>
				</div>

				<h1 class="text-3xl font-bold">{selectedEvent.title}</h1>
				
				<Card.Card>
					<Card.CardContent class="p-6 space-y-4">
						<div class="space-y-2">
							<p class="text-sm text-muted-foreground">📍 {selectedEvent.venue_name}</p>
							<p class="text-sm text-muted-foreground">💰 {selectedEvent.price_range}</p>
							<p class="text-sm text-muted-foreground">📅 {selectedEvent.date}</p>
						</div>
						<p>{selectedEvent.description}</p>
						<Button.Button onclick={() => startBooking(selectedEvent)} class="w-full">
							Book This Event
						</Button.Button>
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
						← Back to Events
					</Button.Button>
				{/if}
			</div>
			<div class="flex items-center justify-center"></div>
			<div class="flex items-center justify-end"></div>
		</div>
	</div>
</nav>