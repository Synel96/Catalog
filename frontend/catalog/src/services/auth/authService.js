// src/services/auth/authService.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// 🔐 Axios példány cookie-támogatással
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // nagyon fontos a HTTPOnly sütikhez!
  headers: {
    "Content-Type": "application/json",
  },
});

// 📌 Regisztráció – ha sikeres, backend beállítja a sütiket is
export const registerUser = async (userData) => {
  const response = await api.post("/auth/register/", userData);
  return response.data; // tartalmazhatja a user objektumot
};

// 🔐 Bejelentkezés – sütiket beállítja a backend
export const loginUser = async (credentials) => {
  const response = await api.post("/auth/login/", credentials);
  return response.data; // nincs accessToken itt, mert a sütibe megy
};

// 🚪 Kijelentkezés – sütiket törli a backend
export const logoutUser = async () => {
  const response = await api.post("/auth/logout/");
  return response.data; // pl. { message: "Logged out" }
};

// ♻️ Token frissítés – új access tokent adhat vissza sütiben (vagy fejléccel)
export const refreshAccessToken = async () => {
  const response = await api.post("/auth/refresh/");
  return response.data; // pl. { access: "new_token" }
};
