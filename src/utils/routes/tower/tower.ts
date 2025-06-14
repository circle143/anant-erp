import {
	CreateTowerInput,
	CreateTowerRequestBodyInput,
	GetAllTowersInput,
	TowerByIdInput,
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
			return input;
		},
		requestMethod: "POST",
	},
	bulkCreateTower: {
		getEndpoint: (input: CreateTowerInput) => {
			return getBasePath(input.societyReraNumber);
		},
		getReqBody: () => {
			// add multipart form data
			// file name: file
			// required column names in excel file
			// "Name" and "No. Of Floors In Towers"
		},
		requestMethod: "POST",
	},
	updateTower: {
		getEndpoint: (input: TowerByIdInput) => {
			return getBasePath(input.societyReraNumber) + `/${input.towerID}`;
		},
		getReqBody: (input: UpdateTowerRequestBodyInput) => {
			if (input.floorCount <= 0) {
				throw new Error("Invalid floor count");
			}
			return input;
		},
		requestMethod: "PATCH",
	},
	deleteTower: {
		getEndpoint: (input: TowerByIdInput) => {
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
	getTowerId: {
		getEndpoint: (input: TowerByIdInput) => {
			return getBasePath(input.societyReraNumber) + `/${input.towerID}`;
		},
		getReqBody: () => {
			// no request body required
		},
		requestMethod: "GET",
	},
};
