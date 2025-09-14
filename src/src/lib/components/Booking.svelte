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
	import { createEventDispatcher } from 'svelte';
	import type { Event, Brand, Venue } from '$lib/types/api.js';

	interface Props {
		event: Event;
		venue: Venue;
	}

	const { event, venue }: Props = $props();
	
	let footerEl: HTMLElement | undefined = $state();

	const dispatch = createEventDispatcher<{
		goBack: void;
		complete: void;
		cancel: void;
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

	let currentStep = $state(1);
	let selectedBrands = $state<{[key: string]: number}>({});
	let guestCount = $state(1);
	let guestCountString = $state("1");
	let phoneNumber = $state('+855');
	let comment = $state('');
	let paymentMethod = $state<'aba' | 'ipay88' | 'telegram_stars' | null>(null);
	let isProcessing = $state(false);
	let footerVisible = $state(true);

	const eventBrandIds = event.brandid.split(',').map(id => id.replace(/\^/g, ''));
	const eventBrands = $derived($brandsQuery.data?.filter(b => eventBrandIds.includes(b.brandid.toString())) || []);

	$effect(() => {
		if (guestCountString && !isNaN(parseInt(guestCountString))) {
			guestCount = parseInt(guestCountString);
		}
	});
	
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

	const totalItems = $derived(Object.values(selectedBrands).reduce((sum, qty) => sum + qty, 0));
	const estimatedTotal = $derived(totalItems * (event.eventschemaprice || 0));
	const canProceedFromStep1 = $derived(totalItems > 0);
	const canProceedFromStep2 = $derived(guestCount >= 1 && phoneNumber.length > 4);
	const canProceedFromStep3 = $derived(comment.length <= 200);
	const canCompleteBooking = $derived(paymentMethod !== null);
	const progressPercentage = $derived((currentStep / 4) * 100);

	function toggleFooter(show: boolean) {
		if (!show) {
			setTimeout(() => footerVisible = false, 300);
		} else {
			footerVisible = true;
		}
	}

	function updateBrandQuantity(brandId: string, quantity: number) {
		if (quantity === 0) {
			delete selectedBrands[brandId];
			selectedBrands = {...selectedBrands};
		} else {
			selectedBrands[brandId] = quantity;
			selectedBrands = {...selectedBrands};
		}
	}

	function nextStep() {
		if (currentStep < 4) {
			currentStep += 1;
			window.scrollTo(0, 0);
		}
	}

	function prevStep() {
		if (currentStep > 1) {
			currentStep -= 1;
			window.scrollTo(0, 0);
		} else {
			dispatch('goBack');
		}
	}

	function handleCancel() {
		dispatch('cancel');
	}

	async function handleCompleteBooking() {
		isProcessing = true;
		await new Promise(resolve => setTimeout(resolve, 2000));
		isProcessing = false;
		dispatch('complete');
	}

	const stepTitles = ['Drinks', 'Guests', 'Details', 'Payment'];
</script>

<div class="space-y-8">
	<div class="text-center space-y-4 pt-6">
		<h1 class="text-2xl font-bold">Book Your Event</h1>
		<p class="text-muted-foreground">{event.eventtitle} at {venue.venuename}</p>
	</div>
	
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
										<Avatar.Fallback class="rounded-lg bg-muted" />
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
						<p class="text-sm text-muted-foreground">Estimated Total: ${estimatedTotal}</p>
					</div>
				{/if}
			</div>
		{:else if currentStep === 2}
			<div class="space-y-4">
				<h3 class="text-lg font-semibold">Guest Information</h3>
				<div class="space-y-4">
					<div class="space-y-2">
						<Label.Label for="guestCount">Number of Guests</Label.Label>
						<Select.Root type="single" bind:value={guestCountString}>
							<Select.Trigger>
								{guestCount} Guest{guestCount > 1 ? 's' : ''}
							</Select.Trigger>
							<Select.Content>
								{#each Array(10) as _, i}
									<Select.Item value={(i + 1).toString()}>{i + 1} Guest{i > 0 ? 's' : ''}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>
					<div class="space-y-2">
						<Label.Label for="phone">Phone Number</Label.Label>
						<Input.Input 
							id="phone" 
							type="tel" 
							bind:value={phoneNumber} 
							placeholder="+855 12 345 678"
							onfocus={() => toggleFooter(false)}
							onblur={() => toggleFooter(true)}
						/>
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
							bind:value={comment} 
							placeholder="Any special requests or notes..." 
							maxlength="200"
							onfocus={() => toggleFooter(false)}
							onblur={() => toggleFooter(true)}
						/>
						<p class="text-xs text-muted-foreground">{comment.length}/200 characters</p>
					</div>
				</div>

				<div class="p-4 bg-muted rounded-lg space-y-2">
					<h4 class="font-medium">Booking Summary</h4>
					<p class="text-sm">Items: {totalItems}</p>
					<p class="text-sm">Estimated Total: ${estimatedTotal}</p>
				</div>
			</div>
		{:else if currentStep === 4}
			<div class="space-y-4">
				<h3 class="text-lg font-semibold">Payment Method</h3>
				<RadioGroup.Root bind:value={paymentMethod} class="space-y-3">
					<div class="flex items-center space-x-2">
						<RadioGroup.RadioGroupItem value="aba" id="aba" />
						<Label.Label for="aba" class="flex-1 cursor-pointer">
							<Card.Card class="p-4">
								<div class="flex items-center gap-3">
									<div class="text-2xl">🏦</div>
									<div>
										<h4 class="font-medium">ABA QR Pay</h4>
										<p class="text-sm text-muted-foreground">Pay with ABA Bank mobile app</p>
									</div>
								</div>
							</Card.Card>
						</Label.Label>
					</div>
						
					<div class="flex items-center space-x-2">
						<RadioGroup.RadioGroupItem value="ipay88" id="ipay88" />
						<Label.Label for="ipay88" class="flex-1 cursor-pointer">
							<Card.Card class="p-4">
								<div class="flex items-center gap-3">
									<div class="text-2xl">💳</div>
									<div>
										<h4 class="font-medium">iPay88</h4>
										<p class="text-sm text-muted-foreground">Credit card, mobile banking</p>
									</div>
								</div>
							</Card.Card>
						</Label.Label>
					</div>

					<div class="flex items-center space-x-2">
						<RadioGroup.RadioGroupItem value="telegram_stars" id="telegram_stars" />
						<Label.Label for="telegram_stars" class="flex-1 cursor-pointer">
							<Card.Card class="p-4">
								<div class="flex items-center gap-3">
									<div class="text-2xl">⭐</div>
									<div>
										<h4 class="font-medium">Telegram Stars</h4>
										<p class="text-sm text-muted-foreground">Pay with Telegram Stars</p>
									</div>
								</div>
							</Card.Card>
						</Label.Label>
					</div>
				</RadioGroup.Root>

				<div class="p-4 bg-muted rounded-lg space-y-2">
					<h4 class="font-medium">Final Summary</h4>
					<p class="text-sm">Event: {event.eventtitle}</p>
					<p class="text-sm">Venue: {venue?.venuename}</p>
					<p class="text-sm">Guests: {guestCount}</p>
					<p class="text-sm">Total Amount: ${estimatedTotal}</p>
				</div>
			</div>
		{/if}
	</div>
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