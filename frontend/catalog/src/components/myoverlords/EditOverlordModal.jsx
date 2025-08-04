import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  Input,
  Button,
  Stack,
} from "@mui/joy";
import { useState, useEffect } from "react";
import { useOverlordStore } from "../../store/useOverlordsStore";

const EditOverlordModal = ({ open, onClose, overlord }) => {
  const updateOverlord = useOverlordStore((state) => state.updateOverlord);
  const fetchOverlords = useOverlordStore((state) => state.fetchOverlords);

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    breed: "",
    avatar: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (overlord) {
      setFormData({
        name: overlord.name || "",
        bio: overlord.bio || "",
        breed: overlord.breed || "",
        avatar: null, // Nem töltjük elő, mert új fájlt várunk feltöltéshez
      });
    }
  }, [overlord]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "avatar") {
      setFormData((prev) => ({ ...prev, avatar: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!overlord) return; // nincs mit menteni

    setIsSubmitting(true);
    setError("");

    const payload = new FormData();
    if (formData.name.trim()) payload.append("name", formData.name.trim());
    if (formData.bio.trim()) payload.append("bio", formData.bio.trim());
    if (formData.breed.trim()) payload.append("breed", formData.breed.trim());
    if (formData.avatar) payload.append("avatar", formData.avatar);

    try {
      await updateOverlord(overlord.id, payload);
      await fetchOverlords(); // frissítjük a store-t, hogy az UI is frissüljön
      onClose();
    } catch (err) {
      setError(err.detail || "Failed to update overlord.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog size="sm">
        <ModalClose />
        <Typography level="h4" mb={2}>
          Edit Overlord
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
            Save Changes
          </Button>
        </Stack>
      </ModalDialog>
    </Modal>
  );
};

export default EditOverlordModal;
