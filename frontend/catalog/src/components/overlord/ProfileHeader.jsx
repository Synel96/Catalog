import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Avatar,
  Typography,
  Stack,
  Button,
  Tooltip,
  useTheme,
} from "@mui/joy";
import whiskerIcon from "../../assets/whisker.png";
import { useStreetStore } from "../../store/useStreetStore";
import { useSnackbarStore } from "../../store/snackbarStore";
import ImageViewerModal from "../myoverlords/ImageViewerModal";

const API_URL = import.meta.env.VITE_API_URL;
const PLACEHOLDER_OVERLORD = "/media/placeholders/overlord_placeholder.png";

/** Avatar fallback */
const AvatarWithFallback = ({ src, alt, size = 100, onClick, ...rest }) => {
  const resolve = (val) => {
    if (!val) return `${API_URL}${PLACEHOLDER_OVERLORD}`;
    if (val.startsWith("http") || val.startsWith("data:")) return val;
    return `${API_URL}${val.startsWith("/") ? val : `/${val}`}`;
  };

  return (
    <Avatar
      src={resolve(src)}
      alt={alt}
      size="xl"
      onClick={onClick}
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        border: "2px solid",
        borderColor: "divider",
        transition: "transform 0.3s ease, filter 0.3s ease",
        cursor: "pointer",
        "&:hover": {
          transform: "scale(1.05)",
          filter: "brightness(1.1)",
        },
      }}
      {...rest}
    />
  );
};

AvatarWithFallback.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  size: PropTypes.number,
  onClick: PropTypes.func,
};

/** ProfileHeader */
const ProfileHeader = ({
  overlord,
  actions = null,
  onWhisker = null,
  onUnwhisker = null,
}) => {
  if (!overlord) return null;

  const theme = useTheme();
  const streetOverlord = useStreetStore((state) => state.selectedOverlord);
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);
  const isStreetOverlord = streetOverlord && overlord.id === streetOverlord.id;

  const [modalOpen, setModalOpen] = useState(false);

  const handleWhisker = async () => {
    try {
      await onWhisker();
      showSnackbar("Whiskered this overlord successfully!", "success");
    } catch (error) {
      if (error?.response?.data?.detail?.includes("already exists")) {
        showSnackbar("You are already whiskering this overlord.", "warning");
      } else {
        showSnackbar("Failed to whisker overlord.", "danger");
      }
    }
  };

  const handleUnwhisker = async () => {
    try {
      await onUnwhisker();
      showSnackbar("Unwhiskered this overlord successfully!", "success");
    } catch (error) {
      if (error?.response?.data?.detail?.includes("not found")) {
        showSnackbar(
          "Cannot unwhisker an overlord you are not whiskering.",
          "warning"
        );
      } else {
        showSnackbar("Failed to unwhisker overlord.", "danger");
      }
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 3,
        alignItems: "flex-start",
        width: "100%",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <AvatarWithFallback
          src={overlord.avatar}
          alt={overlord.name}
          size={100}
          onClick={() => setModalOpen(true)}
        />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 2,
            mb: 1,
          }}
        >
          <Typography level="h2" sx={{ m: 0, lineHeight: 1.1 }}>
            {overlord.name}
          </Typography>

          <Box
            sx={{
              ml: "auto",
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            {!isStreetOverlord && (
              <>
                <Tooltip title="Whisker this Overlord">
                  <span>
                    <Button
                      size="sm"
                      variant="soft"
                      color="primary"
                      onClick={handleWhisker}
                      sx={{
                        position: "relative",
                        zIndex: 1,
                        "&::after": {
                          content: '""',
                          position: "absolute",
                          top: "-6px",
                          left: "-6px",
                          right: "-6px",
                          bottom: "-6px",
                          borderRadius: "8px",
                          boxShadow: "0 0 0 0 rgba(0, 128, 255, 0.5)",
                          animation: "pulseEffect 1.8s infinite ease-in-out",
                          zIndex: -1,
                        },
                        "@keyframes pulseEffect": {
                          "0%": {
                            boxShadow: "0 0 0 0 rgba(0, 128, 255, 0.5)",
                          },
                          "70%": {
                            boxShadow: "0 0 0 10px rgba(0, 128, 255, 0)",
                          },
                          "100%": {
                            boxShadow: "0 0 0 0 rgba(0, 128, 255, 0)",
                          },
                        },
                      }}
                      startDecorator={
                        <Box
                          component="img"
                          src={whiskerIcon}
                          alt="Whisker"
                          sx={{
                            width: 18,
                            height: 18,
                            filter: "grayscale(40%) contrast(1)",
                          }}
                        />
                      }
                    >
                      Whisker
                    </Button>
                  </span>
                </Tooltip>

                <Tooltip title="Unwhisker this Overlord">
                  <span>
                    <Button
                      size="sm"
                      variant="solid"
                      color="danger"
                      onClick={handleUnwhisker}
                      startDecorator={
                        <Box
                          component="img"
                          src={whiskerIcon}
                          alt="Unwhisker"
                          sx={{ width: 18, height: 18 }}
                        />
                      }
                    >
                      Unwhisker
                    </Button>
                  </span>
                </Tooltip>
              </>
            )}

            {actions && <Box>{actions}</Box>}
          </Box>
        </Box>

        <Stack direction="row" spacing={3} flexWrap="wrap" mb={1}>
          <Typography level="body-md">
            <strong>Breed:</strong> {overlord.breed || "—"}
          </Typography>
          {overlord.slave_name && (
            <Typography level="body-md">
              <strong>Slave:</strong> {overlord.slave_name}
            </Typography>
          )}
          <Typography level="body-md">
            <strong>Whiskered by:</strong> {overlord.whiskered_by_count ?? "0"}
          </Typography>
          <Typography level="body-md">
            <strong>Whiskering:</strong> {overlord.whiskering_count ?? "0"}
          </Typography>
        </Stack>

        {overlord.bio && (
          <Typography level="body-md" sx={{ whiteSpace: "pre-line" }}>
            {overlord.bio}
          </Typography>
        )}
      </Box>

      {/* Modal image viewer */}
      <ImageViewerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        src={
          overlord.avatar?.startsWith("http")
            ? overlord.avatar
            : `${API_URL}/${overlord.avatar || PLACEHOLDER_OVERLORD}`
        }
        alt={overlord.name}
      />
    </Box>
  );
};

ProfileHeader.propTypes = {
  overlord: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    avatar: PropTypes.string,
    breed: PropTypes.string,
    slave_name: PropTypes.string,
    bio: PropTypes.string,
    whiskered_by_count: PropTypes.number,
    whiskering_count: PropTypes.number,
  }).isRequired,
  actions: PropTypes.node,
  onWhisker: PropTypes.func,
  onUnwhisker: PropTypes.func,
};

export default ProfileHeader;
