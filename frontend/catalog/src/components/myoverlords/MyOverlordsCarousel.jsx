import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Avatar,
  Button,
  Stack,
} from "@mui/joy";
import { Edit } from "lucide-react";

import ImageViewerModal from "./ImageViewerModal"; // Importáld be a modalt

const API_URL = import.meta.env.VITE_API_URL;

const OverlordCarousel = ({ overlords = [], onEdit, onCreate }) => {
  const length = overlords.length;
  const [currentIndex, setCurrentIndex] = useState(0);

  // Állapotok a képnézegető modal kezeléséhez
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState({ src: null, alt: "" });

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === length - 1 ? 0 : prev + 1));
  };

  const openImageModal = (src, alt) => {
    setModalImage({ src, alt });
    setModalOpen(true);
  };

  if (length === 0) {
    return (
      <Box sx={{ textAlign: "center", p: 4 }}>
        <Typography level="h3" sx={{ mb: 4, fontWeight: "bold" }}>
          My Overlords
        </Typography>
        <Button variant="solid" size="lg" onClick={onCreate}>
          + Create Overlord
        </Button>
      </Box>
    );
  }

  const currentOverlord = overlords[currentIndex];
  const avatarUrl =
    currentOverlord.avatar?.startsWith("http") ||
    currentOverlord.avatar?.startsWith("data:")
      ? currentOverlord.avatar
      : `${API_URL}${
          currentOverlord.avatar ||
          "media/placeholders/overlord_placeholder.png"
        }`;

  return (
    <Box sx={{ textAlign: "center", p: 4, maxWidth: 360, mx: "auto" }}>
      <Typography
        level="h3"
        sx={{ mb: 4, fontWeight: "bold", letterSpacing: "0.05em" }}
      >
        My Overlords
      </Typography>

      <Card
        variant="outlined"
        sx={{
          width: 320,
          mx: "auto",
          p: 3,
          position: "relative",
          borderRadius: 3,
          boxShadow: 2,
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          cursor: "default",
          "&:hover": {
            transform: "translateY(-8px)",
            boxShadow: 6,
          },
        }}
      >
        <CardContent sx={{ textAlign: "center", px: 3, pb: 2 }}>
          <Avatar
            src={avatarUrl}
            alt={`${currentOverlord.name}'s avatar`}
            sx={{
              width: 120,
              height: 120,
              mx: "auto",
              mb: 2,
              border: "4px solid",
              borderColor: "primary.500",
              transition: "transform 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
              },
              cursor: "pointer",
            }}
            onClick={() => openImageModal(avatarUrl, currentOverlord.name)}
          />
          <Typography
            level="h5"
            sx={{ mb: 1, fontWeight: "bold", textTransform: "capitalize" }}
          >
            {currentOverlord.name || "Unnamed Overlord"}
          </Typography>

          <Typography
            level="body1"
            textColor="neutral.700"
            sx={{ mb: 1, fontStyle: "italic" }}
          >
            Breed: {currentOverlord.breed || "No breed"}
          </Typography>

          <Typography
            level="body2"
            textColor="neutral.500"
            sx={{
              mb: 3,
              fontStyle: "italic",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "260px",
              mx: "auto",
            }}
            title={currentOverlord.bio || "No bio"}
          >
            {currentOverlord.bio || "No bio"}
          </Typography>

          <Stack
            direction="row"
            justifyContent="center"
            spacing={2}
            sx={{ mb: 1 }}
          >
            <Button
              variant="outlined"
              color="neutral"
              size="sm"
              onClick={prevSlide}
            >
              ‹ Prev
            </Button>
            <Button
              variant="outlined"
              color="neutral"
              size="sm"
              onClick={nextSlide}
            >
              Next ›
            </Button>
          </Stack>

          <Button
            variant="solid"
            color="primary"
            fullWidth
            size="md"
            onClick={() =>
              alert(`Go to the Street with ${currentOverlord.name}`)
            }
          >
            Go to the Street with {currentOverlord.name}
          </Button>

          <IconButton
            onClick={() => onEdit(currentOverlord)}
            variant="plain"
            color="primary"
            sx={{ mt: 2, position: "absolute", top: 12, right: 12 }}
            aria-label="Edit Overlord"
          >
            <Edit size={24} />
          </IconButton>
        </CardContent>
      </Card>

      <Button
        variant="solid"
        size="lg"
        onClick={onCreate}
        sx={{ mt: 4, width: "100%" }}
      >
        + Create Overlord
      </Button>

      <ImageViewerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        src={modalImage.src}
        alt={modalImage.alt}
      />
    </Box>
  );
};

export default OverlordCarousel;
