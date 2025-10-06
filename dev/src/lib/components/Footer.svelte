<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { Button } from "@/components/ui/button"
	import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
	import { Label } from "@/components/ui/label"
	import { Drawer, DrawerOverlay, DrawerContent } from '@/components/ui/drawer';
	import { Switch } from "@/components/ui/switch";
	import { SlidersHorizontal } from '@lucide/svelte';
	import type { ViewType, BookingAction } from '@/lib/types/components.js';
	import { appStore, appActions } from '@/lib/stores/app.js';
	import { userStore, userActions } from '@/lib/stores/user.ts';

	interface Props {
		currentView: ViewType;
		canGoBack: boolean;
		bookingStep?: number;
		isBookingProcessing?: boolean;
		canProceedBooking?: boolean;
		canCompleteBooking?: boolean;
		footerVisible?: boolean;
		brands?: Array<{brandid: number, brandname: string}>;
	}

	const {
		currentView,
		canGoBack,
		bookingStep,
		isBookingProcessing = false,
		canProceedBooking = false,
		canCompleteBooking = false,
		footerVisible = true,
		brands = []
	}: Props = $props();

	let footerEl: HTMLElement | undefined = $state();
	let filtersOpen = $state(false);

	const dispatch = createEventDispatcher<{
		navigate: { view: ViewType };
		goBack: void;
		bookingAction: { action: BookingAction };
		footerReady: { element: HTMLElement };
	}>();

	const viewType = $derived({
		isBooking: currentView.startsWith('booking-step-'),
		isList: currentView.endsWith('-list'),
		isHome: currentView === 'home'
	});

	const venueTypesQuery = createQuery({
		queryKey: ['venue-types'],
		queryFn: async () => {
			const response = await fetch('/api/venue-types.php');
			if (!response.ok) throw new Error('Failed to fetch venue types');
			return response.json();
		},
		enabled: () => viewType.isList
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

	function handleFilterChange(type: string, value: string[] | boolean): void {
		if (type === 'venueType') {
			userActions.setFilter({...$userStore.filterState, venueTypes: Array.isArray(value) ? value : []});
		} else if (type === 'brand') {
			userActions.setFilter({...$userStore.filterState, brands: Array.isArray(value) ? value : []});
		} else if (type === 'promotion') {
			userActions.setFilter({...$userStore.filterState, promotion: value as boolean});
		} else if (type === 'haveEvents') {
			userActions.setFilter({...$userStore.filterState, haveEvents: value as boolean});
		}
	}

	function getFilters(view: ViewType) {
		const venueTypes = $venueTypesQuery.data || [];
		const filterConfigs = {
			'events-list': [
				{ key: 'venueType', type: 'select', placeholder: 'Venue Types', options: venueTypes },
				{ key: 'brand', type: 'select', placeholder: 'Brands', options: brands },
				{ key: 'promotion', type: 'switch', label: 'With Promotion' }
			],
			'venues-list': [
				{ key: 'venueType', type: 'select', placeholder: 'Venue Types', options: venueTypes },
				{ key: 'haveEvents', type: 'switch', label: 'With Events' }
			],
			'brands-list': [
				{ key: 'haveEvents', type: 'switch', label: 'With Events' }
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
					<Button variant={button.variant || 'outline'} onclick={button.action} disabled={button.disabled}>
						{button.text}
					</Button>
				{/each}
			</div>
			<div class="flex items-center justify-center {centerButtons.length > 1 ? 'gap-6' : ''}">
				{#each centerButtons as button}
					<Button variant={button.variant || 'outline'} onclick={button.action} disabled={button.disabled}>
						{#if button.icon}
							<button.icon />
						{/if}
						{button.text}
					</Button>
				{/each}
			</div>
			<div class="flex items-center justify-end">
				{#each rightButtons as button}
					<Button variant={button.variant || 'outline'} onclick={button.action} disabled={button.disabled}>
						{button.text}
					</Button>
				{/each}
			</div>
		</div>
	</div>
</nav>

<Drawer bind:open={filtersOpen}>
	<DrawerOverlay class="!bg-black/0" />
	<DrawerContent class="data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom data-[state=open]:duration-300 data-[state=open]:ease-out">
		<div class="mx-auto w-full max-w-sm">
			<div class="p-4 pt-10 pb-12 space-y-6 text-center">
				{#if getFilters(currentView).length > 0}
					{@const filters = getFilters(currentView)}
					{@const selectFilters = filters.filter(f => f.type === 'select')}
					{@const switchFilters = filters.filter(f => f.type === 'switch')}
					
					{#if selectFilters.length > 0}
						<div class="flex justify-center gap-4">
							{#each selectFilters as filter}
								<div class="space-y-2">
									<Label for={filter.key}>{filter.placeholder}</Label>
									<Select 
										type="multiple"
										value={filter.key === 'venueType' ? $userStore.filterState.venueTypes : $userStore.filterState.brands}
										onValueChange={(values) => handleFilterChange(filter.key, values)}
									>
										<SelectTrigger class="scale-105 w-auto min-w-32" id={filter.key}>
											<SelectValue placeholder="Select" />
										</SelectTrigger>
										<SelectContent class="scale-105 w-auto">
											{#if filter.options}
												{#each filter.options as option}
													<SelectItem value={filter.key === 'venueType' ? option.venuetypesid?.toString() : option.brandid?.toString()}>
														{filter.key === 'venueType' ? option.venuetypename : option.brandname}
													</SelectItem>
												{/each}
											{/if}
										</SelectContent>
									</Select>
								</div>
							{/each}
						</div>
					{/if}
					
					{#if switchFilters.length > 0}
						<div class="flex justify-center gap-4">
							{#each switchFilters as filter}
								<div class="flex items-center justify-center gap-3">
									<Switch 
										id={filter.key}
										class="scale-125"
										checked={filter.key === 'promotion' ? $userStore.filterState.promotion : $userStore.filterState.haveEvents}
										onCheckedChange={(checked) => handleFilterChange(filter.key, checked)} 
									/>
									<Label for={filter.key}>{filter.label}</Label>
								</div>
							{/each}
						</div>
					{/if}
				{/if}
			</div>
		</div>
	</DrawerContent>
</Drawer>