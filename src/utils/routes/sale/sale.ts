import {
	AddCustomerToFlatInput,
	AddCustomerToFlatRequestBodyInput,
	AddPaymentInstallmentToSale,
	ClearSaleRecord,
	GetSalePaymentBreakDown,
	GetSocietySalesReport,
	GetTowerSalesReport,
	UpdateCompanyCustomerDetailsReqBodyInput,
	UpdateCustomerDetailsReqBodyInput,
	UpdateSaleCustomerDetailsInput,
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
	// addPaymentInstallmentToSale: {
	// 	getEndpoint: (input: AddPaymentInstallmentToSale) => {
	// 		return (
	// 			getBasePath(input.societyReraNumber) +
	// 			`/${input.saleId}/add-payment-installment/${input.paymentId}`
	// 		);
	// 	},
	// 	getReqBody: () => {
	// 		// no req body
	// 	},
	// 	requestMethod: "POST",
	// },
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
	getTowerSalesReport: {
		getEndpoint: (input: GetTowerSalesReport) => {
			return (
				getBasePath(input.societyReraNumber) +
				`/tower/${input.towerId}/report`
			);
		},
		getReqBody: () => {
			// no request body required
		},
		requestMethod: "GET",
	},
	updateSaleCustomerDetails: {
		getEndpoint: (input: UpdateSaleCustomerDetailsInput) => {
			return (
				getBasePath(input.societyReraNumber) +
				`/customer/${input.customerId}`
			);
		},
		getReqBody: (input: UpdateCustomerDetailsReqBodyInput) => {
			return input;
		},
		requestMethod: "PATCH",
	},
	updateSaleCompanyCustomerDetails: {
		getEndpoint: (input: UpdateSaleCustomerDetailsInput) => {
			return (
				getBasePath(input.societyReraNumber) +
				`/company-customer/${input.customerId}`
			);
		},
		getReqBody: (input: UpdateCompanyCustomerDetailsReqBodyInput) => {
			return input;
		},
		requestMethod: "PATCH",
	},
	clearSaleRecord: {
		getEndpoint: (input: ClearSaleRecord) => {
			return getBasePath(input.societyReraNumber) + `/${input.saleId}`;
		},
		getReqBody: () => {
			// no req body
		},
		requestMethod: "DELETE",
	},
};
