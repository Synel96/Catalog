// src/components/navbar/Navbar.jsx
import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Sheet,
  Container,
  IconButton,
  Avatar,
  Stack,
} from "@mui/joy";
import { Link, useNavigate } from "react-router-dom";
import NotificationsIcon from "@mui/icons-material/Notifications";
import HomeIcon from "@mui/icons-material/Home";
import SearchBar from "./SearchBar";
import { useAuthStore } from "../../store/useAuthStore";
import { useStreetStore } from "../../store/useStreetStore";
import { logoutUser } from "../../services/auth/authService";
import CustomMenu from "./Menu";

const API_URL = import.meta.env.VITE_API_URL;
const PLACEHOLDER_AVATAR = "/media/placeholders/overlord_placeholder.png";

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  const isMenuOpen = Boolean(anchorEl);
  const { user, logout, isAuthenticated } = useAuthStore();

  const selectedOverlord = useStreetStore((state) => state.selectedOverlord);
  const isOnStreet = useStreetStore((state) => state.isOnStreet);
  const clearSelectedOverlord = useStreetStore(
    (state) => state.clearSelectedOverlord
  );

  const handleMenuToggle = (event) => {
    setAnchorEl((prev) =>
      prev === event.currentTarget ? null : event.currentTarget
    );
  };

  const handleMenuClose = () => setAnchorEl(null);

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

  const handleGoHome = () => {
    clearSelectedOverlord(); // állítja isOnStreet-et is
    navigate("/my-slave");
  };

  const username = user?.username || "";

  const handleSearch = (term) => {
    console.log("Keresés:", term);
  };

  const handleSelect = (item) => {
    if (!item) return;
    setSearchTerm("");
    navigate(`/overlords/${item.id}`);
  };

  return (
    <Sheet
      component="header"
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
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          py: 2,
          px: { xs: 2, sm: 4 },
          gap: 1,
        }}
      >
        <Link to="/" aria-label="Home">
          <Box
            component="img"
            src="/brand.png"
            alt="Catalog Logo"
            sx={{
              width: { xs: 140, sm: 150, md: 200 },
              height: { xs: 35, sm: 40, md: 60 },
              objectFit: "contain",
              borderRadius: "md",
              boxShadow: "sm",
              transition: "transform 0.2s ease, boxShadow 0.2s ease",
              "&:hover, &:focus-visible": {
                transform: "scale(1.05)",
                boxShadow: "md",
              },
            }}
          />
        </Link>

        {isOnStreet ? (
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{
              flexGrow: 1,
              justifyContent: "center",
              minWidth: 0,
              flexWrap: "wrap",
              gap: { xs: 1, sm: 2 },
            }}
          >
            <Box sx={{ minWidth: 0, display: "flex", alignItems: "center" }}>
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                onSearch={handleSearch}
                onSelect={handleSelect}
                searchUrl={`${API_URL}/profiles/overlords/`}
                placeholder="Search Overlords..."
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                minWidth: 0,
              }}
            >
              <Avatar
                src={
                  selectedOverlord?.avatar?.startsWith("http") ||
                  selectedOverlord?.avatar?.startsWith("data:")
                    ? selectedOverlord.avatar
                    : `${API_URL}${
                        selectedOverlord?.avatar || PLACEHOLDER_AVATAR
                      }`
                }
                alt={selectedOverlord?.name || ""}
                sx={{
                  width: 40,
                  height: 40,
                  border: "2px solid",
                  borderColor: "primary.500",
                  cursor: "pointer",
                  transition: "transform 0.3s ease",
                  "&:hover, &:focus-visible": {
                    transform: "scale(1.1)",
                    boxShadow: "0 0 8px rgba(0,0,0,0.3)",
                  },
                  flexShrink: 0,
                }}
              />
              <Typography
                sx={{
                  fontWeight: "bold",
                  color: "#000",
                  whiteSpace: "normal",
                  overflow: "visible",
                  textOverflow: "unset",
                  display: { xs: "none", sm: "block" },
                }}
              >
                On the Street with: {selectedOverlord?.name}
              </Typography>
            </Box>

            <Button
              variant="outlined"
              color="neutral"
              startDecorator={<HomeIcon />}
              onClick={handleGoHome}
              sx={{ whiteSpace: "nowrap", flexShrink: 0 }}
              aria-label="Go Home"
            >
              Go Home
            </Button>
          </Stack>
        ) : (
          <Box sx={{ flexGrow: 1, minWidth: 0 }} />
        )}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "nowrap",
            minWidth: 0,
          }}
        >
          {isAuthenticated && !isOnStreet && (
            <Typography
              level="body-md"
              sx={{
                fontWeight: "md",
                color: "#000",
                display: { xs: "none", sm: "block" },
                whiteSpace: "normal",
              }}
            >
              Welcome, {username}!
            </Typography>
          )}

          {isAuthenticated && isOnStreet && (
            <IconButton
              color="neutral"
              variant="outlined"
              aria-label="Notifications"
              sx={{ mr: 1, flexShrink: 0 }}
            >
              <NotificationsIcon />
            </IconButton>
          )}

          <Button
            variant="solid"
            color="primary"
            onClick={handleMenuToggle}
            aria-controls={isMenuOpen ? "navigation-menu" : undefined}
            aria-expanded={isMenuOpen ? "true" : undefined}
            aria-label="Open menu"
            sx={{
              fontSize: { xs: "0.8rem", sm: "1rem" },
              px: 2,
              py: 1,
              flexShrink: 0,
            }}
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
