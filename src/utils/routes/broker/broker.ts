import {
	BrokerByIdRouteInput,
	BrokerDetailsReqBodyInput,
	BrokerRouteInput,
} from "./types";

function getBasePath(societyReraNumber: string) {
	return `/society/${societyReraNumber}/broker`;
}

export const broker = {
	addBroker: {
		getEndpoint: (input: BrokerRouteInput) => {
			return getBasePath(input.societyRera);
		},
		getReqBody: (input: BrokerDetailsReqBodyInput) => {
			return input;
		},
		requestMethod: "POST",
	},
	updateBrokerDetails: {
		getEndpoint: (input: BrokerByIdRouteInput) => {
			return getBasePath(input.societyRera) + `/${input.brokerId}`;
		},
		getReqBody: (input: BrokerDetailsReqBodyInput) => {
			return input;
		},
		requestMethod: "PATCH",
	},

	getAllSocietyBrokers: {
		getEndpoint: (input: BrokerRouteInput) => {
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
