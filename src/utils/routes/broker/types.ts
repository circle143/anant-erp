export interface BrokerRouteInput {
	societyRera: string;
	cursor?: string;
}

export interface BrokerDetailsReqBodyInput {
	name: string;
	panNumber: string;
	aadharNumber: string;
}

export interface BrokerByIdRouteInput {
	societyRera: string;
	brokerId: string;
}
