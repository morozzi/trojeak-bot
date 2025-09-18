<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import * as Button from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Input from '$lib/components/ui/input/index.js';
	import * as Label from '$lib/components/ui/label/index.js';
	import * as Textarea from '$lib/components/ui/textarea/index.js';
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import * as Progress from '$lib/components/ui/progress/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import Loading from '$lib/components/Loading.svelte';
	import { createEventDispatcher } from 'svelte';
	import type { Event, Venue } from '$lib/types/api.js';
	import { appStore, appActions } from '$lib/stores/app.js';
	import { userStore } from '$lib/stores/user.js';
	import { BookingValidator, type BookingData } from '$lib/api/validation.js';

	interface Props {
		event: Event;
		venue: Venue;
	}

	const { event, venue }: Props = $props();
	
	let footerEl: HTMLElement | undefined = $state();
	let footerVisible = $state(true);
	let isProcessing = $state(false);
	let phoneInputTouched = $state(false);
	let isMobile = $state(false);

	const dispatch = createEventDispatcher<{
		navigate: { view: string };
		footerHeight: { height: number };
	}>();

	const brandsQuery = createQuery({
		queryKey: ['brands'],
		queryFn: async () => {
			const response = await fetch(`/api/brands.php`);
			if (!response.ok) throw new Error('Failed to fetch brands');
			return response.json();
		},
	});

	const currentStep = $derived($appStore.bookingState?.currentStep || 1);
	const selectedBrands = $derived($appStore.bookingState?.selectedBrands || {});
	const guests = $derived($appStore.bookingState?.guests || 1);
	const phone = $derived($appStore.bookingState?.phone || $userStore.userData?.user?.phone || '+855');
	const comment = $derived($appStore.bookingState?.comment || '');
	const paymentMethod = $derived($appStore.bookingState?.paymentMethod || '');
	const constants = $derived($userStore.userData?.constants);
	const validator = $derived(constants ? new BookingValidator(constants) : null);

	const eventBrandIds = event.brandid.split(',').map(id => id.replace(/\^/g, ''));
	const eventBrands = $derived($brandsQuery.data?.filter(b => eventBrandIds.includes(b.brandid.toString())) || []);

	const totalItems = $derived(Object.values(selectedBrands).reduce((sum, qty) => sum + qty, 0));
	const estimatedTotal = $derived(totalItems * (event.eventschemaprice || 0));
	const formattedTotal = $derived(constants ? `${constants.CURRENCY_SYMBOL}${estimatedTotal.toFixed(constants.CURRENCY_PRECISION)}` : `${estimatedTotal}`);
	
	const phoneValidation = $derived.by(() => {
		return validator.phoneSchema.safeParse(phone).success;
	});

	const commentValidation = $derived.by(() => {
		return validator.commentSchema.safeParse(comment).success;
	});
	
	const canProceedFromStep1 = $derived(totalItems > 0);
	const canProceedFromStep2 = $derived(phoneValidation);
	const canProceedFromStep3 = $derived(commentValidation);
	const canCompleteBooking = $derived(paymentMethod !== '');
	const progressPercentage = $derived((currentStep / 4) * 100);

	$effect(() => {
		if (!$appStore.bookingState) {
			appActions.startBooking(event.eventid.toString());
		}
		
		if (currentStep !== 2) {
			phoneInputTouched = false;
		}
	});

	$effect(() => {
		if (footerEl) {
			updateFooterHeight();
			const ro = new ResizeObserver(updateFooterHeight);
			ro.observe(footerEl);
			return () => ro.disconnect();
		}
	});

	$effect(() => {
		const mediaQuery = window.matchMedia('(max-width: 768px)');
		isMobile = mediaQuery.matches;
		
		const handler = (e: MediaQueryListEvent) => isMobile = e.matches;
		mediaQuery.addEventListener('change', handler);
		return () => mediaQuery.removeEventListener('change', handler);
	});

	function updateFooterHeight() {
		if (!footerEl) return;
		const height = footerEl.offsetHeight;
		dispatch('footerHeight', { height });
	}

	function toggleFooter(show: boolean) {
		if (!isMobile) return;
		
		if (!show) {
			setTimeout(() => footerVisible = false, 300);
		} else {
			footerVisible = true;
		}
	}

	function updateBrandQuantity(brandId: string, quantity: number) {
		const newBrands = { ...selectedBrands };
		if (quantity === 0) {
			delete newBrands[brandId];
		} else {
			newBrands[brandId] = quantity;
		}
		appActions.updateBookingState({ selectedBrands: newBrands });
	}

	function updateGuests(value: string) {
		const guestCount = parseInt(value);
		if (!isNaN(guestCount)) {
			appActions.updateBookingState({ guests: guestCount });
		}
	}

	function updatePhone(value: string) {
		phoneInputTouched = true;
		appActions.updateBookingState({ phone: value });
	}

	function updateComment(value: string) {
		appActions.updateBookingState({ comment: value });
	}

	function updatePaymentMethod(value: 'aba' | 'ipay88' | 'telegram_stars') {
		appActions.updateBookingState({ paymentMethod: value });
	}

	function nextStep() {
		if (currentStep < 4) {
			appActions.updateBookingState({ currentStep: currentStep + 1 });  // ADD store update
			dispatch('navigate', { view: `booking-step-${currentStep + 1}` });
		}
	}

	function prevStep() {
		if (currentStep > 1) {
			appActions.updateBookingState({ currentStep: currentStep - 1 });  // ADD store update
			dispatch('navigate', { view: `booking-step-${currentStep - 1}` });
		} else {
			dispatch('navigate', { view: 'events-detail' });
		}
	}

	function handleCancel() {
		appActions.clearBooking();
		dispatch('navigate', { view: 'events-detail' });
	}

	async function handleCompleteBooking() {
		isProcessing = true;
		await new Promise(resolve => setTimeout(resolve, 2000));
		isProcessing = false;
		dispatch('navigate', { view: 'events-detail' });
	}

	const stepTitles = ['Drinks', 'Guests', 'Details', 'Payment'];
</script>

<div class="space-y-8">
	<div class="text-center space-y-4 pt-6">
		<h1 class="text-2xl font-bold">Book Your Event</h1>
		<p class="text-muted-foreground">{event.eventtitle} at {venue.venuename}</p>
	</div>
	
	{#if $brandsQuery.isLoading}
		<Loading variant="booking" />
	{:else if $brandsQuery.error}
		<Card.Card>
			<Card.CardContent class="p-4">
				<p class="text-destructive">Failed to load drink options. Please try again.</p>
			</Card.CardContent>
		</Card.Card>
	{:else}
		<div class="space-y-6">
			<div class="space-y-3">
				<div class="flex justify-between items-center">
					{#each stepTitles as title, index}
						<div class="flex flex-col items-center gap-2 flex-1">
							<div class="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm
								{currentStep > index + 1 ? 'bg-primary text-primary-foreground' : 
								 currentStep === index + 1 ? 'bg-primary text-primary-foreground' : 
								 'bg-muted text-muted-foreground'}">
								{index + 1}
							</div>
							<span class="text-xs text-center {currentStep === index + 1 ? 'text-primary font-medium' : 'text-muted-foreground'}">{title}</span>
						</div>
					{/each}
				</div>
				<Progress.Progress value={progressPercentage} class="w-full" />
			</div>

			{#if currentStep === 1}
				<div class="space-y-4">
					<h3 class="text-lg font-semibold">Select Your Drinks</h3>
					<div class="grid gap-4">
						{#each eventBrands as brand}
							<Card.Card class="p-4">
								<div class="flex justify-between items-center">
									<div class="flex items-center gap-3">
										<Avatar.Root class="w-8 h-8 rounded-lg">
											<Avatar.Image src="/pic/brand/{brand.brandpic1}" alt={brand.brandname} class="rounded-lg" />
											<Avatar.Fallback>{brand.brandname.charAt(0)}</Avatar.Fallback>
										</Avatar.Root>
										<h4 class="font-medium">{brand.brandname}</h4>
									</div>
									<div class="flex items-center gap-2">
										<Button.Button variant="outline" size="sm" onclick={() => updateBrandQuantity(brand.brandid.toString(), Math.max(0, (selectedBrands[brand.brandid.toString()] || 0) - 1))}>-</Button.Button>
										<span class="w-8 text-center">{selectedBrands[brand.brandid.toString()] || 0}</span>
										<Button.Button variant="outline" size="sm" onclick={() => updateBrandQuantity(brand.brandid.toString(), (selectedBrands[brand.brandid.toString()] || 0) + 1)}>+</Button.Button>
									</div>
								</div>
							</Card.Card>
						{/each}
					</div>
					{#if totalItems > 0}
						<div class="p-4 bg-muted rounded-lg">
							<p class="font-medium">Items: {totalItems}</p>
							<p class="text-sm text-muted-foreground">Estimated Total: {formattedTotal}</p>
						</div>
					{/if}
				</div>
			{:else if currentStep === 2}
				<div class="space-y-4">
					<h3 class="text-lg font-semibold">Guest Information</h3>
					<div class="space-y-4">
						<div class="space-y-2">
							<Label.Label for="guestCount">Number of Guests</Label.Label>
							<Select.Root type="single" value={guests.toString()} onValueChange={updateGuests}>
								<Select.Trigger>
									{guests} Guest{guests > 1 ? 's' : ''}
								</Select.Trigger>
								<Select.Content>
									{#each Array(constants.MAX_GUESTS) as _, i}
										<Select.Item value={(i + 1).toString()}>{i + 1} Guest{i > 0 ? 's' : ''}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>
						<div class="space-y-2">
							<Label.Label for="phone">Phone Number</Label.Label>
							<Input.Input 
								class="w-72"
								id="phone" 
								type="tel" 
								value={phone}
								oninput={(e) => updatePhone(e.target.value)}
								placeholder="+855 12 345 678"
								onfocus={() => toggleFooter(false)}
								onblur={() => {
									phoneInputTouched = true;
									toggleFooter(true);
								}}
							/>
							{#if phoneInputTouched && !phoneValidation && phone.length > 0}
								<p class="text-xs text-destructive">Please enter a valid international phone number</p>
							{/if}
						</div>
					</div>
				</div>
			{:else if currentStep === 3}
				<div class="space-y-4">
					<h3 class="text-lg font-semibold">Additional Details</h3>
					<div class="space-y-4">
						<div class="space-y-2">
							<Label.Label for="comment">Special Requests (Optional)</Label.Label>
							<Textarea.Textarea 
								id="comment" 
								value={comment}
								oninput={(e) => updateComment(e.target.value)}
								placeholder="Any special requests or notes..." 
								maxlength={constants.MAX_COMMENT_LENGTH}
								onfocus={() => toggleFooter(false)}
								onblur={() => toggleFooter(true)}
							/>
							<p class="text-xs {commentValidation ? 'text-muted-foreground' : 'text-destructive'}">{comment.length}/{constants.MAX_COMMENT_LENGTH} characters</p>
						</div>
					</div>

					<div class="p-4 bg-muted rounded-lg space-y-2">
						<h4 class="font-medium">Booking Summary</h4>
						<p class="text-sm">Items: {totalItems}</p>
						<p class="text-sm">Estimated Total: {formattedTotal}</p>
					</div>
				</div>
			{:else if currentStep === 4}
				<div class="space-y-4">
					<h3 class="text-lg font-semibold">Payment Method</h3>
					<RadioGroup.Root value={paymentMethod} onValueChange={updatePaymentMethod} class="space-y-3">
						<div class="flex items-center space-x-2">
							<RadioGroup.Item value="aba" />
							<Label.Label for="aba" class="flex items-center gap-2">
								<span>🏦 ABA QR Pay</span>
								<span class="text-xs text-muted-foreground">- Scan QR code with ABA Mobile</span>
							</Label.Label>
						</div>
						<div class="flex items-center space-x-2">
							<RadioGroup.Item value="ipay88" />
							<Label.Label for="ipay88" class="flex items-center gap-2">
								<span>💳 Credit/Debit Card</span>
								<span class="text-xs text-muted-foreground">- Visa, MasterCard, Local Banks</span>
							</Label.Label>
						</div>
						<div class="flex items-center space-x-2">
							<RadioGroup.Item value="telegram_stars" />
							<Label.Label for="telegram_stars" class="flex items-center gap-2">
								<span>⭐ Telegram Stars</span>
								<span class="text-xs text-muted-foreground">- Pay with Telegram Stars</span>
							</Label.Label>
						</div>
					</RadioGroup.Root>

					<div class="p-4 bg-muted rounded-lg space-y-2">
						<h4 class="font-medium">Final Summary</h4>
						<p class="text-sm">Event: {event.eventtitle}</p>
						<p class="text-sm">Venue: {venue?.venuename}</p>
						<p class="text-sm">Guests: {guests}</p>
						<p class="text-sm">Total Amount: {formattedTotal}</p>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

{#if footerVisible}
<nav bind:this={footerEl} class="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-t z-50">
	<div class="mx-auto w-full max-w-2xl px-4">
		<div class="grid grid-cols-[1fr_auto_1fr] items-center pt-4 pb-8">
			<div class="flex items-center justify-start">
				{#if currentStep > 1}
					<Button.Button variant="outline" onclick={prevStep}>
						← Back
					</Button.Button>
				{/if}
			</div>
			<div class="flex items-center justify-center">
				<Button.Button variant="outline" onclick={handleCancel}>
					Cancel
				</Button.Button>
			</div>
			<div class="flex items-center justify-end">
				{#if currentStep < 4}
					<Button.Button onclick={nextStep} disabled={
						(currentStep === 1 && !canProceedFromStep1) ||
						(currentStep === 2 && !canProceedFromStep2) ||
						(currentStep === 3 && !canProceedFromStep3)
					}>
						Continue
					</Button.Button>
				{:else}
					<Button.Button onclick={handleCompleteBooking} disabled={!canCompleteBooking || isProcessing}>
						{isProcessing ? 'Processing...' : 'Book'}
					</Button.Button>
				{/if}
			</div>
		</div>
	</div>
</nav>
{/if}