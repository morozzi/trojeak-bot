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

	export let event: Event;
	export let availableBrands: Brand[];
	export let onComplete: () => void;
	export let onCancel: () => void;

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
				<p class="step-description">Choose from available brands at this event</p>
				
				<div class="brands-grid">
					{#each availableBrands as brand}
						<div class="brand-card">
							<div class="brand-info">
								<h4 class="brand-name">{brand.name}</h4>
								<p class="brand-type">{brand.type}</p>
								<p class="brand-description">{brand.description}</p>
							</div>
							
							<div class="quantity-selector">
								<button 
									class="qty-btn"
									onclick={() => updateBrandQuantity(brand.id, Math.max(0, (selectedBrands[brand.id] || 0) - 1))}
									disabled={!selectedBrands[brand.id]}
								>-</button>
								<span class="qty-display">{selectedBrands[brand.id] || 0}</span>
								<button 
									class="qty-btn"
									onclick={() => updateBrandQuantity(brand.id, Math.min(10, (selectedBrands[brand.id] || 0) + 1))}
								>+</button>
							</div>
						</div>
					{/each}
				</div>

				{#if totalItems > 0}
					<div class="selection-summary">
						<p class="summary-text">
							Selected: <span class="highlight">{totalItems}</span> items
						</p>
					</div>
				{/if}
			</div>

		{:else if currentStep === 2}
			<!-- Step 2: Guest Details -->
			<div class="step-content animate-fade-in">
				<h3 class="step-title">Guest Details</h3>
				<p class="step-description">Tell us about your party</p>
				
				<div class="form-group">
					<label class="form-label">Number of Guests</label>
					<select bind:value={guestCount} class="form-input form-select">
						{#each Array.from({length: 10}, (_, i) => i + 1) as num}
							<option value={num}>{num} {num === 1 ? 'guest' : 'guests'}</option>
						{/each}
					</select>
				</div>

				<div class="form-group">
					<label class="form-label">Phone Number</label>
					<input 
						type="tel" 
						value={phoneNumber}
						oninput={handlePhoneInput}
						class="form-input"
						placeholder="+855 XX XXX XXX"
					/>
					<p class="form-hint">We'll send booking confirmation to this number</p>
				</div>
			</div>

		{:else if currentStep === 3}
			<!-- Step 3: Review & Comment -->
			<div class="step-content animate-fade-in">
				<h3 class="step-title">Review Your Booking</h3>
				<p class="step-description">Double-check everything looks good</p>
				
				<!-- Booking Summary -->
				<div class="booking-summary">
					<div class="summary-section">
						<h4 class="summary-title">Event Details</h4>
						<p>{event.title}</p>
						<p>{event.venue_name}, {event.city}</p>
						<p>{event.date}</p>
					</div>

					<div class="summary-section">
						<h4 class="summary-title">Your Party</h4>
						<p>{guestCount} {guestCount === 1 ? 'guest' : 'guests'}</p>
						<p>{phoneNumber}</p>
					</div>

					<div class="summary-section">
						<h4 class="summary-title">Selected Drinks</h4>
						{#each Object.entries(selectedBrands) as [brandId, quantity]}
							{@const brand = availableBrands.find(b => b.id === brandId)}
							{#if brand}
								<p>{quantity}x {brand.name}</p>
							{/if}
						{/each}
					</div>
				</div>

				<div class="form-group">
					<label class="form-label">Special Requests (Optional)</label>
					<textarea 
						bind:value={comment}
						class="form-input"
						rows="3"
						maxlength="200"
						placeholder="Any special requests or notes..."
					></textarea>
					<p class="form-hint">{comment.length}/200 characters</p>
				</div>
			</div>

		{:else if currentStep === 4}
			<!-- Step 4: Payment -->
			<div class="step-content animate-fade-in">
				<h3 class="step-title">Choose Payment Method</h3>
				<p class="step-description">Secure payment to confirm your booking</p>
				
				<div class="payment-methods">
					<button 
						class="payment-option"
						class:selected={paymentMethod === 'aba'}
						onclick={() => paymentMethod = 'aba'}
					>
						<div class="payment-icon">🏦</div>
						<div class="payment-info">
							<h4>ABA QR Pay</h4>
							<p>Pay with ABA mobile app</p>
						</div>
						<div class="payment-check">
							{#if paymentMethod === 'aba'}✓{/if}
						</div>
					</button>

					<button 
						class="payment-option"
						class:selected={paymentMethod === 'ipay88'}
						onclick={() => paymentMethod = 'ipay88'}
					>
						<div class="payment-icon">💳</div>
						<div class="payment-info">
							<h4>Card Payment</h4>
							<p>Credit/debit cards via iPay88</p>
						</div>
						<div class="payment-check">
							{#if paymentMethod === 'ipay88'}✓{/if}
						</div>
					</button>
				</div>

				<div class="total-summary">
					<div class="total-line">
						<span>Items ({totalItems})</span>
						<span>${estimatedTotal}</span>
					</div>
					<div class="total-line final">
						<span>Total</span>
						<span class="total-amount">${estimatedTotal}</span>
					</div>
				</div>
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