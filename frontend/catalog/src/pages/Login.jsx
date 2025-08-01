// src/pages/Login.jsx
import React from "react";
import { Box } from "@mui/joy";
import LoginForm from "../components/login/Login";
import Welcome from "../components/login/Welcome";
const LoginPage = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        minHeight: "100vh",
      }}
    >
      <Box
        sx={{
          flex: 1,
          backgroundColor: "background.level1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Welcome />
      </Box>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <LoginForm />
      </Box>
    </Box>
  );
};

export default LoginPage;
