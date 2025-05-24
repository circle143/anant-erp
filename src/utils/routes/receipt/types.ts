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
	totalAmount: number;
	mode: string;
	dateIssued: string;
	bankName?: string;
	transactionNumber?: string;
}

export interface ReceiptIdInput {
	societyRera: string;
	receiptId: string;
}

export interface ClearSaleReceiptRequestBody {
	bankId: string;
}
