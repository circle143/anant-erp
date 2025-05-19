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

interface SaleDetail {
  id: string;
  flatId: string;
  orgId: string;
  owners: Owner[];
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
  },
});

export const { setUnits, clearUnits } = unitSlice.actions;
export default unitSlice.reducer;
