import axios from "axios";
import { getIdToken } from "@/utils/get_user_tokens";
import { organization } from "@/utils/routes/organization/organization";
import {
  CreateOrganizationRequestBodyInput,
  GetAllOrganizationsInput,
  UpdateOrganizationStatusInput,
  UpdateOrganizationStatusRequestBodyInput,
  OrganizationStatus,
} from "@/utils/routes/organization/types";
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

function createURL(url: string) {
  return apiUrl + url;
}
// Function to add an organization admin user
export const addOrgAdminUser = async (name: string, email: string) => {
  try {
    const url = organization.createOrganization.getEndpoint();
    const reqBodyInput: CreateOrganizationRequestBodyInput = {
      name,
      email,
    };
    const reqBody = organization.createOrganization.getReqBody(reqBodyInput);

    const token = await getIdToken();
    const response = await axios.post(createURL(url), reqBody, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error adding org admin user:",
      error.response?.data || error.message
    );
    return error;
  }
};

export const getOrg = async (cursor: string | null = null) => {
  try {
    const token = await getIdToken();
    const input: GetAllOrganizationsInput = { cursor: cursor ?? "" }; // fetch token each time
    const url = organization.getAllOrganizations.getEndpoint(input);
    const response = await axios.get(createURL(url), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching orgs:",
      error.response?.data || error.message
    );
    return { error: true, message: error.message };
  }
};

export const updateStatus = async (orgId: string, status: OrganizationStatus) => {
  try {
    const token = await getIdToken();
    const input: UpdateOrganizationStatusInput = { organizationID: orgId };
    const body: UpdateOrganizationStatusRequestBodyInput = { status };
    const url = organization.updateOrganizationStatus.getEndpoint(input);
    const response = await axios.patch(createURL(url), body, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error in updating org status:",
      error.response?.data || error.message
    );
    return { error: true, message: error.message };
  }
};
