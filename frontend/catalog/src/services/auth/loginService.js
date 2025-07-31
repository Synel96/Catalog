import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login/`, credentials, {
      withCredentials: true, // 🔑 Engedélyezi a HTTPOnly sütik küldését és fogadását
    });

    // Feltételezve, hogy a backend visszaadja a bejelentkezett user objektumot
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: "Login failed." };
  }
};
