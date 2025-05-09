import {
	AddCustomerToFlatInput,
	AddCustomerToFlatRequestBodyInput,
	GetSalePaymentBreakDown,
	UpdateCustomerInput,
	UpdateCustomerRequestBodyInput,
} from "./types";

function getBasePath(societyReraNumber: string) {
	return `/society/${societyReraNumber}/sale`;
}

export const customer = {
	addCustomerToFlat: {
		getEndpoint: (input: AddCustomerToFlatInput) => {
			return (
				getBasePath(input.societyReraNumber) + `/flat/${input.flatID}`
			);
		},
		getReqBody: (input: AddCustomerToFlatRequestBodyInput) => {
			return input;
		},
		requestMethod: "POST",
	},
	// updateCustomerToFlat: {
	// 	getEndpoint: (input: UpdateCustomerInput) => {
	// 		return getBasePath(input.societyReraNumber, input.flatID);
	// 	},
	// 	getReqBody: (input: UpdateCustomerRequestBodyInput) => {
	// 		return input;
	// 	},
	// 	requestMethod: "POST",
	// },
	getSalePaymentBreakDown: {
		getEndpoint: (input: GetSalePaymentBreakDown) => {
			return (
				getBasePath(input.societyReraNumber) +
				`/payment-breakdown/${input.saleId}`
			);
		},
		getReqBody: () => {
			// no request body required
		},
		requestMethod: "GET",
	},
};
