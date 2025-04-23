import {
	CreateSocietyRequestBodyInput,
	DeleteSocietyInput,
	GetAllSocitiesInput,
	UpdateSocietyDetailsInput,
	UpdateSocietyDetailsRequestBodyInput,
} from "./types";

function getBasePath() {
	return "/society";
}

export const society = {
	createSociety: {
		getEndpoint: () => {
			return getBasePath();
		},
		getRequestBody: (input: CreateSocietyRequestBodyInput) => {
			return input;
		},
		requestMethod: "POST",
	},
	updateSocietyDetails: {
		getEndpoint: (input: UpdateSocietyDetailsInput) => {
			return getBasePath() + `/${input.reraNumber}`;
		},
		getRequestBody: (input: UpdateSocietyDetailsRequestBodyInput) => {
			const { reraNumber, name, address, coverPhoto } = input;
			if (!reraNumber && !name && !address && !coverPhoto) {
				throw new Error("Required at least one field to update");
			}
			return input;
		},
		requestMethod: "PATCH",
	},
	deleteSociety: {
		getEndpoint: (input: DeleteSocietyInput) => {
			return getBasePath() + `/${input.reraNumber}`;
		},
		getRequestBody: (input: UpdateSocietyDetailsRequestBodyInput) => {
			// no request body required
		},
		requestMethod: "DELETE",
	},
	getAllSocities: {
		getEndpoint: (input: GetAllSocitiesInput | null = null) => {
			if (!input || input.cursor.trim().length == 0) return getBasePath();
			return getBasePath() + `?cursor=${input.cursor}`;
		},
		getReqBody: () => {
			// no request body required
		},
		requestMethod: "GET",
	},
};
