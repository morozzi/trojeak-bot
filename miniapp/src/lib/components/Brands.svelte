<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { createEventDispatcher } from 'svelte';

	interface Brand {
		id: string;
		name: string;
		type: string;
		featured: boolean;
		description: string;
	}

	const dispatch = createEventDispatcher<{
		goBack: void;
	}>();

	let viewMode: 'list' | 'detail' = $state('list');
	let selectedBrandId: string | null = $state(null);

	const brands: Brand[] = [
		{
			id: 'brd_001',
			name: 'Angkor Beer',
			type: 'beer',
			featured: true,
			description: 'Cambodia\'s premium beer brand with crisp, refreshing taste.'
		},
		{
			id: 'brd_002',
			name: 'Hennessy',
			type: 'cognac',
			featured: true,
			description: 'World-renowned cognac for sophisticated evenings.'
		},
		{
			id: 'brd_003',
			name: 'Grey Goose',
			type: 'vodka',
			featured: false,
			description: 'Premium French vodka crafted from the finest wheat.'
		},
		{
			id: 'brd_004',
			name: 'Johnnie Walker',
			type: 'whisky',
			featured: true,
			description: 'Iconic Scotch whisky with rich heritage and bold flavors.'
		}
	];

	function selectBrand(brandId: string): void {
		selectedBrandId = brandId;
		viewMode = 'detail';
	}

	function goToList(): void {
		viewMode = 'list';
		selectedBrandId = null;
	}

	function goBack(): void {
		dispatch('goBack');
	}
</script>

<div class="space-y-6">
	{#if viewMode === 'list'}
		<div class="flex justify-between items-center">
			<h1 class="text-3xl font-bold">Brands ({brands.length})</h1>
			<Button variant="outline" onclick={goBack}>
				← Back to Main
			</Button>
		</div>
		
		<div class="grid gap-4">
			{#each brands as brand}
				<Card class="cursor-pointer hover:shadow-lg transition-shadow" onclick={() => selectBrand(brand.id)}>
					<CardHeader>
						<div class="flex justify-between items-start">
							<CardTitle>{brand.name}</CardTitle>
							<div class="flex gap-2">
								<Badge variant="secondary">{brand.type.toUpperCase()}</Badge>
								{#if brand.featured}
									<Badge>Featured</Badge>
								{/if}
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<p>{brand.description}</p>
					</CardContent>
				</Card>
			{/each}
		</div>
	{:else if viewMode === 'detail' && selectedBrandId}
		{@const selectedBrand = brands.find(b => b.id === selectedBrandId)}
		{#if selectedBrand}
			<div class="space-y-6">
				<div class="flex justify-between items-center">
					<Button variant="outline" onclick={goToList}>
						← Back to Brands
					</Button>
					<div class="flex gap-2">
						<Badge variant="secondary">{selectedBrand.type.toUpperCase()}</Badge>
						{#if selectedBrand.featured}
							<Badge>Featured</Badge>
						{/if}
					</div>
				</div>

				<h1 class="text-3xl font-bold">{selectedBrand.name}</h1>
				
				<Card>
					<CardContent class="p-6">
						<p>{selectedBrand.description}</p>
					</CardContent>
				</Card>
			</div>
		{/if}
	{/if}
</div>