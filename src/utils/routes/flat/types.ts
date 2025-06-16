// create flat
export interface CreateFlatInput {
	societyReraNumber: string;
}

export interface BulkCreateFlatInput {
	societyReraNumber: string;
	towerID: string;
}

export interface CreateFlatRequestBodyInput {
	tower: string; // tower id
	flatType: string; // flat type id
	name: string;
	floorNumber: number;
	facing: string; // Park/Road or Default
}

// delete flat
export interface DeleteFlatInput {
	societyReraNumber: string;
	flatID: string;
}

// get flats
export interface GetSocietyFlats {
	societyReraNumber: string;
	cursor?: string;
}

export interface GetTowerFlats {
	societyReraNumber: string;
	cursor?: string;
	towerID: string;
}

// get flats by name
export interface GetSocietyFlatsByName {
	societyReraNumber: string;
	cursor?: string;
	name: string;
}

// update flat details
export interface UpdateFlatInput {
	societyReraNumber: string;
	flatId: string;
}

export interface UpdateFlatRequestBodyInput {
	tower: string; // tower id
	flatType: string; // flat type id
	name: string;
	floorNumber: number;
	facing: string; // Park/Road or Default
}
