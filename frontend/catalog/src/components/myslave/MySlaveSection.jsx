import { useEffect, useState } from "react";
import { getCurrentUser } from "../../services/auth/userService";
import SlaveProfileSkeleton from "./SlaveProfileSkeleton";
import SlaveProfileCard from "./SlaveProfileCard";
import { Box, Typography } from "@mui/joy";

const MySlaveSection = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    getCurrentUser()
      .then((res) => setUser(res))
      .catch((err) => console.error("Failed to fetch user:", err));
  }, []);

  return !user ? (
    <SlaveProfileSkeleton />
  ) : (
    <Box>
      {/* ✅ Felirat */}
      <Typography
        level="h4"
        sx={{
          mb: 2,
          fontWeight: "bold",
          textAlign: "center",
          fontSize: { xs: "1.8rem", md: "2rem" },
        }}
      >
        Slave
      </Typography>

      {/* Kártya */}
      <SlaveProfileCard user={user} />
    </Box>
  );
};

export default MySlaveSection;
