export interface CustomerDetails {
	level: number;
	salutation: string;
	firstName: string;
	lastName: string;
	dateOfBirth: Date; // ISO string representation of time.Time
	gender: string;
	photo: string;
	maritalStatus: string;
	nationality: string;
	email: string;
	phoneNumber: string; // e164 format

	middleName?: string;
	numberOfChildren?: number;
	anniversaryDate?: Date; // ISO string representation of time.Time
	aadharNumber?: string;
	panNumber?: string;
	passportNumber?: string;
	profession?: string;
	designation?: string;
	companyName?: string;
}

// add customers to flat
export interface AddCustomerToFlatInput {
	societyReraNumber: string;
	flatID: string;
}

export interface AddCustomerToFlatRequestBodyInput {
	details: CustomerDetails[];
	optionalCharges: string[];
}

// update customer
export interface UpdateCustomerInput {
	societyReraNumber: string;
	flatID: string;
	customerID: string;
}

export interface UpdateCustomerRequestBodyInput {
	details: CustomerDetails;
}
