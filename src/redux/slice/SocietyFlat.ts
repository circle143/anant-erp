// src/redux/slice/unitSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Owner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  middleName: string;
  salutation: string;
  gender: string;
  dateOfBirth: string;
  maritalStatus: string;
  nationality: string;
  photo: string;
  saleId: string;
  numberOfChildren: number;
  anniversaryDate: string | null;
  aadharNumber: string;
  panNumber: string;
  passportNumber: string;
  profession: string;
  designation: string;
  companyName: string;
  createdAt: string;
  updatedAt: string;
}

interface PriceBreakdown {
  type: string;
  price: string;
  summary: string;
  superArea: string;
  total: string;
}

interface companyCustomer {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  aadharNumber: string;
  companyGst: string;
  companyPan: string;
  panNumber: string;
  saleId: string;
}
interface SaleDetail {
  id: string;
  flatId: string;
  orgId: string;
  owners?: Owner[];
  companyCustomer?: companyCustomer;
  totalPrice: string;
  priceBreakdown: PriceBreakdown[];
  paid: string;
  remaining: string;
}

export interface Unit {
  id: string;
  name: string;
  floorNumber: number;
  facing: string;
  flatTypeId: string;
  towerId: string;
  createdAt: string;
  updatedAt: string;
  saleDetail?: SaleDetail;
}

interface UnitState {
  units: Unit[];
}

const initialState: UnitState = {
  units: [],
};

const unitSlice = createSlice({
  name: "units",
  initialState,
  reducers: {
    setUnits: (state, action: PayloadAction<Unit[]>) => {
      state.units = action.payload;
    },
    clearUnits: (state) => {
      state.units = [];
    },
    updatePaymentInUnit: (
      state,
      action: PayloadAction<{ saleId: string; amountPaid: string }>
    ) => {
      const { saleId, amountPaid } = action.payload;
      const unit = state.units.find((unit) => unit.saleDetail?.id === saleId);
      if (unit?.saleDetail) {
        const paid = parseFloat(unit.saleDetail.paid || "0");
        const remaining = parseFloat(unit.saleDetail.remaining || "0");
        const amount = parseFloat(amountPaid);

        unit.saleDetail.paid = (paid + amount).toString();
        unit.saleDetail.remaining = (remaining - amount).toString();
      }
    },
  },
});

export const { setUnits, clearUnits, updatePaymentInUnit } = unitSlice.actions;
export default unitSlice.reducer;
