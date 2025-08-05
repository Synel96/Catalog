// src/pages/Street.jsx
import React from "react";
import { Box, Typography } from "@mui/joy";
import CreatePostForm from "../components/street/CreatePostForm";

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

      {/* Itt jöhetnek majd a postok */}
    </Box>
  );
};

export default Street;
