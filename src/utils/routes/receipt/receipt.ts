import {
	AddSaleReceiptInput,
	AddSaleReceiptRequestBody,
	ClearSaleReceiptInput,
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
		getEndpoint: (input: ClearSaleReceiptInput) => {
			return getBasePath(input.societyRera) + `/${input.receiptId}/clear`;
		},
		getReqBody: (input: ClearSaleReceiptRequestBody) => {
			return input;
		},
		requestMethod: "POST",
	},
};
