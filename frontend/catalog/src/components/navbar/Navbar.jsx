import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Sheet,
  Container,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/joy";
import { Link, useNavigate } from "react-router-dom";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useAuthStore } from "../../store/useAuthStore";
import { logoutUser } from "../../services/auth/authService";

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
      await logoutUser(); // 🔐 backend sütik törlése
    } catch (err) {
      console.error("Logout error:", err);
    }
    logout(); // 🔁 frontend Zustand reset
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
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
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

          <Menu
            anchorEl={anchorEl}
            open={isMenuOpen}
            onClose={handleMenuClose}
            placement="bottom-end"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem component={Link} to="/mews" onClick={handleMenuClose}>
              Mews
            </MenuItem>

            {isAuthenticated ? (
              <>
                <MenuItem
                  component={Link}
                  to="/webshop"
                  onClick={handleMenuClose}
                >
                  Webshop
                </MenuItem>
                <MenuItem
                  component={Link}
                  to="/my-slave"
                  onClick={handleMenuClose}
                >
                  My Slave
                </MenuItem>
                <MenuItem
                  component={Link}
                  to="/street"
                  onClick={handleMenuClose}
                >
                  Street
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </>
            ) : (
              <>
                <MenuItem
                  component={Link}
                  to="/login"
                  onClick={handleMenuClose}
                >
                  Login
                </MenuItem>
                <MenuItem
                  component={Link}
                  to="/register"
                  onClick={handleMenuClose}
                >
                  Register
                </MenuItem>
              </>
            )}
          </Menu>
        </Box>
      </Container>
    </Sheet>
  );
};

export default Navbar;
