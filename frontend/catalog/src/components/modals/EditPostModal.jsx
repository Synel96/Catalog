import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalDialog,
  ModalClose,
  Button,
  Textarea,
  Stack,
  IconButton,
  Typography,
} from "@mui/joy";
import ImageIcon from "@mui/icons-material/Image";
import SaveIcon from "@mui/icons-material/Save";
import { updatePost } from "../../services/posts/postService";

const EditPostModal = ({ open, onClose, post, onPostUpdated }) => {
  const [content, setContent] = useState(post.content || "");
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (post) {
      setContent(post.content || "");
      setImage(null);
    }
  }, [post]);

  const handleImageChange = (e) => {
    if (e.target.files.length > 0) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!post?.id) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("content", content);
    if (image) {
      formData.append("image", image);
    }

    try {
      await updatePost(post.id, formData);
      onPostUpdated(); // callback a parent komponensből, pl. refetch
      onClose();
    } catch (err) {
      console.error("Post update failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog>
        <ModalClose />
        <Typography level="h4" mb={2}>
          Edit Post
        </Typography>

        <Textarea
          minRows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Update your meow..."
          sx={{ mb: 2 }}
        />

        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <IconButton component="label" variant="soft">
            <ImageIcon />
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageChange}
            />
          </IconButton>
          {image && <Typography level="body-sm">{image.name}</Typography>}
        </Stack>

        <Button
          onClick={handleSubmit}
          loading={isSubmitting}
          disabled={!content.trim() && !image}
          startDecorator={<SaveIcon />}
          variant="solid"
        >
          Save Changes
        </Button>
      </ModalDialog>
    </Modal>
  );
};

export default EditPostModal;
