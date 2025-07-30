import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const getCurrentUser = async (accessToken) => {
  try {
    const response = await axios.get(`${API_URL}/profiles/me/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: "Failed to fetch user data." };
  }
};
