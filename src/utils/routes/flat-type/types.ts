// create flat-type
export interface CreateFlatTyperInput {
	societyReraNumber: string;
}

export interface CreateFlatTyperRequestBodyInput {
	name: string;
	type: string;
	price: number;
	area: number;
}

// update flat-type
export interface UpdateFlatTypeInput {
	FlatTypeID: string;
	societyReraNumber: string;
}

export interface UpdateFlatTypeRequestBodyInput {
	name?: string;
	type?: string;
	price?: number;
	area?: number;
}

// delete flat-type
export interface DeleteFlatTypeInput {
	FlatTypeID: string;
	societyReraNumber: string;
}

// get all flatTypes
export interface GetAllFlatTypesInput {
	cursor?: string; // next page cursor
	societyReraNumber: string;
}
