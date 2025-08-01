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

const EditSlaveModal = ({ open, onClose, slave, onSave }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    bio: "",
    avatar: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (slave) {
      setFormData({
        username: slave.username || "",
        email: slave.email || "",
        first_name: slave.first_name || "",
        last_name: slave.last_name || "",
        bio: slave.bio || "",
        avatar: null,
      });
    }
  }, [slave]);

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
    const payload = new FormData();

    for (const key in formData) {
      if (formData[key] !== null && formData[key] !== "") {
        payload.append(key, formData[key]);
      }
    }

    try {
      await onSave(payload); // szülőn belül történik a refetch és a modal zárása is
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog size="lg">
        <ModalClose />
        <Typography level="h4">Edit Profile</Typography>

        <Stack spacing={2} mt={2}>
          <Input
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
          />
          <Input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
          />
          <Input
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            placeholder="First Name"
          />
          <Input
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            placeholder="Last Name"
          />
          <Input
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Bio"
          />
          <Input
            name="avatar"
            type="file"
            accept="image/*"
            onChange={handleChange}
          />

          <Button onClick={handleSubmit} loading={isSubmitting}>
            Save Changes
          </Button>
        </Stack>
      </ModalDialog>
    </Modal>
  );
};

export default EditSlaveModal;
