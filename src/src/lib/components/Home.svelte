<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Badge from '$lib/components/ui/badge/index.js';
	import * as Button from '$lib/components/ui/button/index.js';
	import * as AspectRatio from '$lib/components/ui/aspect-ratio/index.js';
	import * as Skeleton from '$lib/components/ui/skeleton/index.js';

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
		featuredEvents: Event[];
		selectedCity: string;
		selectedLanguage: string;
	}

	const { featuredEvents, selectedCity, selectedLanguage, userInfo }: Props = $props();

	let footerEl: HTMLElement | undefined = $state();

	const dispatch = createEventDispatcher<{
		eventClick: { eventId: string };
		navigate: { page: string };
		footerHeight: { height: number };
	}>();

	function handleEventClick(eventId: string) {
		dispatch('eventClick', { eventId });
	}

	function handleNavigate(page: string) {
		dispatch('navigate', { page });
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
	<div class="text-center space-y-4">
		<h1 class="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
			Let's Trojeak
		</h1>
		<p class="text-lg text-muted-foreground">🇰🇭 Cambodia #1 event app</p>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
		{#if featuredEvents.length === 0}
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
				<Card.Card class="py-4 pb-0 gap-0 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onclick={() => handleEventClick(event.id)}>
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
								Event Banner
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
							<div class="w-8 h-8 rounded-lg bg-muted"></div>
							<div class="w-8 h-8 rounded-lg bg-muted"></div>
							<div class="w-8 h-8 rounded-lg bg-muted"></div>
						</div>
					</Card.CardContent>
				</Card.Card>
			{/each}
		{/if}
	</div>
</div>

<nav 
	bind:this={footerEl}
	aria-label="Primary navigation"
	class="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-t z-50"
>
	<div class="mx-auto w-full max-w-2xl px-4">
		<div class="grid grid-cols-[1fr_auto_1fr] items-center pt-4 pb-8">
			<div class="flex items-center justify-start">
			</div>

			<div class="flex items-center gap-6 justify-center">
				<Button.Button 
					variant="outline" size="sm"
					onclick={() => handleNavigate('events')}
					class="flex flex-col items-center gap-1 px-4 py-2"
				>
					<span class="text-sm font-medium">Events</span>
				</Button.Button>
				
				<Button.Button 
					variant="outline" size="sm"
					onclick={() => handleNavigate('venues')}
					class="flex flex-col items-center gap-1 px-4 py-2"
				>
					<span class="text-sm font-medium">Venues</span>
				</Button.Button>
				
				<Button.Button 
					variant="outline" size="sm"
					onclick={() => handleNavigate('brands')}
					class="flex flex-col items-center gap-1 px-4 py-2"
				>
					<span class="text-sm font-medium">Brands</span>
				</Button.Button>
			</div>

			<div class="flex items-center justify-end">
			</div>
		</div>
	</div>
</nav>