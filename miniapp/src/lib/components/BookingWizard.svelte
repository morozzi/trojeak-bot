<script lang="ts">
	import { z } from 'zod';

	interface Brand {
		id: string;
		name: string;
		type: 'beer' | 'wine' | 'spirits';
		featured: boolean;
		description: string;
	}

	interface Event {
		id: string;
		title: string;
		venue_name: string;
		city: string;
		date: string;
		price_range: string;
	}

	interface BookingFormData {
		eventId: string;
		selectedBrands: Array<{ brandId: string; quantity: number }>;
		guestCount: number;
		phone: string;
		comment: string;
		paymentMethod: 'aba_qr' | 'ipay88';
	}

	interface Props {
		event: Event;
		availableBrands: Brand[];
		onComplete: () => void;
		onCancel: () => void;
	}

	let { event, availableBrands, onComplete, onCancel }: Props = $props();

	const phoneSchema = z.string()
		.regex(/^\+855[0-9]{8,9}$/, 'Phone must be in format +855XXXXXXXX')
		.min(12, 'Phone number too short')
		.max(13, 'Phone number too long');

	const commentSchema = z.string()
		.max(200, 'Comment cannot exceed 200 characters')
		.optional();

	let step = $state<'brands' | 'details' | 'confirm' | 'success'>(availableBrands.length > 0 ? 'brands' : 'details');
	let errors = $state<Record<string, string>>({});

	let formData = $state<BookingFormData>({
		eventId: event.id,
		selectedBrands: [],
		guestCount: 1,
		phone: '',
		comment: '',
		paymentMethod: 'aba_qr'
	});

	const brandQuantities = $state<Record<string, number>>(
		Object.fromEntries(availableBrands.map(brand => [brand.id, 0]))
	);

	const totalItems = $derived(
		Object.values(brandQuantities).reduce((sum, qty) => sum + qty, 0)
	);

	const hasSelectedBrands = $derived(totalItems > 0);

	function updateBrandQuantity(brandId: string, quantity: number) {
		brandQuantities[brandId] = Math.max(0, Math.min(10, quantity));
		formData.selectedBrands = Object.entries(brandQuantities)
			.filter(([_, qty]) => qty > 0)
			.map(([brandId, quantity]) => ({ brandId, quantity }));
	}

	function validatePhone(): boolean {
		try {
			phoneSchema.parse(formData.phone);
			delete errors.phone;
			return true;
		} catch (err) {
			if (err instanceof z.ZodError) {
				errors.phone = err.errors[0].message;
			}
			return false;
		}
	}

	function validateComment(): boolean {
		try {
			commentSchema.parse(formData.comment);
			delete errors.comment;
			return true;
		} catch (err) {
			if (err instanceof z.ZodError) {
				errors.comment = err.errors[0].message;
			}
			return false;
		}
	}

	function proceedToDetails() {
		if (availableBrands.length > 0 && !hasSelectedBrands) {
			errors.brands = 'Please select at least one item';
			return;
		}
		delete errors.brands;
		step = 'details';
	}

	function proceedToConfirm() {
		const phoneValid = validatePhone();
		const commentValid = validateComment();
		
		if (!phoneValid || !commentValid) return;
		
		step = 'confirm';
	}

	function submitBooking() {
		const bookingRef = 'TRJ' + Date.now().toString().slice(-6);
		setTimeout(() => {
			step = 'success';
		}, 1000);
	}

	function getBrandName(brandId: string): string {
		return availableBrands.find(b => b.id === brandId)?.name || 'Unknown Brand';
	}
</script>

<div class="min-h-screen bg-gray-50">
	<div class="container mx-auto px-4 py-6">
		<div class="bg-white rounded-lg p-6">
			<div class="mb-6">
				<h2 class="text-xl font-bold text-gray-900">Book Event</h2>
				<p class="text-gray-600 text-sm mt-1">{event.title} • {event.venue_name}</p>
			</div>

			{#if step === 'brands'}
				<div>
					<h3 class="font-semibold text-gray-900 mb-4">Select Drinks</h3>
					
					{#if errors.brands}
						<div class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
							<p class="text-red-800 text-sm">{errors.brands}</p>
						</div>
					{/if}

					<div class="space-y-4 mb-6">
						{#each availableBrands as brand}
							<div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
								<div class="flex-1">
									<h4 class="font-medium text-gray-900">{brand.name}</h4>
									<p class="text-gray-600 text-sm">{brand.type}</p>
								</div>
								<div class="flex items-center space-x-3">
									<button 
										onclick={() => updateBrandQuantity(brand.id, brandQuantities[brand.id] - 1)}
										disabled={brandQuantities[brand.id] <= 0}
										class="w-8 h-8 rounded-full bg-gray-200 disabled:opacity-50 hover:bg-gray-300 transition-colors flex items-center justify-center"
									>
										-
									</button>
									<span class="w-8 text-center font-medium">{brandQuantities[brand.id]}</span>
									<button 
										onclick={() => updateBrandQuantity(brand.id, brandQuantities[brand.id] + 1)}
										disabled={brandQuantities[brand.id] >= 10}
										class="w-8 h-8 rounded-full bg-gray-200 disabled:opacity-50 hover:bg-gray-300 transition-colors flex items-center justify-center"
									>
										+
									</button>
								</div>
							</div>
						{/each}
					</div>

					{#if totalItems > 0}
						<div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
							<p class="text-blue-800 text-sm font-medium">Total items: {totalItems}</p>
						</div>
					{/if}

					<button 
						onclick={proceedToDetails}
						class="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
					>
						Continue
					</button>
				</div>

			{:else if step === 'details'}
				<div>
					<h3 class="font-semibold text-gray-900 mb-4">Booking Details</h3>

					<div class="space-y-4 mb-6">
						<div>
							<label for="guest-count" class="block text-sm font-medium text-gray-700 mb-2">
								Number of Guests
							</label>
							<select 
								id="guest-count"
								bind:value={formData.guestCount}
								class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							>
								{#each Array(10) as _, i}
									<option value={i + 1}>{i + 1} guest{i > 0 ? 's' : ''}</option>
								{/each}
							</select>
						</div>

						<div>
							<label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
								Phone Number
							</label>
							<input 
								id="phone"
								type="tel"
								bind:value={formData.phone}
								placeholder="+855XXXXXXXX"
								onblur={validatePhone}
								class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								class:border-red-300={errors.phone}
							/>
							{#if errors.phone}
								<p class="text-red-600 text-sm mt-1">{errors.phone}</p>
							{/if}
						</div>

						<div>
							<label for="comment" class="block text-sm font-medium text-gray-700 mb-2">
								Comment (Optional)
							</label>
							<textarea 
								id="comment"
								bind:value={formData.comment}
								placeholder="Special requests or notes..."
								maxlength="200"
								rows="3"
								onblur={validateComment}
								class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
								class:border-red-300={errors.comment}
							></textarea>
							<div class="flex justify-between items-center mt-1">
								{#if errors.comment}
									<p class="text-red-600 text-sm">{errors.comment}</p>
								{:else}
									<span></span>
								{/if}
								<p class="text-gray-500 text-sm">{formData.comment.length}/200</p>
							</div>
						</div>

						<div>
							<fieldset class="space-y-2">
								<legend class="block text-sm font-medium text-gray-700 mb-2">
									Payment Method
								</legend>
								<label class="flex items-center">
									<input 
										type="radio" 
										bind:group={formData.paymentMethod} 
										value="aba_qr"
										class="mr-3"
									/>
									<span class="text-gray-900">ABA QR Pay</span>
								</label>
								<label class="flex items-center">
									<input 
										type="radio" 
										bind:group={formData.paymentMethod} 
										value="ipay88"
										class="mr-3"
									/>
									<span class="text-gray-900">Credit Card (ipay88)</span>
								</label>
							</fieldset>
						</div>
					</div>

					<button 
						onclick={proceedToConfirm}
						class="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
					>
						Review Booking
					</button>
				</div>

			{:else if step === 'confirm'}
				<div>
					<h3 class="font-semibold text-gray-900 mb-4">Confirm Booking</h3>

					<div class="space-y-4 mb-6">
						<div class="bg-gray-50 rounded-lg p-4">
							<h4 class="font-medium text-gray-900 mb-2">Event Details</h4>
							<p class="text-gray-700 text-sm">{event.title}</p>
							<p class="text-gray-600 text-sm">{event.venue_name} • {event.date}</p>
						</div>

						{#if formData.selectedBrands.length > 0}
							<div class="bg-gray-50 rounded-lg p-4">
								<h4 class="font-medium text-gray-900 mb-2">Selected Items</h4>
								{#each formData.selectedBrands as { brandId, quantity }}
									<p class="text-gray-700 text-sm">{getBrandName(brandId)} × {quantity}</p>
								{/each}
							</div>
						{/if}

						<div class="bg-gray-50 rounded-lg p-4">
							<h4 class="font-medium text-gray-900 mb-2">Booking Information</h4>
							<p class="text-gray-700 text-sm">Guests: {formData.guestCount}</p>
							<p class="text-gray-700 text-sm">Phone: {formData.phone}</p>
							{#if formData.comment}
								<p class="text-gray-700 text-sm">Comment: {formData.comment}</p>
							{/if}
							<p class="text-gray-700 text-sm">Payment: {formData.paymentMethod === 'aba_qr' ? 'ABA QR Pay' : 'Credit Card'}</p>
						</div>
					</div>

					<div class="flex space-x-3">
						<button 
							onclick={() => step = 'details'}
							class="flex-1 bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
						>
							Edit
						</button>
						<button 
							onclick={submitBooking}
							class="flex-1 bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
						>
							Confirm Booking
						</button>
					</div>
				</div>

			{:else if step === 'success'}
				<div class="text-center">
					<div class="mb-6">
						<div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<span class="text-2xl">✅</span>
						</div>
						<h3 class="text-xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
						<p class="text-gray-600">Your booking has been successfully submitted.</p>
					</div>

					<div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
						<p class="text-green-800 text-sm font-medium">Booking Reference: TRJ{Date.now().toString().slice(-6)}</p>
						<p class="text-green-700 text-sm mt-1">A confirmation message will be sent to your Telegram chat.</p>
					</div>

					<button 
						onclick={onComplete}
						class="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
					>
						Done
					</button>
				</div>
			{/if}

			{#if step !== 'success'}
				<button 
					onclick={onCancel}
					class="w-full mt-4 text-gray-600 font-medium py-2 hover:text-gray-800 transition-colors"
				>
					Cancel
				</button>
			{/if}
		</div>
	</div>
</div>