import React from "react";
import {
  Modal,
  ModalDialog,
  Typography,
  ModalClose,
  Button,
  Stack,
} from "@mui/joy";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";

const DeletePostModal = ({ open, onClose, onDelete }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        variant="outlined"
        role="alertdialog"
        aria-labelledby="delete-post-title"
        aria-describedby="delete-post-desc"
        sx={{ maxWidth: 400 }}
      >
        <ModalClose />
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <WarningRoundedIcon color="danger" />
            <Typography id="delete-post-title" level="h4">
              Delete Post
            </Typography>
          </Stack>

          <Typography id="delete-post-desc" level="body-md">
            Are you sure you want to delete this post? This action cannot be
            undone.
          </Typography>

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button variant="plain" onClick={onClose}>
              Cancel
            </Button>
            <Button color="danger" onClick={onDelete}>
              Delete
            </Button>
          </Stack>
        </Stack>
      </ModalDialog>
    </Modal>
  );
};

export default DeletePostModal;
