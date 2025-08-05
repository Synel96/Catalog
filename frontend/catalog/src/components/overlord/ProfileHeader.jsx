// src/components/overlord/ProfileHeader.jsx
import React from "react";
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
import { useStreetStore } from "../../store/useStreetStore"; // ✅ új import

const API_URL = import.meta.env.VITE_API_URL;
const PLACEHOLDER_OVERLORD = "/media/placeholders/overlord_placeholder.png";

/** Avatar fallback */
const AvatarWithFallback = ({ src, alt, size = 100, ...rest }) => {
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
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        border: "2px solid",
        borderColor: "divider",
      }}
      {...rest}
    />
  );
};

AvatarWithFallback.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  size: PropTypes.number,
};

/**
 * ProfileHeader
 */
const ProfileHeader = ({
  overlord,
  actions = null,
  currentOverlordId = null,
  isWhiskered = false,
  onToggleWhisker = null,
}) => {
  if (!overlord) return null;

  const theme = useTheme();
  const whiskeredByCount = overlord.whiskered_by_count ?? 0;
  const whiskeringCount = overlord.whiskering_count ?? 0;

  const isSelf = currentOverlordId && overlord.id === currentOverlordId;

  // ✅ Street overlord ellenőrzés
  const streetOverlord = useStreetStore((state) => state.selectedOverlord);
  const isStreetOverlord = streetOverlord && overlord.id === streetOverlord.id;

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
            {/* ✅ Gomb csak ha nem self és nem street overlord */}
            {!isSelf && !isStreetOverlord && (
              <Tooltip
                title={isWhiskered ? "Whisker eltávolítása" : "Whiskerelés"}
              >
                <span>
                  <Button
                    size="sm"
                    variant={isWhiskered ? "solid" : "soft"}
                    color={isWhiskered ? "danger" : "primary"}
                    onClick={() => {
                      if (onToggleWhisker) {
                        onToggleWhisker(overlord);
                      }
                    }}
                    startDecorator={
                      <Box
                        component="img"
                        src={whiskerIcon}
                        alt="Whisker"
                        sx={{
                          width: 18,
                          height: 18,
                          filter: isWhiskered
                            ? "none"
                            : "grayscale(40%) contrast(1)",
                        }}
                      />
                    }
                    sx={{
                      whiteSpace: "nowrap",
                      fontWeight: "md",
                      px: 1.5,
                      py: 0.75,
                      display: {
                        xs: "inline-flex",
                        sm: "inline-flex",
                      },
                      position: "relative",
                      animation: !isWhiskered ? "pulse 2s infinite" : "none",
                      "@keyframes pulse": {
                        "0%": {
                          boxShadow: `0 0 0 0 rgba(0,123,255,0.4)`,
                        },
                        "70%": {
                          boxShadow: `0 0 0 8px rgba(0,123,255,0)`,
                        },
                        "100%": {
                          boxShadow: `0 0 0 0 rgba(0,123,255,0)`,
                        },
                      },
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        ml: 0.5,
                        display: { xs: "none", sm: "inline" },
                      }}
                    >
                      {isWhiskered ? "Unwhisker" : "Whisker"}
                    </Box>
                  </Button>
                </span>
              </Tooltip>
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
            <strong>Whiskered by:</strong> {whiskeredByCount}
          </Typography>
          <Typography level="body-md">
            <strong>Whiskering:</strong> {whiskeringCount}
          </Typography>
        </Stack>

        {overlord.bio && (
          <Typography level="body-md" sx={{ whiteSpace: "pre-line" }}>
            {overlord.bio}
          </Typography>
        )}
      </Box>
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
  currentOverlordId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isWhiskered: PropTypes.bool,
  onToggleWhisker: PropTypes.func,
};

export default ProfileHeader;
