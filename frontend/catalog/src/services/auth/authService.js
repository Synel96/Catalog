// src/services/auth/authService.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const registerUser = async (userData) => {
  const response = await api.post("/auth/register/", userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post("/auth/login/", credentials);
  const { access, refresh } = response.data;

  localStorage.setItem("accessToken", access);
  localStorage.setItem("refreshToken", refresh);

  return { access, refresh };
};

export const refreshToken = async (refreshToken) => {
  const response = await api.post("/api/auth/refresh/", {
    refresh: refreshToken,
  });
  return response.data;
};
