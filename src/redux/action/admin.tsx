import axios from "axios";
import { getIdToken } from "@/utils/get_user_tokens";
import { organization } from "@/utils/routes/organization/organization";
import { CreateOrganizationRequestBodyInput } from "@/utils/routes/organization/types";
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
		const reqBody =
			organization.createOrganization.getReqBody(reqBodyInput);

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
		const token = await getIdToken(); // fetch token each time
		const response = await axios.get(
			`${apiUrl}/organization${cursor ? `?cursor=${cursor}` : ""}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);
		return response.data;
	} catch (error: any) {
		console.error(
			"Error fetching orgs:",
			error.response?.data || error.message
		);
		return { error: true, message: error.message };
	}
};

export const updateStatus = async (orgId: string, status: string) => {
	try {
		const token = await getIdToken(); // fetch token each time
		const response = await axios.patch(
			`${apiUrl}/organization/${orgId}/status`,
			{ status },
			{
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			}
		);
		return response.data;
	} catch (error: any) {
		console.error(
			"Error in updating org status:",
			error.response?.data || error.message
		);
		return { error: true, message: error.message };
	}
};
