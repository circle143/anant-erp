import axios from "axios";
import { getIdToken } from "@/utils/get_user_tokens";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Function to add an organization admin user
export const addOrgAdminUser = async (Name: string, RootUserEmail: string) => {
	const token = await getIdToken();
	try {
		console.log(token);
		const response = await axios.post(
			`${apiUrl}/admin/organization`,
			{
				Name,
				RootUserEmail,
			},
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		return response.data;
	} catch (error: any) {
		console.error(
			"Error adding org admin user:",
			error.response?.data || error.message
		);
		throw error;
	}
};
