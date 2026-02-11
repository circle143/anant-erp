import {
	AddSaleReceiptInput,
	AddSaleReceiptRequestBody,
	ReceiptIdInput,
	ClearSaleReceiptRequestBody,
	UpdateSaleReceiptInput,
    UpdateSaleReceiptRequestBody,
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
	updateSaleReceipt: {
        getEndpoint: (input: UpdateSaleReceiptInput) => {
            return getBasePath(input.societyRera) + `/${input.receiptId}`;
        },
        getReqBody: (input: UpdateSaleReceiptRequestBody) => {
            return input;
        },
        requestMethod: "PATCH",
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
	markReceiptAsFailed: {
		getEndpoint: (input: ReceiptIdInput) => {
			return getBasePath(input.societyRera) + `/${input.receiptId}/fail`;
		},
		getReqBody: () => {
			// no req body
		},
		requestMethod: "PATCH",
	},
};
