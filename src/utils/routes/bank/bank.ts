import {
	BankByIdRouteInput,
	BankDetailsReqBodyInput,
	BankReportReqBody,
	BankRouteInput,
} from "./types";

function getBasePath(societyReraNumber: string) {
	return `/society/${societyReraNumber}/bank`;
}

export const bank = {
	addBank: {
		getEndpoint: (input: BankRouteInput) => {
			return getBasePath(input.societyRera);
		},
		getReqBody: (input: BankDetailsReqBodyInput) => {
			return input;
		},
		requestMethod: "POST",
	},
	updateBankDetails: {
		getEndpoint: (input: BankByIdRouteInput) => {
			return getBasePath(input.societyRera) + `/${input.bankId}`;
		},
		getReqBody: (input: BankDetailsReqBodyInput) => {
			return input;
		},
		requestMethod: "PATCH",
	},

	getAllSocietyBanks: {
		getEndpoint: (input: BankRouteInput) => {
			if (!input.cursor || input.cursor.trim().length == 0)
				return getBasePath(input.societyRera);
			return getBasePath(input.societyRera) + `?cursor=${input.cursor}`;
		},
		getReqBody: () => {
			// no request body required
		},
		requestMethod: "GET",
	},
	getBankReport: {
		getEndpoint: (input: BankByIdRouteInput) => {
			return getBasePath(input.societyRera) + `/${input.bankId}/report`;
		},
		getReqBody: (input: BankReportReqBody) => {
			return input;
		},
		requestMethod: "POST",
	},
};
