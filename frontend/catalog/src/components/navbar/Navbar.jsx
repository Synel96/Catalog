import React, { useState, useCallback } from "react";
import {
  Box,
  Button,
  Typography,
  Sheet,
  Container,
  IconButton,
  Input,
  Avatar,
  Stack,
  useColorScheme,
} from "@mui/joy";
import { Link, useNavigate, useLocation } from "react-router-dom";
import NotificationsIcon from "@mui/icons-material/Notifications";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { useAuthStore } from "../../store/useAuthStore";
import { useStreetStore } from "../../store/useStreetStore";
import { logoutUser } from "../../services/auth/authService";
import CustomMenu from "./Menu";

const API_URL = import.meta.env.VITE_API_URL;
const PLACEHOLDER_AVATAR = "/media/placeholders/overlord_placeholder.png";

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const isMenuOpen = Boolean(anchorEl);
  const { user, logout, isAuthenticated } = useAuthStore();

  const selectedOverlord = useStreetStore((state) => state.selectedOverlord);
  const clearSelectedOverlord = useStreetStore(
    (state) => state.clearSelectedOverlord
  );

  const handleMenuToggle = useCallback((event) => {
    setAnchorEl((prev) =>
      prev === event.currentTarget ? null : event.currentTarget
    );
  }, []);
  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

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
    clearSelectedOverlord();
    navigate("/my-slave");
  };

  const isOnStreet =
    location.pathname.startsWith("/street") && selectedOverlord;

  const username = user?.username || "";

  const toggleMobileSearch = () => {
    setMobileSearchOpen((o) => !o);
    if (!mobileSearchOpen) {
      setSearchTerm("");
    }
  };

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
      component="header"
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
        {/* Logo */}
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

        {/* Közép – Street nézet */}
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
            {/* Kereső: desktopon input; mobilon csak ikon */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                minWidth: 0,
              }}
            >
              {/* Desktop input */}
              <Box sx={{ display: { xs: "none", sm: "block" } }}>
                <Input
                  placeholder="Search..."
                  size="sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search"
                  sx={{
                    maxWidth: 300,
                    transition: "width .2s ease",
                    "&:focus-visible": {
                      boxShadow: "0 0 0 3px rgba(0,123,255,0.5)",
                    },
                  }}
                />
              </Box>

              {/* Mobil ikon + expand */}
              <Box
                sx={{
                  display: { xs: "flex", sm: "none" },
                  alignItems: "center",
                  position: "relative",
                  minWidth: 0,
                }}
              >
                {!mobileSearchOpen && (
                  <IconButton
                    aria-label="Open search"
                    onClick={toggleMobileSearch}
                    variant="outlined"
                    size="sm"
                  >
                    <SearchIcon />
                  </IconButton>
                )}
                {mobileSearchOpen && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      width: "100%",
                    }}
                  >
                    <Input
                      placeholder="Search..."
                      size="sm"
                      autoFocus
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      aria-label="Search"
                      sx={{ flexGrow: 1 }}
                    />
                    <IconButton
                      aria-label="Close search"
                      size="sm"
                      onClick={toggleMobileSearch}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Avatar (mobilon csak kép, felirat desktopon) */}
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
                  selectedOverlord.avatar?.startsWith("http") ||
                  selectedOverlord.avatar?.startsWith("data:")
                    ? selectedOverlord.avatar
                    : `${API_URL}${
                        selectedOverlord.avatar || PLACEHOLDER_AVATAR
                      }`
                }
                alt={selectedOverlord.name}
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
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: 160,
                  display: { xs: "none", sm: "block" }, // mobilon nincs felirat
                }}
                noWrap
              >
                On the Street with: {selectedOverlord.name}
              </Typography>
            </Box>

            <Button
              variant="outlined"
              color="neutral"
              startDecorator={<HomeIcon />}
              onClick={handleGoHome}
              sx={{
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
              aria-label="Go Home"
            >
              Go Home
            </Button>
          </Stack>
        ) : (
          <Box sx={{ flexGrow: 1, minWidth: 0 }} />
        )}

        {/* Jobb oldal */}
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
