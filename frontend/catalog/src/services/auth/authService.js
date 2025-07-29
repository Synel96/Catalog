// src/services/auth/authService.js
import axios from "axios";
import { getCurrentUser } from "../auth/userService";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const registerUser = async (userData) => {
  const response = await api.post("/api/auth/register/", userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post("/api/auth/login/", credentials);
  const { access, refresh } = response.data;

  // Mentés localStorage-be
  localStorage.setItem("accessToken", access);
  localStorage.setItem("refreshToken", refresh);

  // Beállítjuk az auth fejléceket
  api.defaults.headers.common["Authorization"] = `Bearer ${access}`;

  // Lekérjük a bejelentkezett felhasználó adatait
  const user = await getCurrentUser();

  return { access, refresh, user };
};

export const refreshToken = async (refreshToken) => {
  const response = await api.post("/api/auth/refresh/", {
    refresh: refreshToken,
  });
  return response.data;
};
