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

export const fetchPostsByOverlordId = async (overlordId) => {
  try {
    const response = await axios.get(
      `${API_URL}/feed/posts/by-overlord/${overlordId}/`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch posts by overlord ID:", error);
    throw error;
  }
};

export const updatePost = async (postId, updatedData) => {
  try {
    const response = await axios.patch(
      `${API_URL}/feed/posts/${postId}/`,
      updatedData,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Post update failed:", error);
    throw error;
  }
};

export const deletePost = async (postId) => {
  try {
    await axios.delete(`${API_URL}/feed/posts/${postId}/`, {
      withCredentials: true,
    });
  } catch (error) {
    console.error("Post deletion failed:", error);
    throw error;
  }
};
