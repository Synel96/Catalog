// src/components/navbar/Navbar.jsx
import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Sheet,
  Container,
  IconButton,
} from "@mui/joy";
import { Link, useNavigate } from "react-router-dom";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useAuthStore } from "../../store/useAuthStore";
import { logoutUser } from "../../services/auth/authService";
import CustomMenu from "./Menu";

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const isMenuOpen = Boolean(anchorEl);
  const { user, logout, isAuthenticated } = useAuthStore();

  const handleMenuToggle = (event) => {
    setAnchorEl((prev) => (prev ? null : event.currentTarget));
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout error:", err);
    }
    logout();
    handleMenuClose();
    navigate("/login");
  };

  const username = user?.username || "";

  return (
    <Sheet
      sx={{
        backgroundColor: "#ffe6e6",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          py: 2,
          px: { xs: 2, sm: 4 },
        }}
      >
        <Link to="/" style={{ textDecoration: "none" }}>
          <Box
            component="img"
            src="/brand.png"
            alt="Catalog Logo"
            sx={{
              width: { xs: 150, sm: 200 },
              height: { xs: 40, sm: 60 },
              objectFit: "contain",
              borderRadius: "md",
              boxShadow: "sm",
              transition: "transform 0.2s ease, boxShadow 0.2s ease",
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: "md",
              },
            }}
          />
        </Link>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {isAuthenticated && (
            <>
              <Typography
                level="body-md"
                sx={{ fontWeight: "md", color: "#000" }}
              >
                Welcome, {username}!
              </Typography>

              <IconButton color="neutral" variant="outlined">
                <NotificationsIcon />
              </IconButton>
            </>
          )}

          <Button
            variant="solid"
            color="primary"
            onClick={handleMenuToggle}
            sx={{ fontSize: { xs: "0.8rem", sm: "1rem" }, px: 2, py: 1 }}
          >
            Menu
          </Button>

          <CustomMenu
            anchorEl={anchorEl}
            isOpen={isMenuOpen}
            onClose={handleMenuClose}
            isAuthenticated={isAuthenticated}
            onLogout={handleLogout}
          />
        </Box>
      </Container>
    </Sheet>
  );
};

export default Navbar;
