import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Typography,
  Link as JoyLink,
  Sheet,
} from "@mui/joy";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Login with:", formData);
    // Ide jön az axios POST és a JWT mentés
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        px: 2,
        // backgroundColor removed to let theme's global background show
      }}
    >
      <Sheet
        sx={{
          width: { xs: "100%", sm: 360 },
          mx: "auto",
          p: 4,
          borderRadius: "md",
          boxShadow: "lg",
          backgroundColor: "background.surface",
        }}
      >
        <Typography level="h4" textAlign="center" mb={2}>
          Login
        </Typography>
        <form onSubmit={handleSubmit}>
          <FormControl required>
            <FormLabel>Username</FormLabel>
            <Input
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
            />
          </FormControl>

          <FormControl required sx={{ mt: 2 }}>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
            />
          </FormControl>

          <Button type="submit" fullWidth sx={{ mt: 3 }}>
            Login
          </Button>
        </form>

        <Typography level="body-sm" textAlign="center" mt={2}>
          Don’t have an account?{" "}
          <JoyLink onClick={() => navigate("/register")} underline="hover">
            Register
          </JoyLink>
        </Typography>
      </Sheet>
    </Box>
  );
};

export default Login;
