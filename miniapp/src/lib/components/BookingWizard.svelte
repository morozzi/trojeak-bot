<script lang="ts">
	import * as Button from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Input from '$lib/components/ui/input/index.js';
	import * as Label from '$lib/components/ui/label/index.js';
	import * as Textarea from '$lib/components/ui/textarea/index.js';
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import * as Progress from '$lib/components/ui/progress/index.js';
	import * as Separator from '$lib/components/ui/separator/index.js';
	import * as Badge from '$lib/components/ui/badge/index.js';
	import * as Select from '$lib/components/ui/select/index.js';

	interface Event {
		id: string;
		title: string;
		venue_id: string;
		venue_name: string;
		city: string;
		featured: boolean;
		brands: string[];
		price_range: string;
		date: string;
		description: string;
	}

	interface Brand {
		id: string;
		name: string;
		type: 'beer' | 'wine' | 'spirits';
		featured: boolean;
		description: string;
	}

	interface Props {
		event: Event;
		availableBrands: Brand[];
		onComplete: () => void;
		onCancel: () => void;
	}

	const { event, availableBrands, onComplete, onCancel }: Props = $props();

	let currentStep = $state(1);
	let selectedBrands = $state<{[key: string]: number}>({});
	let guestCount = $state(1);
	let guestCountString = $state("1");
	let phoneNumber = $state('+855');
	let comment = $state('');
	let paymentMethod = $state<'aba' | 'ipay88' | null>(null);
	let isProcessing = $state(false);

	$effect(() => {
		if (guestCountString && !isNaN(parseInt(guestCountString))) {
			guestCount = parseInt(guestCountString);
		}
	});

	const totalItems = $derived(Object.values(selectedBrands).reduce((sum, qty) => sum + qty, 0));
	const estimatedTotal = $derived(totalItems * 12);
	const canProceedFromStep1 = $derived(totalItems > 0);
	const canProceedFromStep2 = $derived(guestCount >= 1 && phoneNumber.length > 4);
	const canProceedFromStep3 = $derived(comment.length <= 200);
	const canCompleteBooking = $derived(paymentMethod !== null);
	const progressPercentage = $derived((currentStep / 4) * 100);

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
		}
	}

	function prevStep() {
		if (currentStep > 1) {
			currentStep -= 1;
		}
	}

	async function handleCompleteBooking() {
		isProcessing = true;
		await new Promise(resolve => setTimeout(resolve, 2000));
		isProcessing = false;
		onComplete();
	}

	const stepTitles = ['Drinks', 'Guests', 'Details', 'Payment'];
</script>

<div class="min-h-screen bg-background p-6 max-w-2xl mx-auto">
	<Card.Card>
		<Card.CardHeader class="text-center">
			<Card.CardTitle class="text-2xl font-bold">Book Your Event</Card.CardTitle>
			<p class="text-muted-foreground">{event.title} at {event.venue_name}</p>
		</Card.CardHeader>
		
		<Card.CardContent class="space-y-6">
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
							<span class="text-xs text-center {currentStep === index + 1 ? 'text-foreground font-medium' : 'text-muted-foreground'}">{title}</span>
						</div>
					{/each}
				</div>
				<Progress.Progress value={progressPercentage} class="h-2" />
			</div>

			<Separator.Separator />

			{#if currentStep === 1}
				<div class="space-y-4">
					<h3 class="text-lg font-semibold">Select Your Drinks</h3>
					<div class="grid gap-4">
						{#each availableBrands as brand}
							<Card.Card class="p-4">
								<div class="flex justify-between items-start">
									<div class="flex-1">
										<h4 class="font-medium">{brand.name}</h4>
										<p class="text-sm text-muted-foreground">{brand.description}</p>
										<Badge.Badge variant="secondary" class="mt-2">{brand.type}</Badge.Badge>
									</div>
									<div class="flex items-center gap-2">
										<Button.Button 
											variant="outline" 
											size="sm"
											onclick={() => updateBrandQuantity(brand.id, Math.max(0, (selectedBrands[brand.id] || 0) - 1))}
										>
											-
										</Button.Button>
										<span class="w-8 text-center">{selectedBrands[brand.id] || 0}</span>
										<Button.Button 
											variant="outline" 
											size="sm"
											onclick={() => updateBrandQuantity(brand.id, (selectedBrands[brand.id] || 0) + 1)}
										>
											+
										</Button.Button>
									</div>
								</div>
							</Card.Card>
						{/each}
					</div>
				</div>
			{/if}

			{#if currentStep === 2}
				<div class="space-y-4">
					<h3 class="text-lg font-semibold">Guest Details</h3>
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
								bind:value={phoneNumber}
								placeholder="+855 12 345 678"
								type="tel"
							/>
						</div>
					</div>
				</div>
			{/if}

			{#if currentStep === 3}
				<div class="space-y-4">
					<h3 class="text-lg font-semibold">Additional Information</h3>
					<div class="space-y-2">
						<Label.Label for="comment">Special Requests (optional)</Label.Label>
						<Textarea.Textarea 
							id="comment"
							bind:value={comment}
							placeholder="Any dietary restrictions, seating preferences..."
							class="min-h-[100px]"
						/>
					</div>
				</div>
			{/if}

			{#if currentStep === 4}
				<div class="space-y-4">
					<h3 class="text-lg font-semibold">Payment Method</h3>
					<RadioGroup.RadioGroup bind:value={paymentMethod}>
						<div class="space-y-3">
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
												<p class="text-sm text-muted-foreground">Credit card, bank transfer, mobile banking</p>
											</div>
										</div>
									</Card.Card>
								</Label.Label>
							</div>
						</div>
					</RadioGroup.RadioGroup>
				</div>
			{/if}

			{#if totalItems > 0}
				<div class="space-y-4">
					<Separator.Separator />
					<Card.Card class="p-4">
						<h4 class="font-medium mb-3">Order Summary</h4>
						<div class="space-y-2">
							{#each Object.entries(selectedBrands) as [brandId, quantity]}
								{@const brand = availableBrands.find(b => b.id === brandId)}
								{#if brand}
									<div class="flex justify-between text-sm">
										<span>{brand.name} × {quantity}</span>
										<span>${quantity * 12}</span>
									</div>
								{/if}
							{/each}
							<Separator.Separator />
							<div class="flex justify-between font-medium">
								<span>Total x {totalItems}</span>
								<span>${estimatedTotal}</span>
							</div>
						</div>
					</Card.Card>
				</div>
			{/if}

			<div class="flex justify-between pt-4">
				<Button.Button variant="outline" onclick={onCancel}>
					Cancel
				</Button.Button>
				
				<div class="flex gap-2">
					{#if currentStep > 1}
						<Button.Button variant="outline" onclick={prevStep}>
							Back
						</Button.Button>
					{/if}
					
					{#if currentStep < 4}
						<Button.Button 
							onclick={nextStep}
							disabled={
								(currentStep === 1 && !canProceedFromStep1) ||
								(currentStep === 2 && !canProceedFromStep2) ||
								(currentStep === 3 && !canProceedFromStep3)
							}
						>
							Continue
						</Button.Button>
					{:else}
						<Button.Button 
							onclick={handleCompleteBooking}
							disabled={!canCompleteBooking || isProcessing}
						>
							{#if isProcessing}
								Processing...
							{:else}
								Complete Booking
							{/if}
						</Button.Button>
					{/if}
				</div>
			</div>
		</Card.CardContent>
	</Card.Card>
</div>