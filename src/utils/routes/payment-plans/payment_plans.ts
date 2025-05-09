import {
	CreatePaymentPlanInput,
	CreatePaymentPlanRequestBodyInput,
	GetPaymentPlans,
	GetTowerPaymentPlans,
	MarkPaymentPlanActiveForTowerInput,
} from "./type";

function getBasePath(societyReraNumber: string) {
	return `/society/${societyReraNumber}/payment-plan`;
}

export const paymentPlans = {
	createPreferenceLocationCharge: {
		getEndpoint: (input: CreatePaymentPlanInput) => {
			return getBasePath(input.societyReraNumber);
		},
		getReqBody: (input: CreatePaymentPlanRequestBodyInput) => {
			return input;
		},
		requestMethod: "POST",
	},
	markPaymentPlanActiveForTower: {
		getEndpoint: (input: MarkPaymentPlanActiveForTowerInput) => {
			return (
				getBasePath(input.societyReraNumber) +
				`/${input.paymentId}/tower/${input.towerId}`
			);
		},
		getReqBody: () => {
			// no req body
		},
		requestMethod: "POST",
	},
	getPaymentPlans: {
		getEndpoint: (input: GetPaymentPlans) => {
			if (!input.cursor || input.cursor.trim().length == 0)
				return getBasePath(input.societyReraNumber);
			return (
				getBasePath(input.societyReraNumber) + `?cursor=${input.cursor}`
			);
		},
		getReqBody: () => {
			// no request body required
		},
		requestMethod: "GET",
	},
	getTowerPaymentPlans: {
		getEndpoint: (input: GetTowerPaymentPlans) => {
			if (!input.cursor || input.cursor.trim().length == 0)
				return (
					getBasePath(input.societyReraNumber) +
					`/tower/${input.towerId}`
				);
			return (
				getBasePath(input.societyReraNumber) +
				`/tower/${input.towerId}?cursor=${input.cursor}`
			);
		},
		getReqBody: () => {
			// no request body required
		},
		requestMethod: "GET",
	},
};
