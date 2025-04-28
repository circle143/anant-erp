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
} from "@/utils/routes/flat-type/types";
import {
  AddUserToOrganizationRequestBodyInput,
  GetAllOrganizationUsersInput,
} from "@/utils/routes/organization/types";
import { society } from "@/utils/routes/society/society";
import { flat } from "@/utils/routes/flat/flat";
import { tower } from "@/utils/routes/tower/tower";
import { organization } from "@/utils/routes/organization/organization";
import { getIdToken } from "@/utils/get_user_tokens";
import { flatType } from "@/utils/routes/flat-type/flat_type";

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
  floorNumber: number
) => {
  try {
    const token = await getIdToken();
    const input: CreateFlatInput = { societyReraNumber };
    const reqBody: CreateFlatRequestBodyInput = {
      tower,
      flatType,
      name,
      floorNumber,
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
  type: string,
  price: number,
  area: number
) => {
  try {
    const token = await getIdToken();
    const input: CreateFlatTyperInput = { societyReraNumber };
    const reqBody: CreateFlatTyperRequestBodyInput = {
      name,
      type,
      price,
      area,
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
