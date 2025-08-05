import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

export const uploadPost = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/feed/posts/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Post creation failed:", error);
    throw error;
  }
};

export const fetchStreetPosts = async () => {
  try {
    const response = await axios.get(`${API_URL}/feed/posts/`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch street posts:", error);
    throw error;
  }
};
