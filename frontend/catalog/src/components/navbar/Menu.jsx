// src/components/navbar/Menu.jsx
import React from "react";
import { Menu, MenuItem } from "@mui/joy";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

const CustomMenu = ({
  anchorEl,
  isOpen,
  onClose,
  isAuthenticated,
  onLogout,
}) => {
  const handleLogout = () => {
    if (onLogout) onLogout();
    if (onClose) onClose();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={isOpen}
      onClose={onClose}
      placement="bottom-end"
      aria-label="Navigation menu"
      slotProps={{
        root: {
          sx: {
            zIndex: 1500,
          },
        },
      }}
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
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
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

CustomMenu.propTypes = {
  anchorEl: PropTypes.any,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool,
  onLogout: PropTypes.func,
};

CustomMenu.defaultProps = {
  isAuthenticated: false,
  onLogout: undefined,
};

export default CustomMenu;
