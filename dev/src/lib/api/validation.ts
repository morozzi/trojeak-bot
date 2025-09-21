import { z } from 'zod';

interface Constants {
    PHONE_REGEX: string;
    MAX_GUESTS: number;
    MAX_COMMENT_LENGTH: number;
    MAX_QTY_PER_BRAND: number;
    DEFAULT_CURRENCY: string;
    CURRENCY_SYMBOL: string;
    CURRENCY_PRECISION: number;
    WEBAPP_DOMAIN: string;
    BOT_USERNAME: string;
}

export class BookingValidator {
    private constants: Constants;
    
    constructor(constants: Constants) {
        this.constants = constants;
    }
    
    get phoneSchema() {
    		const pattern = this.constants.PHONE_REGEX.slice(1, -1); // Remove PHP delimiters
    		return z.string().regex(new RegExp(pattern), 'Invalid international phone format');
		}
    
    get commentSchema() {
        return z.string().max(this.constants.MAX_COMMENT_LENGTH, `Comment must be ${this.constants.MAX_COMMENT_LENGTH} characters or less`);
    }
    
    get guestsSchema() {
        return z.number().min(1, 'At least 1 guest required').max(this.constants.MAX_GUESTS, `Maximum ${this.constants.MAX_GUESTS} guests allowed`);
    }
    
    get brandQuantitySchema() {
        return z.number().min(1, 'Minimum 1 item').max(this.constants.MAX_QTY_PER_BRAND, `Maximum ${this.constants.MAX_QTY_PER_BRAND} items per brand`);
    }
    
    get paymentMethodSchema() {
        return z.enum(['aba', 'ipay88', 'stars'], { errorMap: () => ({ message: 'Please select a payment method' }) });
    }
    
    get bookingSchema() {
        return z.object({
            eventId: z.string().min(1, 'Event ID required'),
            selectedBrands: z.record(this.brandQuantitySchema),
            guests: this.guestsSchema,
            phone: this.phoneSchema,
            comment: this.commentSchema.optional(),
            paymentMethod: this.paymentMethodSchema
        });
    }
}

export type BookingData = {
    eventId: string;
    selectedBrands: Record<string, number>;
    guests: number;
    phone: string;
    comment?: string;
    paymentMethod: 'aba' | 'ipay88' | 'stars';
};