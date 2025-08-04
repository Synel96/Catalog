// src/components/myoverlords/CreateOverlordModal.jsx
import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  Input,
  Button,
  Stack,
} from "@mui/joy";
import { useState } from "react";
import { useOverlordStore } from "../../store/useOverlordsStore";

const CreateOverlordModal = ({ open, onClose }) => {
  const addOverlord = useOverlordStore((state) => state.addOverlord);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    breed: "",
    avatar: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "avatar") {
      setFormData((prev) => ({ ...prev, avatar: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");

    const payload = new FormData();
    if (formData.name.trim()) {
      payload.append("name", formData.name.trim());
    }
    if (formData.bio.trim()) {
      payload.append("bio", formData.bio.trim());
    }
    if (formData.breed.trim()) {
      payload.append("breed", formData.breed.trim());
    }
    if (formData.avatar) {
      payload.append("avatar", formData.avatar);
    }

    try {
      await addOverlord(payload);
      onClose();
      setFormData({ name: "", bio: "", breed: "", avatar: null });
    } catch (err) {
      setError(err.detail || "Failed to create overlord.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog size="sm">
        <ModalClose />
        <Typography level="h4" mb={2}>
          Create New Overlord
        </Typography>

        <Stack spacing={2}>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            autoFocus
            disabled={isSubmitting}
            required
          />

          <Input
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Bio"
            disabled={isSubmitting}
          />

          <Input
            name="breed"
            value={formData.breed}
            onChange={handleChange}
            placeholder="Breed"
            disabled={isSubmitting}
          />

          <Input
            name="avatar"
            type="file"
            accept="image/*"
            onChange={handleChange}
            disabled={isSubmitting}
          />

          {error && (
            <Typography color="danger" level="body-sm">
              {error}
            </Typography>
          )}

          <Button
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={!formData.name.trim() || isSubmitting}
            fullWidth
          >
            Create
          </Button>
        </Stack>
      </ModalDialog>
    </Modal>
  );
};

export default CreateOverlordModal;
