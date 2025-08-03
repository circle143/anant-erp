export interface CreateChargeInput {
	societyReraNumber: string;
}

export interface UpdateChargeInput {
	societyReraNumber: string;
	chargeId: string;
}

export interface GetChargesInput {
	societyReraNumber: string;
	cursor?: string;
}

export interface UpdateChargePriceRequestBodyInput {
	price: number;
}

// create preference location charge
export interface CreatePrerenceLocationChargeRequestBodyInput {
	summary: string;
	type: string; // Floor or Facing
	floor?: number;
	Price: number;
}

// update charge details
export interface UpdatePreferenceChargeDetailsRequestBodyInput {
	summary: string;
	disable: boolean;
}

// create other charge
export interface CreateOtherChargeRequestBodyInput {
	summary: string;
	recurring: boolean;
	optional: boolean;
	advanceMonths: number;
	price: number;
	fixed: boolean;
}

// update other charge details
export interface UpdateOtherChargeDetailsRequestBodyInput {
	summary: string;
	recurring: boolean;
	optional: boolean;
	advanceMonths: number;
	disable: boolean;
	fixed: boolean;
}
