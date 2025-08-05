import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const BASE_URL = `${API_URL}/feed/whiskers/`;

// Whisker létrehozása
export const createWhisker = async (fromOverlordId, toOverlordId) => {
  const response = await axios.post(
    BASE_URL,
    {
      from_overlord: fromOverlordId,
      to_overlord: toOverlordId,
    },
    {
      withCredentials: true,
    }
  );
  return response.data;
};

// Whisker törlése - új backend endpoint: /feed/whiskers/remove/
export const deleteWhisker = async (fromOverlordId, toOverlordId) => {
  const response = await axios.delete(`${BASE_URL}remove/`, {
    params: {
      from: fromOverlordId,
      to: toOverlordId,
    },
    withCredentials: true,
  });
  return response.data;
};

// Saját whiskerek lekérdezése
export const getMyWhiskers = async () => {
  const response = await axios.get(BASE_URL, {
    withCredentials: true,
  });
  return response.data;
};

// Két overlord közti whisker státusz lekérdezése
export const checkWhiskerStatus = async (fromOverlordId, toOverlordId) => {
  const response = await axios.get(`${BASE_URL}status/`, {
    params: {
      from: fromOverlordId,
      to: toOverlordId,
    },
    withCredentials: true,
  });
  return response.data;
};
