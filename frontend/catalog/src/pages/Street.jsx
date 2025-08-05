// src/pages/Street.jsx
import React from "react";
import { Box, Typography } from "@mui/joy";
import CreatePostForm from "../components/street/CreatePostForm";
import StreetPostFeed from "../components/street/StreetPostFeed"; // 👈 Importáljuk

const Street = () => {
  return (
    <Box
      sx={{
        p: 4,
        maxWidth: 800,
        mx: "auto",
        mt: 4,
      }}
    >
      <Typography level="h2" sx={{ mb: 3, fontWeight: "bold" }}>
        Street
      </Typography>

      <CreatePostForm />

      <Box mt={4}>
        <StreetPostFeed />
      </Box>
    </Box>
  );
};

export default Street;
