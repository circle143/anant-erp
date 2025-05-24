import {
	AddSaleReceiptInput,
	AddSaleReceiptRequestBody,
	ReceiptIdInput,
	ClearSaleReceiptRequestBody,
} from "./types";

function getBasePath(societyReraNumber: string) {
	return `/society/${societyReraNumber}/receipt`;
}

export const receipt = {
	addSaleReceipt: {
		getEndpoint: (input: AddSaleReceiptInput) => {
			return getBasePath(input.societyRera) + `/sale/${input.saleId}`;
		},
		getReqBody: (input: AddSaleReceiptRequestBody) => {
			return input;
		},
		requestMethod: "POST",
	},
	clearSaleReceipt: {
		getEndpoint: (input: ReceiptIdInput) => {
			return getBasePath(input.societyRera) + `/${input.receiptId}/clear`;
		},
		getReqBody: (input: ClearSaleReceiptRequestBody) => {
			return input;
		},
		requestMethod: "POST",
	},
	getReciptById: {
		getEndpoint: (input: ReceiptIdInput) => {
			return getBasePath(input.societyRera) + `/${input.receiptId}`;
		},
		getReqBody: () => {
			// no req body
		},
		requestMethod: "GET",
	},
};
