import axios from "axios";

// 🔧 VITE API URL manuális beállítása
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

// POST /feed/reactions/toggle/
export const toggleReaction = async (postId, overlordId, type) => {
  try {
    const res = await axios.post(
      "/feed/reactions/toggle/",
      {
        post_id: postId,
        overlord_id: overlordId,
        type: type,
      },
      {
        withCredentials: true,
      }
    );
    return res.data;
  } catch (error) {
    console.error(
      "❌ Error toggling reaction:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getPostReactions = async (postId) => {
  try {
    const res = await axios.get("/feed/reactions/by-post", {
      params: { post_id: postId },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error(
      "❌ Error fetching post reactions:",
      error.response?.data || error.message
    );
    throw error;
  }
};
