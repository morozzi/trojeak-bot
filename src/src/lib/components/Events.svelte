<script lang="ts">
	import * as Button from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Badge from '$lib/components/ui/badge/index.js';
	import * as AspectRatio from '$lib/components/ui/aspect-ratio/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as Skeleton from '$lib/components/ui/skeleton/index.js';
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
	].sort((a, b) => Number(b.featured) - Number(a.featured));

	function selectEvent(eventId: string): void {
		selectedEventId = eventId;
		viewMode = 'detail';
		window.scrollTo(0, 0);
	}

	function goToList(): void {
		viewMode = 'list';
		selectedEventId = null;
		window.scrollTo(0, 0);
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
			<h1 class="text-3xl font-bold">Events</h1>
		</div>
		
		<div class="grid gap-4">
			{#if events.length === 0}
				<Card.Card>
					<Skeleton.Skeleton class="h-16 w-full" />
					<Card.CardContent class="p-4 space-y-2">
						<Skeleton.Skeleton class="h-4 w-full" />
						<Skeleton.Skeleton class="h-4 w-3/4" />
						<Skeleton.Skeleton class="h-4 w-1/2" />
					</Card.CardContent>
				</Card.Card>
			{:else}
				{#each events as event}
					<Card.Card class="py-4 pb-0 gap-0 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onclick={() => selectEvent(event.id)}>
						<Card.CardHeader class="gap-0 pb-4">
							<div class="flex justify-between items-center">
								<Card.CardTitle class="text-lg font-semibold">{event.title}</Card.CardTitle>
								<div class="flex gap-2">
									{#if event.featured}
										<Badge.Badge>Featured</Badge.Badge>
									{/if}
								</div>
							</div>
						</Card.CardHeader>
						
						{#if event.featured}
							<AspectRatio.Root class="pb-2" ratio={16/9}>
								<div class="bg-gray-200 text-gray-600 text-center font-medium h-full flex items-center justify-center">
									Featured Event Banner
								</div>
							</AspectRatio.Root>
						{/if}

						<Card.CardContent class="p-4 pb-4 space-y-4">
							<div class="text-sm text-muted-foreground">
								📅 {event.date} • 📍 {event.city}
							</div>

							<div class="text-sm">
								🏢 {event.venue_name}
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
				{/each}
			{/if}
		</div>
	{:else if viewMode === 'detail' && selectedEventId}
		{@const selectedEvent = events.find(e => e.id === selectedEventId)}
		{#if selectedEvent}
			<div class="space-y-8">
				<AspectRatio.Root class="pb-2" ratio={16/9}>
					<div class="bg-gray-200 text-gray-600 text-center font-medium h-full flex items-center justify-center">
						Event Banner
					</div>
				</AspectRatio.Root>

				<Card.Card>
					<Card.CardHeader>
						<h1 class="text-3xl font-bold">{selectedEvent.title}</h1>
						{#if selectedEvent.featured}
							<div class="flex gap-2">
								<Badge.Badge>Featured</Badge.Badge>
							</div>
						{/if}
					</Card.CardHeader>
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
					<Button.Button variant="outline" size="sm" onclick={goBack}>
						← Back to Main
					</Button.Button>
				{:else}
					<Button.Button variant="outline" size="sm" onclick={goToList}>
						← Back to Events
					</Button.Button>
				{/if}
			</div>
			<div class="flex items-center justify-center"></div>
			<div class="flex items-center justify-end"></div>
		</div>
	</div>
</nav>