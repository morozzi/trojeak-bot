<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { Card, CardContent } from "@/components/ui/card";
	import { Button } from "@/components/ui/button";
	import EventList from '@/lib/components/EventList.svelte';
	import Loading from '@/lib/components/Loading.svelte';
	import type { Event } from '@/lib/types/api.js';
	import type { ViewType } from '@/lib/types/components.js';
	import { userStore } from '@/lib/stores/user.js';
	import { appStore, appActions } from '@/lib/stores/app.js';

	const dispatch = createEventDispatcher<{
		navigate: { view: ViewType };
	}>();

	const featuredEventsQuery = createQuery({
		queryKey: ['events', $userStore.selectedLanguage, $userStore.selectedCity, 'featured'],
		queryFn: async () => {
			const response = await fetch(`/api/events.php?lang=${$userStore.selectedLanguage}&city=${$userStore.selectedCity}&featured=1`);
			if (!response.ok) throw new Error('Failed to fetch featured events');
			return response.json();
		}
	});

	const brandsQuery = createQuery({
		queryKey: ['brands'],
		queryFn: async () => {
			const response = await fetch(`/api/brands.php`);
			if (!response.ok) throw new Error('Failed to fetch brands');
			const data = await response.json();
			return data.success ? data.data : [];
		}
	});

	$effect(() => {
		if ($brandsQuery.data) {
			appActions.setBrandsData($brandsQuery.data);
		}
	});

	function goToEvent(eventId: string) {
    dispatch('navigate', { view: 'events-detail', eventId });
	}

	function handleNavigate(page: string): void {
		dispatch('navigate', { view: `${page}-list` as ViewType });
	}
</script>

<div class="space-y-8">
	<div class="text-center space-y-4">
		<h1 class="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
			Let's Trojeak
		</h1>
		<p class="text-lg text-muted-foreground">🇰🇭 Cambodia #1 event app</p>
	</div>

	{#if $featuredEventsQuery.isLoading}
		<Loading variant="list" />
	{:else if $featuredEventsQuery.error}
		<Card>
			<CardContent class="p-4">
				<p class="text-destructive">Failed to load featured events. Please try again.</p>
			</CardContent>
		</Card>
	{:else if ($featuredEventsQuery.data || []).length > 0}
		<EventList 
			events={$featuredEventsQuery.data || []} 
			brandData={$appStore.brandsData}
			onEventClick={goToEvent} 
		/>
	{:else}
		<div class="text-center py-8 space-y-4">
			<p class="text-muted-foreground">No featured events available right now</p>
			<Button variant="outline" onclick={() => handleNavigate('events')}>
				Browse All Events
			</Button>
		</div>
	{/if}
</div>