import React from "react";
import { Box } from "@mui/joy";
import RegisterForm from "../components/register/Register";
import Welcome from "../components/login/Welcome";

const Register = () => {
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
        <RegisterForm />
      </Box>
    </Box>
  );
};

export default Register;
