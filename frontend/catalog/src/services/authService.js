import axios from "axios";

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
  return response.data;
};

export const refreshToken = async (refreshToken) => {
  const response = await api.post("/api/auth/refresh/", {
    refresh: refreshToken,
  });
  return response.data;
};
