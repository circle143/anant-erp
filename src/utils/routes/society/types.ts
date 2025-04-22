// create society
export interface CreateSocietyRequestBodyInput {
	reraNumber: string;
	name: string;
	address: string;
	coverPhoto?: string; // s3 bucket path
}

// update society details
export interface UpdateSocietyDetailsInput {
	reraNumber: string;
}

export interface UpdateSocietyDetailsRequestBodyInput {
	reraNumber?: string;
	name?: string;
	address?: string;
	coverPhoto?: string; // s3 bucket path
}

// delete society
export interface DeleteSocietyInput {
	reraNumber: string;
}

// get all societies
export interface GetAllSocitiesInput {
	cursor: string;
}
