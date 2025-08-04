// src/components/navbar/Menu.jsx
import React from "react";
import { Menu, MenuItem } from "@mui/joy";
import { Link } from "react-router-dom";

const CustomMenu = ({
  anchorEl,
  isOpen,
  onClose,
  isAuthenticated,
  onLogout,
}) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={isOpen}
      onClose={onClose}
      placement="bottom-end"
    >
      <MenuItem component={Link} to="/mews" onClick={onClose}>
        Mews
      </MenuItem>

      {isAuthenticated ? (
        <>
          <MenuItem component={Link} to="/webshop" onClick={onClose}>
            Webshop
          </MenuItem>
          <MenuItem component={Link} to="/my-slave" onClick={onClose}>
            My Slave
          </MenuItem>
          <MenuItem onClick={onLogout}>Logout</MenuItem>
        </>
      ) : (
        <>
          <MenuItem component={Link} to="/login" onClick={onClose}>
            Login
          </MenuItem>
          <MenuItem component={Link} to="/register" onClick={onClose}>
            Register
          </MenuItem>
        </>
      )}
    </Menu>
  );
};

export default CustomMenu;
