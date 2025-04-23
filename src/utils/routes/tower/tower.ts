import {
	CreateTowerInput,
	CreateTowerRequestBodyInput,
	DeleteTowerInput,
	GetAllTowersInput,
	UpdateTowerInput,
	UpdateTowerRequestBodyInput,
} from "./types";

function getBasePath(societyReraNumber: string) {
	return `/society/${societyReraNumber}/tower`;
}

export const tower = {
	createTower: {
		getEndpoint: (input: CreateTowerInput) => {
			return getBasePath(input.societyReraNumber);
		},
		getReqBody: (input: CreateTowerRequestBodyInput) => {
			if (input.floorCount <= 0) {
				throw new Error("Invalid floor count");
			}
			return JSON.stringify(input);
		},
		requestMethod: "POST",
	},
	updateTower: {
		getEndpoint: (input: UpdateTowerInput) => {
			return getBasePath(input.societyReraNumber) + `/${input.towerID}`;
		},
		getReqBody: (input: UpdateTowerRequestBodyInput) => {
			if (input.floorCount <= 0) {
				throw new Error("Invalid floor count");
			}
			return JSON.stringify(input);
		},
		requestMethod: "PATCH",
	},
	deleteTower: {
		getEndpoint: (input: DeleteTowerInput) => {
			return getBasePath(input.societyReraNumber) + `/${input.towerID}`;
		},
		getReqBody: () => {
			// no req body
		},
		requestMethod: "DELETE",
	},
	getAllTowers: {
		getEndpoint: (input: GetAllTowersInput) => {
			if (!input.cursor || input.cursor.trim().length == 0)
				return getBasePath(input.societyReraNumber);
			return (
				getBasePath(input.societyReraNumber) + `?cursor=${input.cursor}`
			);
		},
		getReqBody: () => {
			// no request body required
		},
		requestMethod: "GET",
	},
};
