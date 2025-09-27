<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { createEventDispatcher } from 'svelte';
	import { Button } from "@/components/ui/button";
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
	import { Input } from "@/components/ui/input";
	import { Label } from "@/components/ui/label";
	import { Textarea } from "@/components/ui/textarea";
	import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
	import { Progress } from "@/components/ui/progress";
	import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
	import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
	import { Separator } from "@/components/ui/separator/index.js";
	import Loading from '@/lib/components/Loading.svelte';
	import type { Event } from '@/lib/types/api.js';
	import type { ViewType } from '@/lib/types/components.js';
	import { appStore, appActions } from '@/lib/stores/app.js';
	import { userStore } from '@/lib/stores/user.js';
	import { BookingValidator, type BookingData } from '@/lib/api/validation.js';

	interface Props {
		event: Event;
	}
	
	const { event }: Props = $props();
	
	let isProcessing = $state(false);
	let phoneInputTouched = $state(false);
	let footerVisible = $state(true);
	let isMobile = $state(false);

	const dispatch = createEventDispatcher<{
		navigate: { view: ViewType };
		footerVisibilityChange: { visible: boolean };
		validationChange: { canProceed: boolean; canComplete: boolean; isProcessing: boolean };
	}>();

	const brandsQuery = createQuery({
		queryKey: ['brands'],
		queryFn: async () => {
			const response = await fetch(`/api/brands.php`);
			if (!response.ok) throw new Error('Failed to fetch brands');
			return response.json();
		}
	});
	
	const stepTitles = ['Drinks', 'Guests', 'Details', 'Payment'];
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

	const selectedDrinksDetails = $derived(
		Object.entries(selectedBrands).map(([brandId, quantity]) => {
			const brand = eventBrands.find(b => b.brandid.toString() === brandId);
			const amount = quantity * (event.eventschemaprice || 0);
			return {
				brandId,
				brandName: brand?.brandname || 'Unknown',
				quantity,
				amount
			};
		})
	);
	
	const totalAmount = $derived(
		selectedDrinksDetails.reduce((sum, item) => sum + item.amount, 0)
	);
	
	const formattedTotal = $derived(
		constants ? `${constants.CURRENCY_SYMBOL}${totalAmount.toFixed(constants.CURRENCY_PRECISION)}` : `${totalAmount}`
	);
	
	const phoneValidation = $derived.by(() => {
		return validator?.phoneSchema.safeParse(phone).success;
	});

	const commentValidation = $derived.by(() => {
		return validator?.commentSchema.safeParse(comment).success;
	});
	
	const canProceedFromStep1 = $derived(totalItems > 0);
	const canProceedFromStep2 = $derived(phoneValidation);
	const canProceedFromStep3 = $derived(commentValidation);
	const canCompleteBooking = $derived(paymentMethod !== '');
	const progressPercentage = $derived((currentStep / stepTitles.length) * 100);

	const canProceed = $derived(() => {
		switch (currentStep) {
			case 1: return canProceedFromStep1;
			case 2: return canProceedFromStep2;
			case 3: return canProceedFromStep3;
			default: return true;
		}
	});

	$effect(() => {
		if (!$appStore.bookingState) {
			appActions.startBooking(event.eventid.toString());
		}
		
		if (currentStep !== 2) {
			phoneInputTouched = false;
		}
	});

	$effect(() => {
		const mediaQuery = window.matchMedia('(max-width: 768px)');
		isMobile = mediaQuery.matches;
		
		const handler = (e: MediaQueryListEvent) => isMobile = e.matches;
		mediaQuery.addEventListener('change', handler);
		return () => mediaQuery.removeEventListener('change', handler);
	});

	$effect(() => {
		dispatch('validationChange', {
			canProceed: canProceed(),
			canComplete: canCompleteBooking,
			isProcessing
		});
	});

	function toggleFooter(show: boolean) {
		if (!isMobile) return;
		
		if (!show) {
			setTimeout(() => {
				footerVisible = false;
				dispatch('footerVisibilityChange', { visible: false });
			}, 300);
		} else {
			footerVisible = true;
			dispatch('footerVisibilityChange', { visible: true });
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

	function updatePaymentMethod(value: 'aba' | 'ipay88' | 'stars') {
		appActions.updateBookingState({ paymentMethod: value });
	}

	const bookingSummary = $derived.by(() => {
		if (selectedDrinksDetails.length === 0) {
			return { items: [], total: '$0.00' };
		}
		
		const formattedItems = selectedDrinksDetails.map(item => {
			const subtotal = constants ? `${constants.CURRENCY_SYMBOL}${item.amount.toFixed(constants.CURRENCY_PRECISION)}` : `${item.amount}`;
			return `• ${item.brandName} × ${item.quantity} = ${subtotal}`;
		});
		
		return {
			items: formattedItems,
			total: formattedTotal
		};
	});
</script>

<div class="space-y-8">
	<div class="text-center space-y-4 pt-6">
		<h1 class="text-2xl font-bold">Book Your Event</h1>
		<p class="text-muted-foreground">{event.eventtitle} at {event.venuename}</p>
	</div>
	
	{#if $brandsQuery.isLoading}
		<Loading variant="booking" />
	{:else if $brandsQuery.error}
		<Card>
			<CardContent class="p-4">
				<p class="text-destructive">Failed to load drink options. Please try again.</p>
			</CardContent>
		</Card>
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
				<Progress value={progressPercentage} class="w-full" />
			</div>

			{#if currentStep === 1}
				<div class="space-y-6">
					<h3 class="text-center text-xl font-semibold">Select Your Drinks</h3>
					<div class="grid gap-4">
						{#if eventBrands && eventBrands.length > 0}
						{#each eventBrands as brand}
							<Card class="p-4">
								<div class="flex justify-between items-center">
									<div class="flex items-center gap-4">
										<Avatar class="w-12 h-12 rounded-lg">
											{#if brand.brandpic1}
												<AvatarImage src="/pic/brand/{brand.brandpic1}" alt={brand.brandname} class="rounded-lg" />
											{/if}
											<AvatarFallback>{brand.brandname.charAt(0)}</AvatarFallback>
										</Avatar>
										<div>
											<h4 class="font-medium">{brand.brandname}</h4>
											{#if event.eventschemaprice}
												<p class="text-sm text-muted-foreground">{constants.CURRENCY_SYMBOL}{event.eventschemaprice}</p>
											{/if}
										</div>
									</div>
									<div class="flex items-center gap-1">
										<Button variant="outline" size="sm" onclick={() => updateBrandQuantity(brand.brandid.toString(), Math.max(0, (selectedBrands[brand.brandid.toString()] || 0) - 1))}>-</Button>
										<span class="w-8 text-center">{selectedBrands[brand.brandid.toString()] || 0}</span>
										<Button variant="outline" size="sm" onclick={() => updateBrandQuantity(brand.brandid.toString(), Math.min((selectedBrands[brand.brandid.toString()] || 0) + 1, constants.MAX_QTY_PER_BRAND))}>+</Button>
									</div>
								</div>
							</Card>
						{/each}
						{/if}
					</div>
					{#if totalItems > 0}
						<Card>
							<CardHeader>
								<CardTitle class="text-base">Booking Summary</CardTitle>
							</CardHeader>
							<CardContent class="space-y-3">
								{#each bookingSummary.items as item}
									<p class="text-sm">{item}</p>
								{/each}
								<Separator />
								<CardFooter class="p-0">
									<p class="text-sm font-medium">Total Amount: {bookingSummary.total}</p>
								</CardFooter>
							</CardContent>
						</Card>
					{/if}
				</div>
			{:else if currentStep === 2}
				<div class="space-y-6">
					<h3 class="text-center text-xl font-semibold">Guest Information</h3>
					<div class="space-y-4">
						<div class="space-y-2">
							<Label for="guestCount">Number of Guests</Label>
							<Select type="single" value={guests.toString()} onValueChange={updateGuests}>
								<SelectTrigger>
									{guests} Guest{guests > 1 ? 's' : ''}
								</SelectTrigger>
								<SelectContent>
									{#each Array(constants.MAX_GUESTS) as _, i}
										<SelectItem value={(i + 1).toString()}>{i + 1} Guest{i > 0 ? 's' : ''}</SelectItem>
									{/each}
								</SelectContent>
							</Select>
						</div>
						<div class="space-y-2">
							<Label for="phone">Phone Number</Label>
							<Input 
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
					<Card>
						<CardHeader>
							<CardTitle class="text-base">Booking Summary</CardTitle>
						</CardHeader>
						<CardContent class="space-y-3">
							{#each bookingSummary.items as item}
								<p class="text-sm">{item}</p>
							{/each}
							<Separator />
							<CardFooter class="p-0">
								<p class="text-sm font-medium">Total Amount: {bookingSummary.total}</p>
							</CardFooter>
						</CardContent>
					</Card>
				</div>
			{:else if currentStep === 3}
				<div class="space-y-6">
					<h3 class="text-center text-xl font-semibold">Additional Details</h3>
					<div class="space-y-4">
						<div class="space-y-2">
							<Label for="comment">Special Requests (Optional)</Label>
							<Textarea 
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

					<Card>
						<CardHeader>
							<CardTitle class="text-base">Booking Summary</CardTitle>
						</CardHeader>
						<CardContent class="space-y-3">
							{#each bookingSummary.items as item}
								<p class="text-sm">{item}</p>
							{/each}
							<Separator />
							<CardFooter class="p-0">
								<p class="text-sm font-medium">Total Amount: {bookingSummary.total}</p>
							</CardFooter>
						</CardContent>
					</Card>
				</div>
			{:else if currentStep === 4}
				<div class="space-y-6">
					<h3 class="text-center text-xl font-semibold">Payment Method</h3>
					<RadioGroup value={paymentMethod} onValueChange={updatePaymentMethod} class="space-y-3">
						<div class="flex items-center space-x-2">
							<RadioGroupItem value="aba" />
							<Label for="aba" class="flex items-center gap-2">
								<span>🏦 ABA QR Pay</span>
								<span class="text-xs text-muted-foreground">- Scan QR code with ABA Mobile</span>
							</Label>
						</div>
						<div class="flex items-center space-x-2">
							<RadioGroupItem value="ipay88" />
							<Label for="ipay88" class="flex items-center gap-2">
								<span>💳 Credit/Debit Card</span>
								<span class="text-xs text-muted-foreground">- Visa, MasterCard, Local Banks</span>
							</Label>
						</div>
						<div class="flex items-center space-x-2">
							<RadioGroupItem value="stars" />
							<Label for="stars" class="flex items-center gap-2">
								<span>⭐ Telegram Stars</span>
								<span class="text-xs text-muted-foreground">- Pay with Telegram Stars</span>
							</Label>
						</div>
					</RadioGroup>

					<Card>
						<CardHeader>
							<CardTitle class="text-base">Booking Summary</CardTitle>
						</CardHeader>
						<CardContent class="space-y-3">
							<p class="text-sm">Event: {event.eventtitle}</p>
							<p class="text-sm">Venue: {event.venuename}</p>
							<p class="text-sm">Guests: {guests}</p>
							<Separator />
							{#each bookingSummary.items as item}
								<p class="text-sm">{item}</p>
							{/each}
							<Separator />
							<CardFooter class="p-0">
								<p class="text-sm font-medium">Total Amount: {bookingSummary.total}</p>
							</CardFooter>
						</CardContent>
					</Card>
				</div>
			{/if}
		</div>
	{/if}
</div>