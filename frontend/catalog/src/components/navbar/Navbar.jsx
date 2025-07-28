// src/components/navbar/Navbar.jsx
import React from "react";
import { Sheet, Container, Box, Button, Menu, MenuItem } from "@mui/joy";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Sheet
      variant="soft"
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
        {/* Brand (clickable logo directs to Login page) */}
        <Link to="/login" style={{ textDecoration: "none" }}>
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

        {/* Menu dropdown & News button */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="solid"
            color="primary"
            onClick={handleMenuClick}
            sx={{ fontSize: { xs: "0.8rem", sm: "1rem" }, px: 2, py: 1 }}
          >
            Menu
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            placement="bottom-end"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem component={Link} to="/login" onClick={handleMenuClose}>
              Login
            </MenuItem>
            <MenuItem component={Link} to="/register" onClick={handleMenuClose}>
              Register
            </MenuItem>
          </Menu>

          <Button
            component={Link}
            to="/news"
            variant="solid"
            color="primary"
            sx={{ fontSize: { xs: "0.8rem", sm: "1rem" }, px: 2, py: 1 }}
          >
            Mews
          </Button>
        </Box>
      </Container>
    </Sheet>
  );
};

export default Navbar;
