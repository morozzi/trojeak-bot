<script lang="ts">
	import { createEventDispatcher, getContext } from 'svelte';
	import * as Button from '$lib/components/ui/button/index.js';
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

	const stepTitles = ['Drinks', 'Guests', 'Details', 'Payment'];
	const totalBookingSteps = stepTitles.length;

	let footerEl: HTMLElement | undefined = $state();
	const registerFooter = getContext<(element: HTMLElement) => void>('registerFooter');

	const dispatch = createEventDispatcher<{
		navigate: { view: ViewType };
		goBack: void;
		bookingAction: { action: BookingAction };
	}>();

	const isBookingView = $derived(currentView.startsWith('booking-step-'));
	const isListView = $derived(currentView.endsWith('-list'));
	const isHomeView = $derived(currentView === 'home');

	const leftButtons = $derived(() => {
		if (isBookingView && bookingStep && bookingStep > 1) {
			return [{ text: '← Back', action: () => handleBookingAction('prev') }];
		}
		if (canGoBack && !isBookingView) {
			return [{ text: '← Back', action: handleGoBack }];
		}
		if (isListView && !canGoBack) {
			return [{ text: 'Home', action: () => handleNavigate('home') }];
		}
		return [];
	});

	const centerButtons = $derived(() => {
    if (isHomeView) {
        return [
            { text: 'Events', action: null },
            { text: 'Venues', action: null },
            { text: 'Brands', action: null }
        ];
    }
    return [];
});

	const rightButtons = $derived(() => {
		if (isBookingView && bookingStep) {
			if (bookingStep < totalBookingSteps) {
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

	function handleGoBack(): void {
		dispatch('goBack');
	}

	function handleNavigate(view: ViewType): void {
		dispatch('navigate', { view });
	}

	function handleBookingAction(action: BookingAction): void {
		dispatch('bookingAction', { action });
	}

	$effect(() => {
		if (footerEl && registerFooter) {
			registerFooter(footerEl);
		}
	});
</script>

<!-- DEBUG: Add this BEFORE <nav> -->
<div class="fixed top-0 left-0 bg-red-500 text-white p-2 z-[999] text-xs">
    isHomeView: {isHomeView}<br>
    isBookingView: {isBookingView}<br>
    centerButtons: {centerButtons.length}<br>
    first button: {centerButtons[0]?.text || 'none'}
</div>

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