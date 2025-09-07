<script lang="ts">
	import * as Button from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Badge from '$lib/components/ui/badge/index.js';
	import * as AspectRatio from '$lib/components/ui/aspect-ratio/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as Skeleton from '$lib/components/ui/skeleton/index.js';
	import { createEventDispatcher } from 'svelte';
	import type { Event } from '$lib/types/api.js';
	import { events } from '$lib/data/mockData.js';

	interface Props {
		initialEventId?: string;
	}

	const { initialEventId }: Props = $props();

	let footerEl: HTMLElement | undefined = $state();

	const dispatch = createEventDispatcher<{
		goBack: void;
		startBooking: { event: Event };
		footerHeight: { height: number };
	}>();

	let viewMode: 'list' | 'detail' = $state(initialEventId ? 'detail' : 'list');
	let selectedEventId: string | null = $state(initialEventId || null);

	const sortedEvents = events.sort((a, b) => Number(b.eventfeatured) - Number(a.eventfeatured));

	function selectEvent(eventId: string): void {
		selectedEventId = eventId;
		viewMode = 'detail';
		window.scrollTo(0, 0);
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

	function updateFooterHeight() {
		if (!footerEl) return;
		const height = footerEl.offsetHeight;
		dispatch('footerHeight', { height });
	}

	$effect(() => {
		if (footerEl) {
			updateFooterHeight();
			const ro = new ResizeObserver(updateFooterHeight);
			ro.observe(footerEl);
			return () => ro.disconnect();
		}
	});
</script>

<div class="space-y-8">
	{#if viewMode === 'list'}
		<div class="space-y-4">
			<h1 class="text-3xl font-bold">Events</h1>
		</div>
		
		<div class="grid gap-4">
			{#if sortedEvents.length === 0}
				<Card.Card>
					<Skeleton.Skeleton class="h-16 w-full" />
					<Card.CardContent class="p-4 space-y-2">
						<Skeleton.Skeleton class="h-4 w-full" />
						<Skeleton.Skeleton class="h-4 w-3/4" />
						<Skeleton.Skeleton class="h-4 w-1/2" />
					</Card.CardContent>
				</Card.Card>
			{:else}
				{#each sortedEvents as event}
					<Card.Card class="py-4 pb-0 gap-0 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onclick={() => selectEvent(event.eventid.toString())}>
						<Card.CardHeader class="gap-0 pb-4">
							<div class="flex justify-between items-center">
								<Card.CardTitle class="text-lg font-semibold">{event.eventtitle}</Card.CardTitle>
								<div class="flex gap-2">
									{#if event.eventfeatured}
										<Badge.Badge>Featured</Badge.Badge>
									{/if}
								</div>
							</div>
						</Card.CardHeader>
						
						{#if event.eventfeatured}
							<AspectRatio.Root class="pb-2" ratio={16/9}>
								<div class="bg-gray-200 text-gray-600 text-center font-medium h-full flex items-center justify-center">
									Featured Event Banner
								</div>
							</AspectRatio.Root>
						{/if}

						<Card.CardContent class="p-4 pb-4 space-y-4">
							<div class="text-sm text-muted-foreground">
								📅 {new Date(event.eventdate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
							</div>

							<div class="text-sm">
								🎵 {event.eventartist}
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
		{@const selectedEvent = sortedEvents.find(e => e.eventid.toString() === selectedEventId)}
		{#if selectedEvent}
			<div class="space-y-8">
				<AspectRatio.Root class="pb-2" ratio={16/9}>
					<div class="bg-gray-200 text-gray-600 text-center font-medium h-full flex items-center justify-center">
						Event Banner
					</div>
				</AspectRatio.Root>

				<Card.Card>
					<Card.CardHeader>
						<h1 class="text-3xl font-bold">{selectedEvent.eventtitle}</h1>
						{#if selectedEvent.eventfeatured}
							<div class="flex gap-2">
								<Badge.Badge>Featured</Badge.Badge>
							</div>
						{/if}
					</Card.CardHeader>
					<Card.CardContent class="p-6 space-y-4">
						<div class="space-y-2">
							<p class="text-sm text-muted-foreground">🎵 {selectedEvent.eventartist}</p>
							{#if selectedEvent.eventschema}
								<p class="text-sm text-muted-foreground">💰 {selectedEvent.eventschema} Schema - ${selectedEvent.eventschemaprice}</p>
							{/if}
							<p class="text-sm text-muted-foreground">📅 {new Date(selectedEvent.eventdate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
						</div>
						{#if selectedEvent.eventdesc}
							<p>{selectedEvent.eventdesc}</p>
						{/if}
						<Button.Button onclick={() => startBooking(selectedEvent)} class="w-full">
							Book This Event
						</Button.Button>
					</Card.CardContent>
				</Card.Card>
			</div>
		{/if}
	{/if}
</div>

<nav bind:this={footerEl} class="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-t z-50">
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