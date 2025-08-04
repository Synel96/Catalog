import {
  Card,
  CardContent,
  Avatar,
  Box,
  Typography,
  Button,
  Modal,
  ModalDialog,
} from "@mui/joy";
import { useState } from "react";
import { updateCurrentUser } from "../../services/auth/userService";
import { useAuthStore } from "../../store/useAuthStore";
import EditSlaveModal from "./EditSlaveModal";
import SnackbarMessage from "../snackbar/SnackbarMessage";

const API_URL = import.meta.env.VITE_API_URL;

const SlaveProfileCard = () => {
  const user = useAuthStore((state) => state.user);
  const refetchUser = useAuthStore((state) => state.refetchUser);

  const [editOpen, setEditOpen] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);

  const handleSave = async (formData) => {
    try {
      await updateCurrentUser(formData);
      await refetchUser();
      setShowSnackbar(true);
      setEditOpen(false);
    } catch (err) {
      console.error("Failed to update user:", err);
    }
  };

  const avatarUrl =
    user?.avatar?.startsWith("http") || user?.avatar?.startsWith("data:")
      ? user.avatar
      : `${API_URL}${
          user?.avatar || "/media/placeholders/slave_placeholder.png"
        }`;

  if (!user) return null;

  return (
    <>
      <Card sx={{ maxWidth: 400, mx: "auto", mt: 4, p: 2 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              onClick={() => setIsImageOpen(true)}
              sx={{
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "scale(1.08)",
                  boxShadow: "md",
                },
                borderRadius: "50%",
              }}
            >
              <Avatar
                src={avatarUrl}
                alt={user.username}
                sx={{ width: 64, height: 64 }}
              />
            </Box>

            <Box>
              <Typography level="title-md">{user.username}</Typography>
              <Typography level="body-sm" textColor="neutral.500">
                {user.email}
              </Typography>
              {(user.first_name || user.last_name) && (
                <Typography level="body-sm" textColor="neutral.500">
                  {user.first_name} {user.last_name}
                </Typography>
              )}
            </Box>
          </Box>

          {user.bio && (
            <Box sx={{ mt: 2 }}>
              <Typography level="body-sm" textColor="neutral.500" mb={0.5}>
                Bio
              </Typography>
              <Typography>{user.bio}</Typography>
            </Box>
          )}

          <Box sx={{ mt: 2 }}>
            <Typography level="body-sm" textColor="neutral.500" mb={0.5}>
              Joined
            </Typography>
            <Typography>
              {new Date(user.date_joined).toLocaleDateString()}
            </Typography>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setEditOpen(true)}
            >
              Edit Profile
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <EditSlaveModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        slave={user}
        onSave={handleSave}
      />

      {/* Snackbar */}
      <SnackbarMessage
        open={showSnackbar}
        onClose={() => setShowSnackbar(false)}
        message="Profile updated!"
      />

      {/* Image Modal */}
      <Modal open={isImageOpen} onClose={() => setIsImageOpen(false)}>
        <ModalDialog layout="center" sx={{ p: 0, bgcolor: "transparent" }}>
          <Box
            component="img"
            src={avatarUrl}
            alt="Full size avatar"
            sx={{
              maxWidth: "90vw",
              maxHeight: "80vh",
              borderRadius: "lg",
              boxShadow: "lg",
            }}
          />
        </ModalDialog>
      </Modal>
    </>
  );
};

export default SlaveProfileCard;
