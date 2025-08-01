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
import { registerUser } from "../../services/auth/authService";
import { useAuthStore } from "../../store/useAuthStore";

const Register = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const user = await registerUser(formData); // 🍪 cookie-t a böngésző kapja
      login({ user }); // csak a user-t mentjük Zustandba
      navigate("/myslave");
    } catch (err) {
      setError(err.detail || "Registration failed.");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        px: 2,
      }}
    >
      <Sheet
        sx={{
          width: { xs: "100%", sm: 400 },
          mx: "auto",
          p: 4,
          borderRadius: "md",
          boxShadow: "lg",
          backgroundColor: "background.surface",
        }}
      >
        <Typography level="h4" textAlign="center" mb={2}>
          Register
        </Typography>

        <form onSubmit={handleSubmit}>
          <FormControl required>
            <FormLabel>Slavename</FormLabel>
            <Input
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
            />
          </FormControl>

          <FormControl required sx={{ mt: 2 }}>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
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

          <FormControl required sx={{ mt: 2 }}>
            <FormLabel>Confirm Password</FormLabel>
            <Input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
            />
          </FormControl>

          {error && (
            <Typography level="body-sm" color="danger" mt={1}>
              {error}
            </Typography>
          )}

          <Button type="submit" fullWidth sx={{ mt: 3 }}>
            Register
          </Button>
        </form>

        <Typography level="body-sm" textAlign="center" mt={2}>
          Already have an account?{" "}
          <JoyLink onClick={() => navigate("/login")} underline="hover">
            Login
          </JoyLink>
        </Typography>
      </Sheet>
    </Box>
  );
};

export default Register;
