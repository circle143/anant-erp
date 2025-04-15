import axios from "axios";
import { getIdToken } from "@/utils/get_user_tokens";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const token = await getIdToken();
// Function to add an organization admin user
export const addOrgAdminUser = async (Name: string, RootUserEmail: string) => {
  try {
    console.log(token);
    const response = await axios.post(
      `${apiUrl}/org/admin/user/add`,
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
