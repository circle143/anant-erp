import {
	CreateChargeInput,
	CreateOtherChargeRequestBodyInput,
	CreatePrerenceLocationChargeRequestBodyInput,
	GetChargesInput,
	UpdateChargeInput,
	UpdateChargePriceRequestBodyInput,
	UpdateOtherChargeDetailsRequestBodyInput,
	UpdatePreferenceChargeDetailsRequestBodyInput,
} from "./types";

function getBasePath(societyReraNumber: string) {
	return `/society/${societyReraNumber}/charges`;
}

export const charges = {
	createPreferenceLocationCharge: {
		getEndpoint: (input: CreateChargeInput) => {
			return (
				getBasePath(input.societyReraNumber) + "/preference-location"
			);
		},
		getReqBody: (input: CreatePrerenceLocationChargeRequestBodyInput) => {
			return input;
		},
		requestMethod: "POST",
	},
	updatePreferenceLocationChargePrice: {
		getEndpoint: (input: UpdateChargeInput) => {
			return (
				getBasePath(input.societyReraNumber) +
				`/preference-location/${input.chargeId}/price`
			);
		},
		getReqBody: (input: UpdateChargePriceRequestBodyInput) => {
			return input;
		},
		requestMethod: "Patch",
	},
	updatePreferenceLocationChargeDetails: {
		getEndpoint: (input: UpdateChargeInput) => {
			return (
				getBasePath(input.societyReraNumber) +
				`/preference-location/${input.chargeId}/details`
			);
		},
		getReqBody: (input: UpdatePreferenceChargeDetailsRequestBodyInput) => {
			return input;
		},
		requestMethod: "Patch",
	},
	createOtherCharge: {
		getEndpoint: (input: CreateChargeInput) => {
			return getBasePath(input.societyReraNumber) + "/other";
		},
		getReqBody: (input: CreateOtherChargeRequestBodyInput) => {
			return input;
		},
		requestMethod: "POST",
	},
	updateOtherChargePrice: {
		getEndpoint: (input: UpdateChargeInput) => {
			return (
				getBasePath(input.societyReraNumber) +
				`/other/${input.chargeId}/price`
			);
		},
		getReqBody: (input: UpdateChargePriceRequestBodyInput) => {
			return input;
		},
		requestMethod: "Patch",
	},
	updateOtherChargeDetails: {
		getEndpoint: (input: UpdateChargeInput) => {
			return (
				getBasePath(input.societyReraNumber) +
				`/other/${input.chargeId}/details`
			);
		},
		getReqBody: (input: UpdateOtherChargeDetailsRequestBodyInput) => {
			return input;
		},
		requestMethod: "Patch",
	},
	getAllPreferenceLocationCharges: {
		getEndpoint: (input: GetChargesInput) => {
			if (!input.cursor || input.cursor.trim().length == 0)
				return (
					getBasePath(input.societyReraNumber) +
					"/preference-location"
				);
			return (
				getBasePath(input.societyReraNumber) +
				`/preference-location?cursor=${input.cursor}`
			);
		},
		getReqBody: () => {
			// no request body required
		},
		requestMethod: "GET",
	},
	getAllOtherCharges: {
		getEndpoint: (input: GetChargesInput) => {
			if (!input.cursor || input.cursor.trim().length == 0)
				return getBasePath(input.societyReraNumber) + "/other";
			return (
				getBasePath(input.societyReraNumber) +
				`/other?cursor=${input.cursor}`
			);
		},
		getReqBody: () => {
			// no request body required
		},
		requestMethod: "GET",
	},
};
