// create plan
export interface CreatePaymentPlanInput {
	societyReraNumber: string;
}

export interface CreatePaymentPlanRequestBodyInput {
	scope: string; // Direct or Tower
	conditionType: string; // On-Booking or After-Days or On-Tower-Stage
	conditionValue: number;
}

export interface MarkPaymentPlanActiveForTowerInput {
	societyReraNumber: string;
	towerId: string;
	paymentId: string;
}

// get plan
export interface GetPaymentPlans {
	societyReraNumber: string;
	cursor?: string;
}

export interface GetTowerPaymentPlans {
	societyReraNumber: string;
	towerId: string;
	cursor?: string;
}
