import axios from "axios";
import {
    CreateSocietyRequestBodyInput,
    GetAllSocitiesInput,
} from "@/utils/routes/society/types";
import {
    GetSocietyFlats,
    CreateFlatInput,
    CreateFlatRequestBodyInput,
    GetTowerFlats,
} from "@/utils/routes/flat/types";
import {
    CreateTowerInput,
    CreateTowerRequestBodyInput,
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
import { GetPaymentPlans } from "@/utils/routes/payment-plans/type";
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
    customers: CustomerDetails[],
    optionalCharges: string[],
    basicCost: number
) => {
    try {
        const token = await getIdToken();
        const input: AddCustomerToFlatInput = {
            societyReraNumber,
            flatID,
        };

        const reqBody: AddCustomerToFlatRequestBodyInput = {
            details: customers,
            optionalCharges,
            basicCost,
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

        const url =
            charges.updatePreferenceLocationChargePrice.getEndpoint(input);

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
