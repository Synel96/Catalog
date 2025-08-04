// src/pages/Street.jsx
import React from "react";
import { Box, Typography } from "@mui/joy";

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

      <Typography>This is the Street page. Content coming soon!</Typography>
    </Box>
  );
};

export default Street;
