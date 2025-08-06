import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardOverflow,
  AspectRatio,
  Avatar,
  Divider,
  Button,
  Stack,
  Snackbar,
} from "@mui/joy";
import { useNavigate } from "react-router-dom";
import { useStreetStore } from "../../store/useStreetStore";
import { useFeedSocket } from "../../hooks/useFeedSocket";
import EditPostModal from "../modals/EditPostModal";
import DeletePostModal from "../modals/DeletePostModal";
import { deletePost } from "../../services/posts/postService";

const API_URL = import.meta.env.VITE_API_URL;

const StreetPostFeed = () => {
  const posts = useStreetStore((state) => state.streetPosts);
  const loading = useStreetStore((state) => state.loading);
  const fetchStreetPosts = useStreetStore((state) => state.fetchStreetPosts);
  const selectedOverlord = useStreetStore((state) => state.selectedOverlord);
  const navigate = useNavigate();

  const [editingPost, setEditingPost] = useState(null);
  const [deletingPost, setDeletingPost] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    fetchStreetPosts();
  }, []);

  useFeedSocket();

  const handleEdit = (post) => {
    setEditingPost(post);
  };

  const handleDelete = (post) => {
    setDeletingPost(post);
  };

  const confirmDelete = async () => {
    try {
      await deletePost(deletingPost.id);
      setDeletingPost(null);
      await fetchStreetPosts();
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  if (loading) return <Typography>Loading posts...</Typography>;
  if (!posts.length) return <Typography>No posts yet. 😿</Typography>;

  return (
    <Box sx={{ mt: 4 }}>
      {posts.map((post) => {
        const isOwnPost = selectedOverlord?.id === post.overlord;

        return (
          <Card key={post.id} sx={{ mb: 3 }}>
            <CardContent orientation="horizontal">
              <Avatar
                src={
                  post.overlord_avatar?.startsWith("http")
                    ? post.overlord_avatar
                    : post.overlord_avatar
                    ? `${API_URL}${post.overlord_avatar}`
                    : "/media/placeholders/overlord_placeholder.png"
                }
                alt={post.overlord_name}
                sx={{
                  border: "2px solid #1976d2",
                  transition: "transform 0.3s",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: "0 0 10px #1976d2",
                  },
                  mr: 2,
                  cursor: "pointer",
                }}
                onClick={() => navigate(`/overlords/${post.overlord}`)}
              />

              <Box>
                <Typography
                  fontWeight="lg"
                  sx={{
                    cursor: "pointer",
                    color: "primary.plainColor",
                    "&:hover": { textDecoration: "underline" },
                  }}
                  onClick={() => navigate(`/overlords/${post.overlord}`)}
                >
                  {post.overlord_name}
                </Typography>

                <Typography level="body-sm" color="neutral">
                  {new Date(post.created_at).toLocaleString("hu-HU", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Typography>
              </Box>
            </CardContent>

            <CardContent>
              <Typography sx={{ whiteSpace: "pre-wrap" }}>
                {post.content}
              </Typography>
            </CardContent>

            {post.image && (
              <CardOverflow>
                <AspectRatio minHeight="200px" maxHeight="400px">
                  <img
                    src={
                      post.image?.startsWith("http")
                        ? post.image
                        : `${API_URL}${post.image}`
                    }
                    alt="Post"
                  />
                </AspectRatio>
              </CardOverflow>
            )}

            <Divider />

            <CardContent>
              <Typography level="body-xs" color="neutral">
                {post.reaction_summary?.length
                  ? post.reaction_summary
                      .map((r) => `${r.type} (${r.count})`)
                      .join(" • ")
                  : "No reactions yet"}
              </Typography>

              {isOwnPost && (
                <Stack direction="row" spacing={1} mt={2}>
                  <Button
                    size="sm"
                    variant="outlined"
                    color="neutral"
                    onClick={() => handleEdit(post)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="soft"
                    color="danger"
                    onClick={() => handleDelete(post)}
                  >
                    Delete
                  </Button>
                </Stack>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Edit Modal */}
      {editingPost && (
        <EditPostModal
          open={!!editingPost}
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onPostUpdated={() => {
            fetchStreetPosts();
            setEditingPost(null);
          }}
        />
      )}

      {/* Delete Modal */}
      {deletingPost && (
        <DeletePostModal
          open={!!deletingPost}
          onClose={() => setDeletingPost(null)}
          onDelete={confirmDelete}
        />
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2500}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        color="success"
      >
        Post deleted successfully!
      </Snackbar>
    </Box>
  );
};

export default StreetPostFeed;
