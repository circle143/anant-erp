import axios from "axios";
import {
  CreateSocietyRequestBodyInput,
  GetAllSocitiesInput,
} from "@/utils/routes/society/types";
import { GetSocietyFlats } from "@/utils/routes/flat/types";
import { society } from "@/utils/routes/society/society";
import { flat } from "@/utils/routes/flat/flat";
import { organization } from "@/utils/routes/organization/organization";
import { getIdToken } from "@/utils/get_user_tokens";
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
function createURL(url: string) {
  return apiUrl + url;
}
export const getSelf = async () => {
  try {
    const token = await getIdToken();
    const url = organization.getCurrentUserOrganization.getEndpoint();
    const response = await axios.get(createURL(url), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
export const getflats = async (
  cursor: string | null = null,
  societyReraNumber: string
) => {
  try {
    const token = await getIdToken();
    console.log("cursor", cursor);
    console.log("societyReraNumber", societyReraNumber);
    const input: GetSocietyFlats = {
      cursor: cursor ?? "",
      societyReraNumber,
    };
    const url = flat.getAllSocietyFlats.getEndpoint(input);
    const response = await axios.get(createURL(url), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error getting flat:", error.response?.data || error.message);
    return { error: true, message: error.message };
  }
};
