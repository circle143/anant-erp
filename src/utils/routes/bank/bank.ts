import {
	BankByIdRouteInput,
	BankDetailsReqBodyInput,
	BankRouteInput,
} from "./types";

function getBasePath(societyReraNumber: string) {
	return `/society/${societyReraNumber}/bank`;
}

export const bank = {
	addBroker: {
		getEndpoint: (input: BankRouteInput) => {
			return getBasePath(input.societyRera);
		},
		getReqBody: (input: BankDetailsReqBodyInput) => {
			return input;
		},
		requestMethod: "POST",
	},
	updateBrokerDetails: {
		getEndpoint: (input: BankByIdRouteInput) => {
			return getBasePath(input.societyRera) + `/${input.bankId}`;
		},
		getReqBody: (input: BankDetailsReqBodyInput) => {
			return input;
		},
		requestMethod: "PATCH",
	},

	getAllSocietyBrokers: {
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
};
