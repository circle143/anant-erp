import axios from "axios";
import {
  CreateSocietyRequestBodyInput,
  GetAllSocitiesInput,
  DeleteSocietyInput,
  UpdateSocietyDetailsInput,
  UpdateSocietyDetailsRequestBodyInput,
} from "@/utils/routes/society/types";
import {
  GetSocietyFlats,
  CreateFlatInput,
  CreateFlatRequestBodyInput,
  GetTowerFlats,
  DeleteFlatInput,
  GetSocietyFlatsByName,
} from "@/utils/routes/flat/types";
import {
  CreateTowerInput,
  CreateTowerRequestBodyInput,
  DeleteTowerInput,
} from "@/utils/routes/tower/types";
import {
  GetAllFlatTypesInput,
  CreateFlatTyperInput,
  CreateFlatTyperRequestBodyInput,
  UpdateFlatTypeInput,
  UpdateFlatTypeRequestBodyInput,
  DeleteFlatTypeInput,
} from "@/utils/routes/flat-type/types";
import {
  AddUserToOrganizationRequestBodyInput,
  GetAllOrganizationUsersInput,
  UpdateOrganizationDetailsRequestBodyInput,
  UpdateOrganizationUserRoleInput,
  UpdateOrganizationUserRoleRequestBodyInput,
  UserRole,
  RemoveUserFromOrganizationInput,
} from "@/utils/routes/organization/types";
import {
  AddCustomerToFlatInput,
  AddCustomerToFlatRequestBodyInput,
  CustomerDetails,
  GetSocietySalesReport,
  GetSalePaymentBreakDown,
  AddPaymentInstallmentToSale,
  GetTowerSalesReport,
  CompanyDetails,
  UpdateSaleCustomerDetailsInput,
  UpdateCustomerDetailsReqBodyInput,
  UpdateCompanyCustomerDetailsReqBodyInput,
  ClearSaleRecord,
} from "@/utils/routes/sale/types";
import {
  GetChargesInput,
  CreateChargeInput,
  CreatePrerenceLocationChargeRequestBodyInput,
  UpdateChargeInput,
  UpdateChargePriceRequestBodyInput,
  UpdatePreferenceChargeDetailsRequestBodyInput,
  UpdateOtherChargeDetailsRequestBodyInput,
} from "@/utils/routes/charges/types";
import {
  GetPaymentPlans,
  GetTowerPaymentPlans,
} from "@/utils/routes/payment-plans/type";
import { charges } from "@/utils/routes/charges/charges";
import { customer } from "@/utils/routes/sale/sale";
import { society } from "@/utils/routes/society/society";
import { flat } from "@/utils/routes/flat/flat";
import { tower } from "@/utils/routes/tower/tower";
import { organization } from "@/utils/routes/organization/organization";
import { getIdToken } from "@/utils/get_user_tokens";
import { flatType } from "@/utils/routes/flat-type/flat_type";
import { sum } from "lodash";
import { paymentPlans } from "@/utils/routes/payment-plans/payment_plans";
import {
  BrokerByIdRouteInput,
  BrokerDetailsReqBodyInput,
  BrokerRouteInput,
} from "@/utils/routes/broker/types";
import { broker } from "@/utils/routes/broker/broker";
import {
  BankByIdRouteInput,
  BankDetailsReqBodyInput,
  BankRouteInput,
} from "@/utils/routes/bank/types";
import { bank } from "@/utils/routes/bank/bank";

const apiUrl = process.env.NEXT_PUBLIC_API_URL as string;

function createURL(url: string) {
  return apiUrl + url;
}

// ========== ORGANIZATION ==========

export const getSelf = async () => {
  try {
    const token = await getIdToken();
    const url = organization.getCurrentUserOrganization.getEndpoint();
    const response = await axios.get(createURL(url), {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching data:",
      error.response?.data || error.message
    );
    return { error: true, message: error.message };
  }
};

// ========== SOCIETY ==========

export const createSociety = async (
  reraNumber: string,
  name: string,
  address: string,
  coverPhoto: string
) => {
  try {
    const token = await getIdToken();
    const url = society.createSociety.getEndpoint();
    const reqBody: CreateSocietyRequestBodyInput = {
      reraNumber,
      name,
      address,
      coverPhoto,
    };
    const response = await axios.post(createURL(url), reqBody, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating society:",
      error.response?.data || error.message
    );
    return { error: true, message: error.message };
  }
};

export const getSocieties = async (cursor: string | null = null) => {
  try {
    const token = await getIdToken();
    const input: GetAllSocitiesInput = { cursor: cursor ?? "" };
    const url = society.getAllSocities.getEndpoint(input);
    const response = await axios.get(createURL(url), {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching societies:",
      error.response?.data || error.message
    );
    return { error: true, message: error.message };
  }
};

// ========== FLATS ==========

export const getFlats = async (
  cursor: string | null = null,
  societyReraNumber: string
) => {
  try {
    const token = await getIdToken();
    const input: GetSocietyFlats = {
      cursor: cursor ?? "",
      societyReraNumber,
    };
    const url = flat.getAllSocietyFlats.getEndpoint(input);
    const response = await axios.get(createURL(url), {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching flats:",
      error.response?.data || error.message
    );
    return { error: true, message: error.message };
  }
};

export const getAllSocietyUnsoldFlats = async (
  cursor: string | null = null,
  societyReraNumber: string
) => {
  try {
    const token = await getIdToken();
    const input: GetSocietyFlats = {
      cursor: cursor ?? "",
      societyReraNumber,
    };
    const url = flat.getAllSocietyUnsoldFlats.getEndpoint(input);
    const response = await axios.get(createURL(url), {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching flats:",
      error.response?.data || error.message
    );
    return { error: true, message: error.message };
  }
};

export const getAllSocietySoldFlats = async (
  cursor: string | null = null,
  societyReraNumber: string
) => {
  try {
    const token = await getIdToken();
    const input: GetSocietyFlats = {
      cursor: cursor ?? "",
      societyReraNumber,
    };
    const url = flat.getAllSocietySoldFlats.getEndpoint(input);
    const response = await axios.get(createURL(url), {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching flats:",
      error.response?.data || error.message
    );
    return { error: true, message: error.message };
  }
};

export const getTowerFlats = async (
  cursor: string | null = null,
  societyReraNumber: string,
  towerID: string
) => {
  try {
    const token = await getIdToken();
    const input: GetTowerFlats = {
      cursor: cursor ?? "",
      societyReraNumber,
      towerID,
    };
    const url = flat.getAllTowerFlats.getEndpoint(input);
    const response = await axios.get(createURL(url), {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching flats:",
      error.response?.data || error.message
    );
    return { error: true, message: error.message };
  }
};

export const getAllTowerUnsoldFlats = async (
  cursor: string | null = null,
  societyReraNumber: string,
  towerID: string
) => {
  try {
    const token = await getIdToken();
    const input: GetTowerFlats = {
      cursor: cursor ?? "",
      societyReraNumber,
      towerID,
    };

    const url = flat.getAllTowerUnsoldFlats.getEndpoint(input);
    const response = await axios.get(createURL(url), {
      headers: { Authorization: `Bearer ${token}` },
    });
    // console.log("response", response);
    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching flats:",
      error.response?.data || error.message
    );
    return { error: true, message: error.message };
  }
};

export const getAllTowerSoldFlats = async (
  cursor: string | null = null,
  societyReraNumber: string,
  towerID: string
) => {
  try {
    const token = await getIdToken();
    const input: GetTowerFlats = {
      cursor: cursor ?? "",
      societyReraNumber,
      towerID,
    };
    const url = flat.getAllTowerSoldFlats.getEndpoint(input);
    const response = await axios.get(createURL(url), {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching flats:",
      error.response?.data || error.message
    );
    return { error: true, message: error.message };
  }
};

export const createFlat = async (
  societyReraNumber: string,
  tower: string,
  flatType: string,
  name: string,
  floorNumber: number,
  facing: string
) => {
  try {
    const token = await getIdToken();
    const input: CreateFlatInput = { societyReraNumber };
    const reqBody: CreateFlatRequestBodyInput = {
      tower,
      flatType,
      name,
      floorNumber,
      facing,
    };
    const url = flat.createFlat.getEndpoint(input);
    const response = await axios.post(createURL(url), reqBody, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating flat:",
      error.response?.data || error.message
    );
    return { error: true, message: error.message };
  }
};

export const deleteFlat = async (flatID: string, societyReraNumber: string) => {
  try {
    const token = await getIdToken();
    const input: DeleteFlatInput = {
      societyReraNumber,
      flatID,
    };

    const url = flat.deleteFlat.getEndpoint(input);
    const response = await axios.delete(createURL(url), {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error deleting flattype:",
      error.response?.data || error.message
    );
    return { error: true, message: error.message };
  }
};

// ========== TOWER ==========

export const getTowers = async (
  cursor: string | null = null,
  societyReraNumber: string
) => {
  try {
    const token = await getIdToken();
    const input: GetSocietyFlats = {
      cursor: cursor ?? "",
      societyReraNumber,
    };
    const url = tower.getAllTowers.getEndpoint(input);
    const response = await axios.get(createURL(url), {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching towers:",
      error.response?.data || error.message
    );
    return { error: true, message: error.message };
  }
};

export const createTower = async (
  societyReraNumber: string,
  floorCount: number,
  name: string
) => {
  try {
    const token = await getIdToken();
    const input: CreateTowerInput = { societyReraNumber };
    const reqBody: CreateTowerRequestBodyInput = { floorCount, name };
    const url = tower.createTower.getEndpoint(input);
    const response = await axios.post(createURL(url), reqBody, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating tower:",
      error.response?.data || error.message
    );
    return { error: true, message: error.message };
  }
};

// ========== FLAT TYPES ==========

export const getFlatTypes = async (
  cursor: string | null = null,
  societyReraNumber: string
) => {
  try {
    const token = await getIdToken();
    const input: GetAllFlatTypesInput = {
      cursor: cursor ?? "",
      societyReraNumber,
    };
    const url = flatType.getAllFlatTypes.getEndpoint(input);
    const response = await axios.get(createURL(url), {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching flat types:",
      error.response?.data || error.message
    );
    return { error: true, message: error.message };
  }
};

export const createFlatType = async (
  societyReraNumber: string,
  name: string,
  accommodation: string,
  reraCarpetArea: number,
  balconyArea: number,
  superArea: number
) => {
  try {
    const token = await getIdToken();
    const input: CreateFlatTyperInput = { societyReraNumber };
    const reqBody: CreateFlatTyperRequestBodyInput = {
      name,
      accommodation,
      reraCarpetArea,
      balconyArea,
      superArea,
    };
    const url = flatType.createFlatType.getEndpoint(input);
    const response = await axios.post(createURL(url), reqBody, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating flat type:",
      error.response?.data || error.message
    );
    return { error: true, message: error.message };
  }
};

export const createUser = async (email: string) => {
  try {
    const token = await getIdToken();
    const url = organization.addUserToOrganization.getEndpoint();
    const reqBody: AddUserToOrganizationRequestBodyInput = {
      email,
    };
    const response = await axios.post(createURL(url), reqBody, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating user:",
      error.response?.data || error.message
    );
    return { error: true, message: error.message };
  }
};

export const getUsers = async (cursor: string | null = null) => {
  try {
    const token = await getIdToken();
    const input: GetAllOrganizationUsersInput = {
      cursor: cursor ?? "",
    };
    const url = organization.getAllOrganizationUsers.getEndpoint(input);
    const response = await axios.get(createURL(url), {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching flat types:",
      error.response?.data || error.message
    );
    return { error: true, message: error.message };
  }
};
export const updateOrganizationDetails = async (
  input: UpdateOrganizationDetailsRequestBodyInput
) => {
  try {
    const token = await getIdToken();
    const url = organization.updateOrganizationDetails.getEndpoint();
    const reqBody = input;
    const response = await axios.patch(createURL(url), reqBody, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error updating org:", error.response?.data);
    return { error: true, message: error.response?.data };
  }
};

export const addCustomer = async (
  societyReraNumber: string,
  flatID: string,
  optionalCharges: string[],
  basicCost: number,
  type: string,
  brokerId: string,
  companyBuyer?: CompanyDetails,
  customers?: CustomerDetails[]
) => {
  try {
    const token = await getIdToken();
    const input: AddCustomerToFlatInput = {
      societyReraNumber,
      flatID,
    };

    const reqBody: AddCustomerToFlatRequestBodyInput = {
      type,
      details: customers,
      companyBuyer,
      optionalCharges,
      basicCost: parseFloat(basicCost.toString()),
      brokerId,
    };

    const url = customer.addCustomerToFlat.getEndpoint(input);

    const response = await axios.post(createURL(url), reqBody, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error adding customer:",
      error.response?.data || error.message
    );
    return { error: true, message: error.message };
  }
};

export const updateOrganizationUserRole = async (
  email: string,
  role: UserRole
) => {
  try {
    const token = await getIdToken();
    const input: UpdateOrganizationUserRoleInput = {
      email,
    };

    const reqBody: UpdateOrganizationUserRoleRequestBodyInput = { role };

    const url = organization.updateOrganizationUserRole.getEndpoint(input);

    const response = await axios.patch(createURL(url), reqBody, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error adding customer:",
      error.response?.data || error.message
    );
    return { error: true, message: error.message };
  }
};

export const removeUserFromOrganization = async (email: string) => {
  try {
    const token = await getIdToken();
    const input: RemoveUserFromOrganizationInput = {
      email,
    };
    const url = organization.removeUserFromOrganization.getEndpoint(input);
    const response = await axios.delete(createURL(url), {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error deleting user:",
      error.response?.data || error.message
    );
    return { error: true, message: error.message };
  }
};

// export const updateFlatType = async (
//     FlatTypeID: string,
//     societyReraNumber: string,
//     name?: string,
//     type?: string,
//     price?: number,
//     area?: number
// ) => {
//     try {
//         const token = await getIdToken();
//         const input: UpdateFlatTypeInput = {
//             FlatTypeID,
//             societyReraNumber,
//         };
//         const reqBody: UpdateFlatTypeRequestBodyInput = {
//             name,
//             type,
//             price,
//             area,
//         };
//         const url = flatType.updateFlatType.getEndpoint(input);
//         const response = await axios.patch(createURL(url), reqBody, {
//             headers: { Authorization: `Bearer ${token}` },
//         });

//         return response.data;
//     } catch (error: any) {
//         console.error(
//             "Error updating flattype:",
//             error.response?.data || error.message
//         );
//         return { error: true, message: error.message };
//     }
// };

export const deleteFlatType = async (
  FlatTypeID: string,
  societyReraNumber: string
) => {
  try {
    const token = await getIdToken();
    const input: DeleteFlatTypeInput = {
      FlatTypeID,
      societyReraNumber,
    };

    const url = flatType.deleteFlatType.getEndpoint(input);
    const response = await axios.delete(createURL(url), {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error deleting flattype:",
      error.response?.data || error.message
    );
    return { error: true, message: error.message };
  }
};
export const getAllPreferenceLocationCharges = async (
  societyReraNumber: string,
  cursor: string | null = null
) => {
  try {
    const token = await getIdToken();
    const input: GetChargesInput = {
      societyReraNumber,
      cursor: cursor ?? "",
    };
    const url = charges.getAllPreferenceLocationCharges.getEndpoint(input);
    const response = await axios.get(createURL(url), {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching charges:",
      error.response?.data || error.message
    );
    return { error: true, message: error.message };
  }
};
export const createPreferenceLocationCharge = async (
  societyReraNumber: string,
  payload: {
    summary: string;
    type: string;
    Price: number;
    floor?: number;
  }
) => {
  try {
    const token = await getIdToken();
    const input = { societyReraNumber };
    const url = charges.createPreferenceLocationCharge.getEndpoint(input);

    const response = await axios.post(createURL(url), payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error adding charges:",
      error.response?.data || error.message
    );
    return { error: true, message: error.message };
  }
};
export const updatePreferenceLocationChargePrice = async (
  societyReraNumber: string,
  chargeId: string,
  price: number
) => {
  try {
    const token = await getIdToken();
    const input: UpdateChargeInput = {
      societyReraNumber,
      chargeId,
    };

    const reqBody: UpdateChargePriceRequestBodyInput = { price };

    const url = charges.updatePreferenceLocationChargePrice.getEndpoint(input);

    const response = await axios.patch(createURL(url), reqBody, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating charge:",
      error.response?.data || error.message
    );
    return { error: true, message: error.message };
  }
};
export const updatePreferenceLocationChargeDetails = async (
  societyReraNumber: string,
  chargeId: string,
  summary: string,
  disable: boolean
) => {
  try {
    const token = await getIdToken();
    const input: UpdateChargeInput = {
      societyReraNumber,
      chargeId,
    };

    const reqBody: UpdatePreferenceChargeDetailsRequestBodyInput = {
      summary,
      disable,
    };

    const url =
      charges.updatePreferenceLocationChargeDetails.getEndpoint(input);

    const response = await axios.patch(createURL(url), reqBody, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating charge:",
      error.response?.data || error.message
    );
    return { error: true, message: error.message };
  }
};
export const getAllOtherCharges = async (
  societyReraNumber: string,
  cursor: string | null = null
) => {
  try {
    const token = await getIdToken();
    const input: GetChargesInput = {
      societyReraNumber,
      cursor: cursor ?? "",
    };
    const url = charges.getAllOtherCharges.getEndpoint(input);
    const response = await axios.get(createURL(url), {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching charges:",
      error.response?.data || error.message
    );
    return { error: true, message: error.message };
  }
};

export const createOtherCharge = async (
  societyReraNumber: string,
  payload: {
    summary: string;
    recurring: boolean;
    optional: boolean;
    advanceMonths: number;
    price: number;
    fixed: boolean;
  }
) => {
  try {
    const token = await getIdToken();
    const input = { societyReraNumber };
    const url = charges.createOtherCharge.getEndpoint(input);

    const response = await axios.post(createURL(url), payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error adding charges:",
      error.response?.data || error.message
    );
    return { error: true, message: error.message };
  }
};

export const updateOtherChargePrice = async (
  societyReraNumber: string,
  chargeId: string,
  price: number
) => {
  try {
    const token = await getIdToken();
    const input: UpdateChargeInput = {
      societyReraNumber,
      chargeId,
    };

    const reqBody: UpdateChargePriceRequestBodyInput = { price };

    const url = charges.updateOtherChargePrice.getEndpoint(input);

    const response = await axios.patch(createURL(url), reqBody, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating charge:",
      error.response?.data || error.message
    );
    return { error: true, message: error.message };
  }
};
export const updateOtherChargeDetails = async (
  societyReraNumber: string,
  chargeId: string,
  summary: string,
  recurring: boolean,
  optional: boolean,
  advanceMonths: number,
  disable: boolean,
  fixed: boolean
) => {
  try {
    const token = await getIdToken();
    const input: UpdateChargeInput = {
      societyReraNumber,
      chargeId,
    };

    const reqBody: UpdateOtherChargeDetailsRequestBodyInput = {
      summary,
      recurring,
      optional,
      advanceMonths,
      disable,
      fixed,
    };

    const url = charges.updateOtherChargeDetails.getEndpoint(input);

    const response = await axios.patch(createURL(url), reqBody, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating charge:",
      error.response?.data || error.message
    );
    return { error: true, message: error.message };
  }
};
export const getAllOtherOptionalCharges = async (
  societyReraNumber: string,
  cursor: string | null = null
) => {
  try {
    const token = await getIdToken();
    const input: GetChargesInput = {
      societyReraNumber,
      cursor: cursor ?? "",
    };
    // console.log("input", input);
    const url = charges.getAllOtherOptionalCharges.getEndpoint(input);
    const response = await axios.get(createURL(url), {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching charges:",
      error.response?.data || error.message
    );
    return { error: true, message: error.message };
  }
};

export const getPaymentPlans = async (
  societyReraNumber: string,
  cursor: string | null = null
) => {
  try {
    const token = await getIdToken();
    const input: GetPaymentPlans = {
      societyReraNumber,
      cursor: cursor ?? "",
    };
    const url = paymentPlans.getPaymentPlans.getEndpoint(input);
    const response = await axios.get(createURL(url), {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching payment plan:",
      error.response?.data || error.message
    );
    return { error: true, message: error.message };
  }
};
export const createPaymentPlan = async (
  societyReraNumber: string,
  payload: {
    summary: string;
    scope: string; // Direct or Tower
    conditionType: string; // On-Booking or After-Days or On-Tower-Stage
    conditionValue: number;
    amount: number;
  }
) => {
  try {
    const token = await getIdToken();
    const input = { societyReraNumber };
    const url = paymentPlans.createPaymentPlan.getEndpoint(input);

    const response = await axios.post(createURL(url), payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error adding charges:",
      error.response?.data || error.message
    );
    return { error: true, message: error.message };
  }
};
export const getTowerPaymentPlans = async (
  societyReraNumber: string,
  towerId: string,
  cursor: string | null = null
) => {
  try {
    const token = await getIdToken();
    const input: GetTowerPaymentPlans = {
      societyReraNumber,
      towerId,
      cursor: cursor ?? "",
    };
    const url = paymentPlans.getTowerPaymentPlans.getEndpoint(input);
    const response = await axios.get(createURL(url), {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching payment plan:",
      error.response?.data || error.message
    );
    return { error: true, message: error.message };
  }
};
export const markPaymentPlanActiveForTower = async (
  societyReraNumber: string,
  towerId: string,
  paymentId: string
) => {
  try {
    const token = await getIdToken();
    const input = { societyReraNumber, towerId, paymentId };
    const url = paymentPlans.markPaymentPlanActiveForTower.getEndpoint(input);

    const response = await axios.post(createURL(url), null, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error :", error.response?.data || error.message);
    return { error: true, message: error.message };
  }
};
export const getSalePaymentBreakDown = async (
  societyReraNumber: string,
  saleId: string
) => {
  try {
    const token = await getIdToken();
    const input: GetSalePaymentBreakDown = {
      societyReraNumber,
      saleId,
    };
    const url = customer.getSalePaymentBreakDown.getEndpoint(input);
    const response = await axios.get(createURL(url), {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching payment plan:",
      error.response?.data || error.message
    );
    return { error: true, message: error.message };
  }
};
export const getSocietySaleReport = async (societyReraNumber: string) => {
  try {
    const token = await getIdToken();
    const input: GetSocietySalesReport = {
      societyReraNumber,
    };
    const url = customer.getSocietySaleReport.getEndpoint(input);
    const response = await axios.get(createURL(url), {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching Sales Report:",
      error.response?.data || error.message
    );
    return { error: true, message: error.message };
  }
};
// export const addPaymentInstallmentToSale = async (
//   societyReraNumber: string,
//   paymentId: string,
//   saleId: string
// ) => {
//   try {
//     const token = await getIdToken();

//     const input: AddPaymentInstallmentToSale = {
//       societyReraNumber,
//       paymentId,
//       saleId,
//     };

//     const url = customer.addPaymentInstallmentToSale.getEndpoint(input);
//     const response = await axios.post(createURL(url), null, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     return response.data;
//   } catch (error: any) {
//     console.error("Error :", error.response?.data || error.message);
//     return { error: true, message: error.message };
//   }
// };

export const getSocietyFlatsByName = async (
  societyReraNumber: string,
  name: string,
  cursor?: string
) => {
  try {
    const token = await getIdToken();
    const input: GetSocietyFlatsByName = {
      societyReraNumber,
      cursor: cursor ?? "",
      name,
    };
    const url = flat.getSocietyFlatsByName.getEndpoint(input);
    const response = await axios.get(createURL(url), {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error :", error.response?.data || error.message);
    return { error: true, message: error.message };
  }
};
export const deleteSociety = async (reraNumber: string) => {
  try {
    const token = await getIdToken();
    const input: DeleteSocietyInput = {
      reraNumber,
    };
    const url = society.deleteSociety.getEndpoint(input);
    const response = await axios.delete(createURL(url), {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error deleting:", error.response?.data || error.message);
    return { error: true, message: error.message };
  }
};

export const getTowerSalesReport = async (
  societyReraNumber: string,
  towerId: string
) => {
  try {
    const token = await getIdToken();
    const input: GetTowerSalesReport = {
      societyReraNumber,
      towerId,
    };

    const url = customer.getTowerSalesReport.getEndpoint(input);
    const response = await axios.get(createURL(url), {
      headers: { Authorization: `Bearer ${token}` },
    });
    // console.log("response", response);
    return response.data;
  } catch (error: any) {
    console.error("Error :", error.response?.data || error.message);
    return { error: true, message: error.message };
  }
};
export const getSocietyById = async (societyReraNumber: string) => {
  try {
    const token = await getIdToken();

    const url = society.getSocietyById.getEndpoint(societyReraNumber);
    const response = await axios.get(createURL(url), {
      headers: { Authorization: `Bearer ${token}` },
    });
    // console.log("response", response);
    return response.data;
  } catch (error: any) {
    console.error("Error :", error.response?.data || error.message);
    return { error: true, message: error.message };
  }
};

export const deleteTower = async (
  towerID: string,
  societyReraNumber: string
) => {
  try {
    const token = await getIdToken();
    const input: DeleteTowerInput = {
      towerID,
      societyReraNumber,
    };
    const url = tower.deleteTower.getEndpoint(input);
    const response = await axios.delete(createURL(url), {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error deleting:", error.response?.data || error.message);
    return { error: true, message: error.message };
  }
};

export const updateSocietyDetails = async (
  reraNumberinput: string,
  reraNumberbody: string,
  name?: string,
  address?: string,
  coverPhoto?: string
) => {
  try {
    const token = await getIdToken();
    const input: UpdateSocietyDetailsInput = {
      reraNumber: reraNumberinput,
    };
    const reqBody: UpdateSocietyDetailsRequestBodyInput = {
      reraNumber: reraNumberbody,
      name,
      address,
      coverPhoto,
    };
    const url = society.updateSocietyDetails.getEndpoint(input);
    const response = await axios.patch(createURL(url), reqBody, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating society:",
      error.response?.data || error.message
    );
    return { error: true, message: error.message };
  }
};
export const updateSaleCustomerDetails = async (
  societyReraNumber: string,
  customerId: string,
  details: CustomerDetails
) => {
  try {
    const token = await getIdToken();
    const input: UpdateSaleCustomerDetailsInput = {
      societyReraNumber,
      customerId,
    };

    const reqBody: UpdateCustomerDetailsReqBodyInput = { details };

    const url = customer.updateSaleCustomerDetails.getEndpoint(input);

    const response = await axios.patch(createURL(url), reqBody, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error adding customer:",
      error.response?.data || error.message
    );
    return { error: true, message: error.message };
  }
};

export const updateSaleCompanyCustomerDetails = async (
  societyReraNumber: string,
  customerId: string,
  details: CompanyDetails
) => {
  try {
    const token = await getIdToken();
    const input: UpdateSaleCustomerDetailsInput = {
      societyReraNumber,
      customerId,
    };
    const reqBody: UpdateCompanyCustomerDetailsReqBodyInput = { details };
    const url = customer.updateSaleCompanyCustomerDetails.getEndpoint(input);
    const response = await axios.patch(createURL(url), reqBody, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error adding customer:",
      error.response?.data || error.message
    );
    return { error: true, message: error.message };
  }
};

export const clearSaleRecord = async (
  societyReraNumber: string,
  saleId: string
) => {
  try {
    const token = await getIdToken();
    const input: ClearSaleRecord = {
      societyReraNumber,
      saleId,
    };
    const url = customer.clearSaleRecord.getEndpoint(input);
    const response = await axios.delete(createURL(url), {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error deleting flattype:",
      error.response?.data || error.message
    );
    return { error: true, message: error.message };
  }
};
//brokers
export const addBroker = async (
  societyRera: string,
  name: string,
  panNumber: string,
  aadharNumber: string,
  cursor?: string
) => {
  try {
    const token = await getIdToken();
    const reqBody: BrokerDetailsReqBodyInput = {
      name,
      panNumber,
      aadharNumber,
    };
    const input: BrokerRouteInput = {
      societyRera,
      cursor,
    };
    const url = broker.addBroker.getEndpoint(input);
    const response = await axios.post(createURL(url), reqBody, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error adding broker:",
      error.response?.data || error.message
    );
    return { error: true, message: error.message };
  }
};
export const updateBrokerDetails = async (
  societyRera: string,
  brokerId: string,
  name: string,
  panNumber: string,
  aadharNumber: string
) => {
  try {
    const token = await getIdToken();
    const input: BrokerByIdRouteInput = {
      societyRera,
      brokerId,
    };
    const reqBody: BrokerDetailsReqBodyInput = {
      name,
      panNumber,
      aadharNumber,
    };
    const url = broker.updateBrokerDetails.getEndpoint(input);
    const response = await axios.patch(createURL(url), reqBody, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating broker:",
      error.response?.data || error.message
    );
    return { error: true, message: error.message };
  }
};
export const getAllSocietyBrokers = async (
  societyRera: string,
  cursor: string | null = null
) => {
  try {
    const token = await getIdToken();
    const input: BrokerRouteInput = {
      societyRera,
      cursor: cursor ?? "",
    };
    const url = broker.getAllSocietyBrokers.getEndpoint(input);
    const response = await axios.get(createURL(url), {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching data:",
      error.response?.data || error.message
    );
    return { error: true, message: error.message };
  }
};
//bank
export const addBank = async (
  societyRera: string,
  name: string,
  accountNumber: string
) => {
  try {
    const token = await getIdToken();
    const reqBody: BankDetailsReqBodyInput = {
      name,
      accountNumber,
    };
    const input: BankRouteInput = {
      societyRera,
    };
    const url = bank.addBank.getEndpoint(input);
    const response = await axios.post(createURL(url), reqBody, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error adding bank:", error.response?.data || error.message);
    return { error: true, message: error.message };
  }
};
export const updateBankDetails = async (
  societyRera: string,
  bankId: string,
  name: string,
  accountNumber: string
) => {
  try {
    const token = await getIdToken();
    const input: BankByIdRouteInput = {
      societyRera,
      bankId,
    };
    const reqBody: BankDetailsReqBodyInput = {
      name,
      accountNumber,
    };
    const url = bank.updateBankDetails.getEndpoint(input);
    const response = await axios.patch(createURL(url), reqBody, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating bank:",
      error.response?.data || error.message
    );
    return { error: true, message: error.message };
  }
};
export const getAllSocietyBanks = async (
  societyRera: string,
  cursor: string | null = null
) => {
  try {
    const token = await getIdToken();
    const input: BankRouteInput = {
      societyRera,
      cursor: cursor ?? "",
    };
    const url = bank.getAllSocietyBanks.getEndpoint(input);
    const response = await axios.get(createURL(url), {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching data:",
      error.response?.data || error.message
    );
    return { error: true, message: error.message };
  }
};
