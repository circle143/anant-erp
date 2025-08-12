export interface AddSaleReceiptInput {
	societyRera: string;
	saleId: string;
}
/*
    Valid values for mode are:
    online
    cash
    cheque
    demand-draft
    adjustment
    bankName and transactionNumber are required
    if mode value is online, cheque, demand-draft
*/
export interface AddSaleReceiptRequestBody {
	receiptNumber: string;
	totalAmount: number;
	mode: string;
	dateIssued: string;
	bankName?: string;
	transactionNumber?: string;
	gstRate?:number;
	ServiceTax?:number;
	SwatchBharatCess?:number;
	KrishiKalyanCess?:number;
}

export interface ReceiptIdInput {
	societyRera: string;
	receiptId: string;
}

export interface ClearSaleReceiptRequestBody {
	bankId: string;
}
