// create plan
export interface CreatePaymentPlanInput {
  societyReraNumber: string;
}

export interface PaymentPlanRatioItemInput {
  ratio: number; // e.g. 20.5

  /**
   * scope values:
   * - "sale"
   * - "tower"
   * - "flat"
   */
  scope: string;

  /**
   * conditionType values:
   * - "on-booking"
   * - "within-days"
   * - "on-tower-stage"
   * - "on-flat-stage"
   */
  conditionType: string;

  conditionValue: number;
}

export interface PaymentPlanRatioInput {
  items: PaymentPlanRatioItemInput[];
}

export interface CreatePaymentPlanRequestBodyInput {
  name: string;
  abbr: string;
  ratios: PaymentPlanRatioInput[];
}

// export interface CreatePaymentPlanRequestBodyInput {
// 	summary: string;
// 	scope: string; // Direct or Tower
// 	conditionType: string; // On-Booking or After-Days or On-Tower-Stage
// 	conditionValue: number;
// 	amount: number;
// }

// export interface MarkPaymentPlanActiveForTowerInput {
// 	societyReraNumber: string;
// 	towerId: string;
// 	paymentId: string;
// }

// get plan
export interface GetPaymentPlans {
  societyReraNumber: string;
  cursor?: string;
}

// export interface GetTowerPaymentPlans {
// 	societyReraNumber: string;
// 	towerId: string;
// 	cursor?: string;
// }
