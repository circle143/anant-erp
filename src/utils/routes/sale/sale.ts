import {
	AddCustomerToFlatInput,
	AddCustomerToFlatRequestBodyInput,
	UpdateCustomerInput,
	UpdateCustomerRequestBodyInput,
} from "./types";

function getBasePath(societyReraNumber: string, flatId: string) {
	return `/society/${societyReraNumber}/flat/${flatId}/sale`;
}

export const customer = {
	addCustomerToFlat: {
		getEndpoint: (input: AddCustomerToFlatInput) => {
			return getBasePath(input.societyReraNumber, input.flatID);
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
};
