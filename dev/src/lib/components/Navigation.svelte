<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import * as Button from '$lib/components/ui/button/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Label from '$lib/components/ui/label/index.js';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { SlidersHorizontal } from '@lucide/svelte';
	import type { ViewType, BookingAction } from '$lib/types/components.js';

	interface Props {
		currentView: ViewType;
		canGoBack: boolean;
		bookingStep?: number;
		isBookingProcessing?: boolean;
		canProceedBooking?: boolean;
		canCompleteBooking?: boolean;
		footerVisible?: boolean;
	}

	const {
		currentView,
		canGoBack,
		bookingStep,
		isBookingProcessing = false,
		canProceedBooking = false,
		canCompleteBooking = false,
		footerVisible = true
	}: Props = $props();

	let footerEl: HTMLElement | undefined = $state();
	let filtersOpen = $state(false);

	const dispatch = createEventDispatcher<{
		navigate: { view: ViewType };
		goBack: void;
		bookingAction: { action: BookingAction };
		footerReady: { element: HTMLElement };
		filterChange: { type: string; value: string | boolean | null };
	}>();

	const viewType = $derived({
		isBooking: currentView.startsWith('booking-step-'),
		isList: currentView.endsWith('-list'),
		isHome: currentView === 'home'
	});

	const leftButtons = $derived.by(() => {
		if (viewType.isBooking && bookingStep && bookingStep > 1) {
			return [{ text: '← Back', action: () => handleBookingAction('prev') }];
		}
		if (canGoBack && !viewType.isBooking) {
			return [{ text: '← Back', action: handleGoBack }];
		}
		if (viewType.isList && !canGoBack) {
			return [{ text: 'Home', action: () => handleNavigate('home') }];
		}
		return [];
	});

	const centerButtons = $derived.by(() => {
		if (viewType.isBooking) {
			return [{ text: 'Cancel', action: () => handleBookingAction('cancel') }];
		}
		if (viewType.isHome) {
			return [
				{ text: 'Events', action: () => handleNavigate('events-list') },
				{ text: 'Venues', action: () => handleNavigate('venues-list') },
				{ text: 'Brands', action: () => handleNavigate('brands-list') }
			];
		}
		if (viewType.isList && getFilters(currentView).length > 0) {
			return [{ text: 'Filters', action: () => filtersOpen = true, icon: SlidersHorizontal }];
		}
		return [];
	});

	const rightButtons = $derived.by(() => {
		if (viewType.isBooking && bookingStep) {
			if (bookingStep < 4) {
				return [{ 
					text: 'Continue', 
					action: () => handleBookingAction('next'), 
					variant: 'default',
					disabled: !canProceedBooking 
				}];
			}
			return [{ 
				text: isBookingProcessing ? 'Processing...' : 'Book', 
				action: () => handleBookingAction('complete'), 
				variant: 'default',
				disabled: !canCompleteBooking || isBookingProcessing 
			}];
		}
		return [];
	});

	$effect(() => {
		if (footerEl) {
			dispatch('footerReady', { element: footerEl });
		}
	});

	$effect(() => {
		if (filtersOpen && typeof window !== 'undefined' && window.Telegram?.WebApp) {
			window.Telegram.WebApp.disableVerticalSwipes();
		} else if (!filtersOpen && typeof window !== 'undefined' && window.Telegram?.WebApp) {
			window.Telegram.WebApp.enableVerticalSwipes();
		}
	});

	function handleGoBack(): void {
		dispatch('goBack');
	}

	function handleNavigate(view: ViewType): void {
		dispatch('navigate', { view });
	}

	function handleBookingAction(action: BookingAction): void {
		dispatch('bookingAction', { action });
	}

	function handleFilterChange(type: string, value: string | boolean | null): void {
		dispatch('filterChange', { type, value });
	}

	function getFilters(view: ViewType) {
		const filterConfigs = {
			'events-list': [
				{ key: 'venueType', type: 'select', placeholder: 'Venue Types' },
				{ key: 'brand', type: 'select', placeholder: 'Brands' },
				{ key: 'promotion', type: 'switch', label: 'Promo' }
			],
			'venues-list': [
				{ key: 'venueType', type: 'select', placeholder: 'Venue Types' },
				{ key: 'haveEvents', type: 'switch', label: 'Events' }
			],
			'brands-list': [
				{ key: 'haveEvents', type: 'switch', label: 'Events' }
			]
		};
		return filterConfigs[view] || [];
	}
</script>

<nav bind:this={footerEl} class="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-t z-50" style:display={footerVisible ? 'block' : 'none'}>
	<div class="mx-auto w-full max-w-2xl px-4">
		<div class="grid grid-cols-[1fr_auto_1fr] items-center pt-4 pb-8">
			<div class="flex items-center justify-start">
				{#each leftButtons as button}
					<Button.Button variant={button.variant || 'outline'} onclick={button.action} disabled={button.disabled}>
						{button.text}
					</Button.Button>
				{/each}
			</div>
			<div class="flex items-center justify-center {centerButtons.length > 1 ? 'gap-6' : ''}">
				{#each centerButtons as button}
					<Button.Button variant={button.variant || 'outline'} onclick={button.action} disabled={button.disabled}>
						{#if button.icon}
							<button.icon size={16} />
						{/if}
						{button.text}
					</Button.Button>
				{/each}
			</div>
			<div class="flex items-center justify-end">
				{#each rightButtons as button}
					<Button.Button variant={button.variant || 'outline'} onclick={button.action} disabled={button.disabled}>
						{button.text}
					</Button.Button>
				{/each}
			</div>
		</div>
	</div>
</nav>

<Drawer.Root bind:open={filtersOpen}>
	<Drawer.Content>
		<div class="mx-auto w-full max-w-sm">
			<div class="p-4 pt-10 pb-12 space-y-6 text-center">
				{#if getFilters(currentView).length > 0}
					{@const filters = getFilters(currentView)}
					{@const selectFilters = filters.filter(f => f.type === 'select')}
					{@const switchFilters = filters.filter(f => f.type === 'switch')}
					
					{#if selectFilters.length > 0}
						<div class="space-y-4">
							{#each selectFilters as filter}
								<div class="space-y-2">
									<Label.Label for={filter.key}>{filter.placeholder}</Label.Label>
									<Select.Root onSelectedChange={(value) => handleFilterChange(filter.key, value?.value || null)}>
										<Select.Trigger id={filter.key}>
											All
										</Select.Trigger>
										<Select.Content>
											<Select.Item value={null}>All</Select.Item>
										</Select.Content>
									</Select.Root>
								</div>
							{/each}
						</div>
					{/if}
					
					{#if switchFilters.length > 0}
						<div class="space-y-4">
							{#each switchFilters as filter}
								<div class="flex items-center justify-center gap-3">
									<Switch id={filter.key} onCheckedChange={(checked) => handleFilterChange(filter.key, checked)} />
									<Label.Label for={filter.key}>{filter.label}</Label.Label>
								</div>
							{/each}
						</div>
					{/if}
				{/if}
			</div>
		</div>
	</Drawer.Content>
</Drawer.Root>