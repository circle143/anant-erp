export interface BankRouteInput {
	societyRera: string;
	cursor?: string;
}

export interface BankDetailsReqBodyInput {
	name: string;
	accountNumber: string;
}

export interface BankByIdRouteInput {
	societyRera: string;
	bankId: string;
}
