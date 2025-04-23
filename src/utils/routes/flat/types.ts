// create flat
export interface CreateFlatInput {
	societyReraNumber: string;
}

export interface CreateFlatRequestBodyInput {
	tower: string; // tower id
	flatType: string; // flat type id
	name: string;
	floorNumber: number;
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
