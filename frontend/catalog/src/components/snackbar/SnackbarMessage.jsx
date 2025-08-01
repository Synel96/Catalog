import { Box, Alert, IconButton } from "@mui/joy";
import CloseIcon from "@mui/icons-material/Close";

const SnackbarMessage = ({ open, onClose, message, color = "success" }) => {
  if (!open) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1400,
        maxWidth: "90%",
      }}
    >
      <Alert
        variant="soft"
        color={color}
        endDecorator={
          <IconButton variant="plain" size="sm" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        }
      >
        {message}
      </Alert>
    </Box>
  );
};

export default SnackbarMessage;
