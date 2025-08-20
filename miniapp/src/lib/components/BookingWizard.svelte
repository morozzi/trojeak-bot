<!-- miniapp/src/lib/components/BookingWizard.svelte -->
<script lang="ts">
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

	interface BookingWizardProps {
		event: Event;
		availableBrands: Brand[];
		onComplete: () => void;
		onCancel: () => void;
	}

	// Use $props() instead of export let for Svelte 5
	const { event, availableBrands, onComplete, onCancel }: BookingWizardProps = $props();

	// Booking state
	let currentStep = $state(1);
	let selectedBrands = $state<{[key: string]: number}>({});
	let guestCount = $state(2);
	let phoneNumber = $state('+855');
	let comment = $state('');
	let paymentMethod = $state<'aba' | 'ipay88' | null>(null);
	let isProcessing = $state(false);

	// Computed values
	const totalItems = $derived(Object.values(selectedBrands).reduce((sum, qty) => sum + qty, 0));
	const estimatedTotal = $derived(totalItems * 12); // Rough estimate
	const canProceedFromStep1 = $derived(totalItems > 0);
	const canProceedFromStep2 = $derived(guestCount > 0 && phoneNumber.length > 4);
	const canProceedFromStep3 = $derived(comment.length <= 200);
	const canCompleteBooking = $derived(paymentMethod !== null);

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

	function handleCompleteBooking() {
		isProcessing = true;
		
		// Simulate payment processing
		setTimeout(() => {
			isProcessing = false;
			onComplete();
		}, 2000);
	}

	function formatPhoneNumber(value: string) {
		// Basic Cambodia phone formatting
		let cleaned = value.replace(/\D/g, '');
		if (!cleaned.startsWith('855')) {
			cleaned = '855' + cleaned.replace(/^0+/, '');
		}
		return '+' + cleaned;
	}

	function handlePhoneInput(event: any) {
		phoneNumber = formatPhoneNumber(event.target.value);
	}
</script>

<div class="booking-container">
	<!-- Header -->
	<div class="booking-header">
		<h2 class="booking-title gradient-text">Book Your Experience</h2>
		<p class="booking-subtitle">{event.title} at {event.venue_name}</p>
		
		<!-- Progress Steps -->
		<div class="progress-container">
			{#each [1, 2, 3, 4] as step}
				<div class="progress-step" class:active={currentStep >= step}>
					<div class="step-number">{step}</div>
					<div class="step-label">
						{#if step === 1}Drinks
						{:else if step === 2}Details  
						{:else if step === 3}Review
						{:else}Payment
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Step Content -->
	<div class="booking-content">
		{#if currentStep === 1}
			<!-- Step 1: Select Drinks -->
			<div class="step-content animate-fade-in">
				<h3 class="step-title">Select Your Drinks</h3>
				<p class="step-description">Choose from available brands for this event</p>
				
				<div class="brands-grid">
					{#each availableBrands as brand}
						<div class="brand-card">
							<div class="brand-info">
								<h4 class="brand-name">{brand.name}</h4>
								<p class="brand-type">{brand.type}</p>
								<p class="brand-description">{brand.description}</p>
							</div>
							
							<div class="quantity-controls">
								<button 
									class="qty-btn"
									onclick={() => updateBrandQuantity(brand.id, Math.max(0, (selectedBrands[brand.id] || 0) - 1))}
									disabled={!selectedBrands[brand.id]}
								>
									-
								</button>
								<span class="quantity">{selectedBrands[brand.id] || 0}</span>
								<button 
									class="qty-btn"
									onclick={() => updateBrandQuantity(brand.id, (selectedBrands[brand.id] || 0) + 1)}
								>
									+
								</button>
							</div>
						</div>
					{/each}
				</div>

				{#if totalItems > 0}
					<div class="selection-summary">
						<div class="summary-item">
							<span>Total items: {totalItems}</span>
							<span>Estimated: ${estimatedTotal}</span>
						</div>
					</div>
				{/if}
			</div>
		{:else if currentStep === 2}
			<!-- Step 2: Guest Details -->
			<div class="step-content animate-fade-in">
				<h3 class="step-title">Booking Details</h3>
				<p class="step-description">Tell us about your group</p>
				
				<div class="form-group">
					<label for="guests">Number of Guests</label>
					<input 
						type="number" 
						id="guests"
						bind:value={guestCount}
						min="1" 
						max="20"
						class="form-input"
					/>
				</div>

				<div class="form-group">
					<label for="phone">Phone Number</label>
					<input 
						type="tel" 
						id="phone"
						value={phoneNumber}
						oninput={handlePhoneInput}
						placeholder="+855 12 345 678"
						class="form-input"
					/>
				</div>
			</div>
		{:else if currentStep === 3}
			<!-- Step 3: Additional Details -->
			<div class="step-content animate-fade-in">
				<h3 class="step-title">Additional Information</h3>
				<p class="step-description">Any special requests or comments?</p>
				
				<div class="form-group">
					<label for="comment">Comments (Optional)</label>
					<textarea 
						id="comment"
						bind:value={comment}
						placeholder="Special requests, dietary restrictions, etc."
						maxlength="200"
						rows="4"
						class="form-textarea"
					></textarea>
					<div class="char-count">
						{comment.length}/200 characters
					</div>
				</div>

				<!-- Booking Summary -->
				<div class="booking-summary">
					<h4 class="summary-title">Booking Summary</h4>
					<div class="summary-details">
						<div class="summary-item">
							<span>Event:</span>
							<span>{event.title}</span>
						</div>
						<div class="summary-item">
							<span>Venue:</span>
							<span>{event.venue_name}</span>
						</div>
						<div class="summary-item">
							<span>Date:</span>
							<span>{event.date}</span>
						</div>
						<div class="summary-item">
							<span>Guests:</span>
							<span>{guestCount}</span>
						</div>
						<div class="summary-item">
							<span>Phone:</span>
							<span>{phoneNumber}</span>
						</div>
					</div>
					
					{#if totalItems > 0}
						<div class="drinks-summary">
							<h5>Selected Drinks:</h5>
							{#each Object.entries(selectedBrands) as [brandId, qty]}
								{@const brand = availableBrands.find(b => b.id === brandId)}
								{#if brand}
									<div class="drink-item">
										<span>{brand.name}</span>
										<span>×{qty}</span>
									</div>
								{/if}
							{/each}
						</div>
					{/if}
				</div>
			</div>
		{:else if currentStep === 4}
			<!-- Step 4: Payment -->
			<div class="step-content animate-fade-in">
				<h3 class="step-title">Choose Payment Method</h3>
				<p class="step-description">How would you like to pay?</p>
				
				<div class="payment-methods">
					<label class="payment-option">
						<input 
							type="radio" 
							name="payment"
							value="aba"
							onchange={() => paymentMethod = 'aba'}
							checked={paymentMethod === 'aba'}
						/>
						<div class="payment-card">
							<div class="payment-info">
								<h4>ABA QR Pay</h4>
								<p>Pay with ABA mobile banking</p>
							</div>
							<div class="payment-logo">🏦</div>
						</div>
					</label>

					<label class="payment-option">
						<input 
							type="radio" 
							name="payment"
							value="ipay88"
							onchange={() => paymentMethod = 'ipay88'}
							checked={paymentMethod === 'ipay88'}
						/>
						<div class="payment-card">
							<div class="payment-info">
								<h4>iPay88</h4>
								<p>Credit/Debit cards & online banking</p>
							</div>
							<div class="payment-logo">💳</div>
						</div>
					</label>
				</div>

				{#if totalItems > 0}
					<div class="final-total">
						<div class="total-breakdown">
							<div class="total-item">
								<span>Drinks ({totalItems} items)</span>
								<span>${estimatedTotal}</span>
							</div>
							<div class="total-item final">
								<span>Total</span>
								<span class="total-amount">${estimatedTotal}</span>
							</div>
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Navigation Buttons -->
	<div class="booking-actions">
		<button class="btn btn-outline" onclick={onCancel}>
			Cancel
		</button>
		
		<div class="action-buttons">
			{#if currentStep > 1}
				<button class="btn btn-outline" onclick={prevStep}>
					Back
				</button>
			{/if}
			
			{#if currentStep < 4}
				<button 
					class="btn btn-primary"
					onclick={nextStep}
					disabled={
						(currentStep === 1 && !canProceedFromStep1) ||
						(currentStep === 2 && !canProceedFromStep2) ||
						(currentStep === 3 && !canProceedFromStep3)
					}
				>
					Continue
				</button>
			{:else}
				<button 
					class="btn btn-primary"
					onclick={handleCompleteBooking}
					disabled={!canCompleteBooking || isProcessing}
				>
					{#if isProcessing}
						Processing...
					{:else}
						Complete Booking
					{/if}
				</button>
			{/if}
		</div>
	</div>
</div>