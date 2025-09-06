<script lang="ts">
	import * as Button from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Badge from '$lib/components/ui/badge/index.js';
	import * as AspectRatio from '$lib/components/ui/aspect-ratio/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as Skeleton from '$lib/components/ui/skeleton/index.js';
	import { createEventDispatcher } from 'svelte';
	import type { Brand, Event } from '$lib/types/api.js';
	import { brandData, events, venueData } from '$lib/data/mockData.js';

	let footerEl: HTMLElement | undefined = $state();
	let isLoading: boolean = $state(false);

	const dispatch = createEventDispatcher<{
		goBack: void;
		goToEvent: { eventId: string };
		footerHeight: { height: number };
	}>();

	let viewMode: 'list' | 'detail' = $state('list');
	let selectedBrandId: string | null = $state(null);

	const brands = brandData.sort((a, b) => Number(b.brandfeatured) - Number(a.brandfeatured));

	const getBrandEventCount = $derived((brandId: number): number => {
		return events.filter(event => {
			const brandIds = event.brandid.split(',').map(id => id.replace(/\^/g, ''));
			return brandIds.includes(brandId.toString());
		}).length;
	});

	const getBrandEvents = $derived((brandId: number): Event[] => {
		const brandEvents = events.filter(event => {
			const brandIds = event.brandid.split(',').map(id => id.replace(/\^/g, ''));
			return brandIds.includes(brandId.toString());
		});
		return brandEvents.sort((a, b) => {
			if (a.eventfeatured !== b.eventfeatured) return Number(b.eventfeatured) - Number(a.eventfeatured);
			return new Date(a.eventdate).getTime() - new Date(b.eventdate).getTime();
		});
	});

	function selectBrand(brandId: string): void {
		selectedBrandId = brandId;
		viewMode = 'detail';
		window.scrollTo(0, 0);
	}

	function goToList(): void {
		viewMode = 'list';
		selectedBrandId = null;
		window.scrollTo(0, 0);
	}

	function goBack(): void {
		dispatch('goBack');
	}

	function goToEvent(eventId: string): void {
		dispatch('goToEvent', { eventId });
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

<div class="space-y-6">
	{#if viewMode === 'list'}
		<div class="space-y-4">
			<h1 class="text-3xl font-bold">Brands</h1>
		</div>
		
		<div class="grid gap-4">
			{#if isLoading || brands.length === 0}
				<Card.Card>
					<Card.CardHeader class="pb-2">
						<div class="flex items-start justify-between">
							<div class="space-y-2 flex-1">
								<Skeleton.Root class="h-6 w-3/4" />
								<Skeleton.Root class="h-4 w-1/2" />
							</div>
						</div>
					</Card.CardHeader>
					<Card.CardContent class="space-y-4">
						<Skeleton.Root class="h-4 w-full" />
						<Skeleton.Root class="h-4 w-2/3" />
						<div class="flex gap-2">
							<Skeleton.Root class="h-8 w-8 rounded-lg" />
							<Skeleton.Root class="h-8 w-8 rounded-lg" />
							<Skeleton.Root class="h-8 w-8 rounded-lg" />
						</div>
					</Card.CardContent>
				</Card.Card>
			{:else}
				{#each brands as brand}
					<Card.Card class="py-4 pb-0 gap-0 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onclick={() => selectBrand(brand.brandid.toString())}>
						<Card.CardHeader class="gap-0 pb-4">
							<div class="flex justify-between items-center">
								<div class="flex items-center gap-3">
									<Avatar.Root class="w-12 h-12 rounded-lg">
										<Avatar.Image src="/pic/brand/{brand.brandpic1}" alt={brand.brandname} class="rounded-lg" />
										<Avatar.Fallback class="rounded-lg bg-muted">{brand.brandname.charAt(0)}</Avatar.Fallback>
									</Avatar.Root>
									<Card.CardTitle class="text-lg font-semibold">{brand.brandname}</Card.CardTitle>
								</div>
								<div class="flex gap-2">
									{#if brand.brandfeatured}
										<Badge.Badge>Featured</Badge.Badge>
									{/if}
								</div>
							</div>
						</Card.CardHeader>
						
						{#if brand.brandfeatured}
							<AspectRatio.Root ratio={16/9}>
								<img src="/pic/brand/{brand.brandpic2}" alt="{brand.brandname}" class="w-full h-full object-cover" />
							</AspectRatio.Root>
						{/if}

						<Card.CardContent class="p-4 px-6 pb-4 space-y-4">
							<p class="text-md text-muted-foreground">{getBrandEventCount(brand.brandid)} upcoming events</p>
						</Card.CardContent>
					</Card.Card>
				{/each}
			{/if}
		</div>
	{:else if viewMode === 'detail' && selectedBrandId}
		{@const selectedBrand = brands.find(b => b.brandid.toString() === selectedBrandId)}
		{#if selectedBrand}
			{@const brandEvents = getBrandEvents(selectedBrand.brandid)}
			<div class="space-y-6">
				{#if selectedBrand.brandfeatured}
					<AspectRatio.Root class="pb-2" ratio={16/9}>
						<img src="/pic/brand/{selectedBrand.brandpic2}" alt="{selectedBrand.brandname} Banner" class="w-full h-full object-cover" />
					</AspectRatio.Root>
				{/if}

				<Card.Card>
					<Card.CardHeader class="gap-0">
						<div class="flex items-center gap-8">
							<Avatar.Root class="w-32 h-32 rounded-lg">
								<Avatar.Image src="/pic/brand/{selectedBrand.brandpic1}" alt={selectedBrand.brandname} class="rounded-lg" />
								<Avatar.Fallback class="rounded-lg bg-muted text-lg">{selectedBrand.brandname.charAt(0)}</Avatar.Fallback>
							</Avatar.Root>
							<div class="space-y-3">
								<h1 class="text-4xl font-bold">{selectedBrand.brandname}</h1>
								<div class="flex gap-2">
									{#if selectedBrand.brandfeatured}
										<Badge.Badge>Featured</Badge.Badge>
									{/if}
								</div>
							</div>
						</div>
					</Card.CardHeader>
				</Card.Card>

				<h3 class="text-2xl font-semibold my-4">Upcoming Events</h3>
				{#if brandEvents.length > 0}
					{#each brandEvents as event}
						{@const venue = venueData.find(v => v.venueid === event.venueid)}
						{@const eventBrandIds = event.brandid.split(',').map(id => id.replace(/\^/g, ''))}
						{@const eventBrands = brandData.filter(b => eventBrandIds.includes(b.brandid.toString()))}
						
						<Card.Card class="py-4 pb-0 gap-0 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onclick={() => goToEvent(event.eventid.toString())}>
							<Card.CardHeader class="gap-0 pb-4">
								<div class="flex justify-between items-center">
									<Card.CardTitle class="text-lg font-semibold">{event.eventtitle}</Card.CardTitle>
									{#if event.eventfeatured}
										<Badge.Badge>Featured</Badge.Badge>
									{/if}
								</div>
							</Card.CardHeader>
							
							{#if event.eventfeatured}
								<AspectRatio.Root class="pb-2" ratio={16/9}>
									<img src="/pic/event/{event.eventpic}" alt={event.eventtitle} class="w-full h-full object-cover" />
								</AspectRatio.Root>
							{/if}

							<Card.CardContent class="p-4 pb-4 space-y-4">
								<div class="text-sm text-muted-foreground">
									📅 {new Date(event.eventdate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
								</div>
								
								{#if venue}
									<div class="text-sm">
										📍 {venue.venuename} <a href={venue.venuelink} target="_blank" rel="noopener noreferrer">🔗</a>
									</div>
								{/if}

								<div class="text-sm">
									🎵 {event.eventartist}
								</div>

								<div class="flex gap-2 items-center">
									{#if event.eventschema}
										<span class="text-sm text-muted-foreground mr-2">💰 {event.eventschema}</span>
									{/if}
									{#each eventBrands as brand}
										<Avatar.Root class="w-8 h-8 rounded-lg">
											<Avatar.Image src="/pic/brand/{brand.brandpic1}" alt={brand.brandname} class="rounded-lg" />
											<Avatar.Fallback class="rounded-lg bg-muted" />
										</Avatar.Root>
									{/each}
								</div>
							</Card.CardContent>
						</Card.Card>
					{/each}
				{:else}
					<div class="text-center py-6">
						<Button.Button variant="default" size="lg" class="bg-primary text-primary-foreground hover:bg-primary/90">
							Notify me
						</Button.Button>
					</div>
				{/if}
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
						Home
					</Button.Button>
				{:else}
					<Button.Button variant="outline" size="sm" onclick={goToList}>
						← Back
					</Button.Button>
				{/if}
			</div>
			<div class="flex items-center justify-center"></div>
			<div class="flex items-center justify-end"></div>
		</div>
	</div>
</nav>