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
} from "@mui/joy";
import { useParams } from "react-router-dom";
import { fetchPostsByOverlordId } from "../../services/posts/postService";
import { useStreetStore } from "../../store/useStreetStore";

const API_URL = import.meta.env.VITE_API_URL;

const OverlordPostFeed = () => {
  const { id } = useParams();
  const selectedOverlord = useStreetStore((state) => state.selectedOverlord);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await fetchPostsByOverlordId(id);
        setPosts(data);
      } catch (error) {
        console.error("Error loading posts:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [id]);

  const handleEdit = (post) => {
    console.log("Edit post:", post);
  };

  const handleDelete = (postId) => {
    console.log("Delete post ID:", postId);
  };

  if (loading) return <Typography>Loading posts...</Typography>;
  if (posts.length === 0) return <Typography>No posts yet. 😿</Typography>;

  return (
    <Box sx={{ mt: 4 }}>
      {posts.map((post) => {
        const isOwnPost =
          selectedOverlord &&
          String(selectedOverlord.id) === String(post.overlord);

        return (
          <Card key={post.id} sx={{ mb: 3 }}>
            <CardContent orientation="horizontal">
              <Avatar
                src={
                  post.overlord_avatar?.startsWith("http")
                    ? post.overlord_avatar
                    : `${API_URL}${post.overlord_avatar}`
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
                }}
              />

              <Box>
                <Typography fontWeight="lg" color="primary">
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
                    onClick={() => handleDelete(post.id)}
                  >
                    Delete
                  </Button>
                </Stack>
              )}
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
};

export default OverlordPostFeed;
