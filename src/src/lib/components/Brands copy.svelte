<script lang="ts">
	import * as Button from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Badge from '$lib/components/ui/badge/index.js';
	import * as AspectRatio from '$lib/components/ui/aspect-ratio/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as Skeleton from '$lib/components/ui/skeleton/index.js';
	import { createEventDispatcher } from 'svelte';
	import type { Brand } from '$lib/types/api.js';
	import { brandData } from '$lib/data/mockData.js';

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

<div class="space-y-8">
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
								<div class="flex items-center gap-2">
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
							<AspectRatio.Root class="pb-2" ratio={16/9}>
								<div class="bg-gray-200 text-gray-600 text-center font-medium h-full flex items-center justify-center">
									Featured Brand Banner
								</div>
							</AspectRatio.Root>
						{/if}

						<Card.CardContent class="p-4 pb-4 space-y-4">
							<p>Premium alcohol brand</p>
						</Card.CardContent>
					</Card.Card>
				{/each}
			{/if}
		</div>
	{:else if viewMode === 'detail' && selectedBrandId}
		{@const selectedBrand = brands.find(b => b.brandid.toString() === selectedBrandId)}
		{#if selectedBrand}
			<div class="space-y-8">
				{#if selectedBrand.brandfeatured}
					<AspectRatio.Root class="pb-2" ratio={16/9}>
						<div class="bg-gray-200 text-gray-600 text-center font-medium h-full flex items-center justify-center">
							Featured Brand Banner
						</div>
					</AspectRatio.Root>
				{/if}

				<Card.Card>
					<Card.CardHeader>
						<h1 class="text-3xl font-bold">{selectedBrand.brandname}</h1>
						<div class="flex gap-2">
							{#if selectedBrand.brandfeatured}
								<Badge.Badge>Featured</Badge.Badge>
							{/if}
						</div>
					</Card.CardHeader>
					<Card.CardContent class="p-6">
						<p>Premium alcohol brand</p>
					</Card.CardContent>
				</Card.Card>

				<h3 class="text-lg font-semibold mb-4">Upcoming Events</h3>
				{#if selectedBrand.brandfeatured}
					{@const upcomingEvent = { id: 'evt_003', title: 'Weekend Beach Club', featured: true }}
					<Card.Card class="py-4 pb-0 gap-0 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onclick={() => goToEvent(upcomingEvent.id)}>
						<Card.CardHeader class="gap-0 pb-4">
							<div class="flex justify-between items-center">
								<Card.CardTitle class="text-lg font-semibold">{upcomingEvent.title}</Card.CardTitle>
								{#if upcomingEvent.featured}
									<Badge.Badge>Featured</Badge.Badge>
								{/if}
							</div>
						</Card.CardHeader>
						
						<AspectRatio.Root class="pb-2" ratio={16/9}>
							<div class="bg-gray-200 text-gray-600 text-center font-medium h-full flex items-center justify-center">
								Featured Event Banner
							</div>
						</AspectRatio.Root>

						<Card.CardContent class="p-4 pb-4 space-y-4">
							<div class="text-sm text-muted-foreground">
								📅 August 24, 2025 • 📍 Sihanoukville
							</div>

							<div class="text-sm">
								🏢 Otres Beach Club
							</div>

							<div class="text-sm">🎵 Live DJ</div>

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
						← Back to Brands
					</Button.Button>
				{/if}
			</div>
			<div class="flex items-center justify-center"></div>
			<div class="flex items-center justify-end"></div>
		</div>
	</div>
</nav>