import { Card, CardContent, Avatar, Box, Typography, Button } from "@mui/joy";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../../services/auth/userService";
import { useAuthStore } from "../../store/useAuthStore";

const API_URL = import.meta.env.VITE_API_URL;

const SlaveProfileCard = () => {
  const [user, setUser] = useState(null);
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
        login({ user: userData }); // állapotfrissítés Zustandba is
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };

    fetchUser();
  }, []);

  const avatarUrl =
    user?.avatar?.startsWith("http") || user?.avatar?.startsWith("data:")
      ? user.avatar
      : `${API_URL}${user?.avatar || "/media/avatars/default_slave.png"}`;

  if (!user) return null;

  return (
    <Card sx={{ maxWidth: 400, mx: "auto", mt: 4, p: 2 }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            src={avatarUrl}
            alt={user?.username}
            sx={{ width: 64, height: 64 }}
          />
          <Box>
            <Typography level="title-md">{user.username}</Typography>
            <Typography level="body-sm" textColor="neutral.500">
              {user.email}
            </Typography>
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
          <Button variant="outlined" fullWidth>
            Edit Profile
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SlaveProfileCard;
