// import {
// 	CreateFlatTyperInput,
// 	CreateFlatTyperRequestBodyInput,
// 	DeleteFlatTypeInput,
// 	GetAllFlatTypesInput,
// 	UpdateFlatTypeInput,
// 	UpdateFlatTypeRequestBodyInput,
// } from "./types";

// function getBasePath(societyReraNumber: string) {
// 	return `/society/${societyReraNumber}/flat-type`;
// }

// export const flatType = {
// 	createFlatType: {
// 		getEndpoint: (input: CreateFlatTyperInput) => {
// 			return getBasePath(input.societyReraNumber);
// 		},
// 		getReqBody: (input: CreateFlatTyperRequestBodyInput) => {
// 			return input;
// 		},
// 		requestMethod: "POST",
// 	},
// 	// updateFlatType: {
// 	// 	getEndpoint: (input: UpdateFlatTypeInput) => {
// 	// 		return (
// 	// 			getBasePath(input.societyReraNumber) + `/${input.FlatTypeID}`
// 	// 		);
// 	// 	},
// 	// 	getReqBody: (input: UpdateFlatTypeRequestBodyInput) => {
// 	// 		return input;
// 	// 	},
// 	// 	requestMethod: "PATCH",
// 	// },
// 	deleteFlatType: {
// 		getEndpoint: (input: DeleteFlatTypeInput) => {
// 			return (
// 				getBasePath(input.societyReraNumber) + `/${input.FlatTypeID}`
// 			);
// 		},
// 		getReqBody: () => {
// 			// no req body
// 		},
// 		requestMethod: "DELETE",
// 	},
// 	getAllFlatTypes: {
// 		getEndpoint: (input: GetAllFlatTypesInput) => {
// 			if (!input.cursor || input.cursor.trim().length == 0)
// 				return getBasePath(input.societyReraNumber);
// 			return (
// 				getBasePath(input.societyReraNumber) + `?cursor=${input.cursor}`
// 			);
// 		},
// 		getReqBody: () => {
// 			// no request body required
// 		},
// 		requestMethod: "GET",
// 	},
// };
