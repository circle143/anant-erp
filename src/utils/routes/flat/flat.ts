import {
	BulkCreateFlatInput,
	CreateFlatInput,
	CreateFlatRequestBodyInput,
	DeleteFlatInput,
	GetSocietyFlats,
	GetSocietyFlatsByName,
	GetTowerFlats,
	UpdateFlatInput,
	UpdateFlatRequestBodyInput,
} from "./types";

function getBasePath(societyReraNumber: string) {
	return `/society/${societyReraNumber}/flat`;
}

export const flat = {
	createFlat: {
		getEndpoint: (input: CreateFlatInput) => {
			return getBasePath(input.societyReraNumber);
		},
		getReqBody: (input: CreateFlatRequestBodyInput) => {
			return input;
		},
		requestMethod: "POST",
	},
	bulkCreateFlat: {
		getEndpoint: (input: BulkCreateFlatInput) => {
			return (
				getBasePath(input.societyReraNumber) +
				`/tower/${input.towerID}/bulk`
			);
		},
		getReqBody: () => {
			// add multipart form data
			// file name: file
			// required column names in excel file
			// "Unit No", "Saleable Area (in sq. ft.)", "Unit Type" and "Flat facing"
		},
		requestMethod: "POST",
	},
	updateFlatDetails: {
		getEndpoint: (input: UpdateFlatInput) => {
			return getBasePath(input.societyReraNumber) + `/${input.flatId}`;
		},
		getReqBody: (input: UpdateFlatRequestBodyInput) => {
			return input;
		},
		requestMethod: "PATCH",
	},
	deleteFlat: {
		getEndpoint: (input: DeleteFlatInput) => {
			return getBasePath(input.societyReraNumber) + `/${input.flatID}`;
		},
		getReqBody: () => {
			// no request body
		},
		requestMethod: "DELETE",
	},
	getAllSocietyFlats: {
		getEndpoint: (input: GetSocietyFlats) => {
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
	getAllSocietyUnsoldFlats: {
		getEndpoint: (input: GetSocietyFlats) => {
			if (!input.cursor || input.cursor.trim().length == 0)
				return getBasePath(input.societyReraNumber) + "?filter=2";
			return (
				getBasePath(input.societyReraNumber) +
				`?cursor=${input.cursor}&filter=2`
			);
		},
		getReqBody: () => {
			// no request body required
		},
		requestMethod: "GET",
	},
	getAllSocietySoldFlats: {
		getEndpoint: (input: GetSocietyFlats) => {
			if (!input.cursor || input.cursor.trim().length == 0)
				return getBasePath(input.societyReraNumber) + "?filter=1";
			return (
				getBasePath(input.societyReraNumber) +
				`?cursor=${input.cursor}&filter=1`
			);
		},
		getReqBody: () => {
			// no request body required
		},
		requestMethod: "GET",
	},
	getAllTowerFlats: {
		getEndpoint: (input: GetTowerFlats) => {
			if (!input.cursor || input.cursor.trim().length == 0)
				return (
					getBasePath(input.societyReraNumber) +
					`/tower/${input.towerID}`
				);
			return (
				getBasePath(input.societyReraNumber) +
				`/tower/${input.towerID}?cursor=${input.cursor}`
			);
		},
		getReqBody: () => {
			// no request body required
		},
		requestMethod: "GET",
	},
	getAllTowerUnsoldFlats: {
		getEndpoint: (input: GetTowerFlats) => {
			if (!input.cursor || input.cursor.trim().length == 0)
				return (
					getBasePath(input.societyReraNumber) +
					`/tower/${input.towerID}?filter=2`
				);
			return (
				getBasePath(input.societyReraNumber) +
				`/tower/${input.towerID}?cursor=${input.cursor}&filter=2`
			);
		},
		getReqBody: () => {
			// no request body required
		},
		requestMethod: "GET",
	},
	getAllTowerSoldFlats: {
		getEndpoint: (input: GetTowerFlats) => {
			if (!input.cursor || input.cursor.trim().length == 0)
				return (
					getBasePath(input.societyReraNumber) +
					`/tower/${input.towerID}?filter=1`
				);
			return (
				getBasePath(input.societyReraNumber) +
				`/tower/${input.towerID}?cursor=${input.cursor}&filter=1`
			);
		},
		getReqBody: () => {
			// no request body required
		},
		requestMethod: "GET",
	},
	getSocietyFlatsByName: {
		getEndpoint: (input: GetSocietyFlatsByName) => {
			if (!input.cursor || input.cursor.trim().length == 0)
				return (
					getBasePath(input.societyReraNumber) +
					`/search?name=${input.name}`
				);
			return (
				getBasePath(input.societyReraNumber) +
				`/search?name=${input.name}&cursor=${input.cursor}`
			);
		},
		getReqBody: () => {
			// no request body required
		},
		requestMethod: "GET",
	},
};
