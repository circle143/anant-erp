import axios from "axios";
import { getIdToken } from "@/utils/get_user_tokens";
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
export const getSelf = async () => {
  try {
    const token = await getIdToken(); // fetch token each time
    const response = await axios.get(`${apiUrl}/organization/self`, {
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