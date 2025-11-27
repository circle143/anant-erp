import { GetPaymentPlans } from "../payment-plans/type";
import {
	CreatePaymentPlanInput,
	CreatePaymentPlanRequestBodyInput,
	GetTowerPaymentPlans,
	MarkPaymentPlanActiveForTowerInput,
	MarkPaymentPlanActiveForFlatInput,
	GetFlatPaymentPlans
} from "./type";

function getBasePath(societyReraNumber: string) {
	return `/society/${societyReraNumber}/payment-plan`;
}

export const paymentPlans = {
	createPaymentPlan: {
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
	markPaymentPlanActiveForFlat: {
		getEndpoint: (input: MarkPaymentPlanActiveForFlatInput) => {
			return (
				getBasePath(input.societyReraNumber) +
				`/${input.paymentId}/flat/${input.flatId}`
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
			return (
				getBasePath(input.societyReraNumber) +
				`/tower/${input.towerId}`
			);
		},
		getReqBody: () => {
			// no request body required
		},
		requestMethod: "GET",
	},
	getFlatPaymentPlans: {
		getEndpoint: (input: GetFlatPaymentPlans) => {
			return (
				getBasePath(input.societyReraNumber) +
				`/flat/${input.flatId}`
			);
		},
		getReqBody: () => {
			// no request body required
		},
		requestMethod: "GET",
	},
};
