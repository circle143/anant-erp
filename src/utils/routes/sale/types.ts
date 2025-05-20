export interface CustomerDetails {
	salutation: string;
	firstName: string;
	lastName: string;
	dateOfBirth: Date; // ISO string representation of time.Time
	gender: string;

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

export interface CompanyDetails {
	name: string;
	companyPan: string;
	companyGST?: string;
	aadharNumber?: string;
	panNumber?: string;
}

// add customers to flat
export interface AddCustomerToFlatInput {
	societyReraNumber: string;
	flatID: string;
}

export interface AddCustomerToFlatRequestBodyInput {
	type: string; // company or user. If user than details are required and if company than companyBuyer is required
	details?: CustomerDetails[];
	companyBuyer?: CompanyDetails;
	optionalCharges: string[];
	basicCost: number;
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

// get sale payment breakdown
export interface GetSalePaymentBreakDown {
	societyReraNumber: string;
	saleId: string;
}

export interface AddPaymentInstallmentToSale {
	societyReraNumber: string;
	paymentId: string;
	saleId: string;
}

export interface GetSocietySalesReport {
	societyReraNumber: string;
}

export interface GetTowerSalesReport {
	societyReraNumber: string;
	towerId: string;
}

// update sale customer details
export interface UpdateSaleCustomerDetailsInput {
	societyReraNumber: string;
	customerId: string; // this will either be customer id or compnay-customer id
}

export interface UpdateCustomerDetailsReqBodyInput {
	details: CustomerDetails;
}

export interface UpdateCompanyCustomerDetailsReqBodyInput {
	details: CompanyDetails;
}
