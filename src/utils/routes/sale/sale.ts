import {
	AddCustomerToFlatInput,
	AddCustomerToFlatRequestBodyInput,
	AddPaymentInstallmentToSale,
	GetSalePaymentBreakDown,
	GetSocietySalesReport,
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
	addPaymentInstallmentToSale: {
		getEndpoint: (input: AddPaymentInstallmentToSale) => {
			return (
				getBasePath(input.societyReraNumber) +
				`/${input.saleId}/add-payment-installment/${input.paymentId}`
			);
		},
		getReqBody: () => {
			// no req body
		},
		requestMethod: "POST",
	},
	getSalePaymentBreakDown: {
		getEndpoint: (input: GetSalePaymentBreakDown) => {
			return (
				getBasePath(input.societyReraNumber) +
				`/${input.saleId}/payment-breakdown`
			);
		},
		getReqBody: () => {
			// no request body required
		},
		requestMethod: "GET",
	},
	getSocietySaleReport: {
		getEndpoint: (input: GetSocietySalesReport) => {
			return getBasePath(input.societyReraNumber) + "/report";
		},
		getReqBody: () => {
			// no request body required
		},
		requestMethod: "GET",
	},
};
