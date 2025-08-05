import React, { useState } from "react";
import {
  Box,
  Button,
  Textarea,
  Avatar,
  Typography,
  Stack,
  IconButton,
} from "@mui/joy";
import ImageIcon from "@mui/icons-material/Image";
import PetsIcon from "@mui/icons-material/Pets";
import { useStreetStore } from "../../store/useStreetStore";
import { uploadPost } from "../../services/posts/postService";
import { useOverlordPostsStore } from "../../store/usePostStore"; // ⬅️ importáld a zustand store-t

const API_URL = import.meta.env.VITE_API_URL;

const CreatePostForm = () => {
  const overlord = useStreetStore((state) => state.selectedOverlord);
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const { refetchPosts } = useOverlordPostsStore(); // ⬅️ destrukturáljuk a refetch metódust

  const handleImageChange = (e) => {
    if (e.target.files.length > 0) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!overlord) return;

    const formData = new FormData();
    formData.append("overlord", overlord.id);
    formData.append("content", content);
    if (image) formData.append("image", image);

    try {
      await uploadPost(formData);
      setContent("");
      setImage(null);
      await refetchPosts(overlord.id); // ⬅️ refetch a postok újratöltéséhez
    } catch (err) {
      console.error("Post upload failed:", err);
    }
  };

  if (!overlord) return null;

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        alignItems: "flex-start",
        flexWrap: "wrap",
        p: 3,
        borderRadius: "md",
        width: "100%",
        backgroundColor: "#fff",
        boxShadow: "md",
      }}
    >
      <Avatar
        src={
          overlord.avatar?.startsWith("http")
            ? overlord.avatar
            : `${API_URL}${overlord.avatar}`
        }
        alt={overlord.name}
        size="lg"
        sx={{
          border: "2px solid #1976d2",
          transition: "transform 0.3s",
          "&:hover": {
            transform: "scale(1.05)",
            boxShadow: "0 0 10px #1976d2",
          },
        }}
      />

      <Box sx={{ flex: 1 }}>
        <Typography
          level="title-md"
          mb={1}
          sx={{
            fontWeight: "bold",
            color: "primary.plainColor",
          }}
        >
          {overlord.name}
        </Typography>

        <Textarea
          minRows={2}
          placeholder="Write something mew..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          sx={{ width: "100%", mb: 1 }}
        />

        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton component="label" variant="soft">
            <ImageIcon />
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageChange}
            />
          </IconButton>

          <Button
            variant="solid"
            color="primary"
            onClick={handleSubmit}
            disabled={!content.trim() && !image}
            startDecorator={<PetsIcon />}
            sx={{
              position: "relative",
              zIndex: 1,
              overflow: "hidden",
              borderRadius: "999px",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(25, 118, 210, 0.4)",
                borderRadius: "inherit",
                animation: "pulseWave 2s infinite",
                zIndex: -1,
              },
              "@keyframes pulseWave": {
                "0%": {
                  transform: "scale(1)",
                  opacity: 0.6,
                },
                "50%": {
                  transform: "scale(1.5)",
                  opacity: 0,
                },
                "100%": {
                  transform: "scale(1)",
                  opacity: 0,
                },
              },
            }}
          >
            Post
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default CreatePostForm;
