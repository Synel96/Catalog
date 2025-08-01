import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const getMyOverlords = async () => {
  try {
    const response = await axios.get(`${API_URL}/core/overlords/mine/`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: "Failed to fetch overlords." };
  }
};

export const createOverlord = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/core/overlords/`, formData, {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: "Failed to create overlord." };
  }
};

export const updateOverlord = async (id, formData) => {
  try {
    const response = await axios.patch(
      `${API_URL}/core/overlords/${id}/`,
      formData,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: "Failed to update overlord." };
  }
};

export const deleteOverlord = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/core/overlords/${id}/`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: "Failed to delete overlord." };
  }
};
