import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const getCurrentUser = async () => {
  try {
    const response = await axios.get(`${API_URL}/profiles/me/`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: "Failed to fetch user data." };
  }
};

export const updateCurrentUser = async (formData) => {
  try {
    const response = await axios.patch(`${API_URL}/profiles/me/`, formData, {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: "Failed to update user data." };
  }
};
