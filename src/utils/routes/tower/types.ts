// create tower
export interface CreateTowerInput {
	societyReraNumber: string;
}

export interface CreateTowerRequestBodyInput {
	floorCount: number;
	name: string;
}

// update tower
// export interface UpdateTowerInput {
// 	towerID: string;
// 	societyReraNumber: string;
// }

export interface UpdateTowerRequestBodyInput {
	floorCount: number;
	name: string;
}

// delete tower
// export interface DeleteTowerInput {
// 	towerID: string;
// 	societyReraNumber: string;
// }

// get all towers
export interface GetAllTowersInput {
	cursor?: string; // next page cursor
	societyReraNumber: string;
}

export interface TowerByIdInput {
	towerID: string;
	societyReraNumber: string;
}
