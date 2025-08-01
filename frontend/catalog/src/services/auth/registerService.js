import axios from "axios";
import { useAuthStore } from "@/stores/useAuthStore";

const API_URL = import.meta.env.VITE_API_URL;

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register/`, userData, {
      withCredentials: true,
    });

    // Feltételezzük, hogy a válaszban benne van a user objektum
    useAuthStore.getState().login(response.data);

    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: "Registration failed." };
  }
};
