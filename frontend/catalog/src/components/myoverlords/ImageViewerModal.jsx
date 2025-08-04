import { Modal, ModalDialog, ModalClose, Box } from "@mui/joy";

const ImageViewerModal = ({ open, onClose, src, alt }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog>
        <ModalClose />
        <Box
          component="img"
          src={src}
          alt={alt}
          sx={{ maxWidth: "100%", maxHeight: "80vh", objectFit: "contain" }}
        />
      </ModalDialog>
    </Modal>
  );
};

export default ImageViewerModal;
