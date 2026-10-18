import React, { useEffect } from "react";
import { Box, Button, Typography } from "@mui/joy";
import Purrfect from "../../assets/reactions/purrfect.png";
import Hiss from "../../assets/reactions/hiss.png";
import Ekekek from "../../assets/reactions/ekekek.png";
import Overnap from "../../assets/reactions/overnap.png";
import { useReactionStore } from "../../store/useReactionStore";
import "./ReactionBar.css";

const iconWidth = 96;
const iconHeight = 63;

const ReactionBar = ({ postId, overlordId }) => {
  const { reactions, fetchReactions, react } = useReactionStore();
  const reactionSummary = reactions[postId] || {};

  useEffect(() => {
    fetchReactions(postId);
  }, [postId, fetchReactions]);

  const buttons = [
    { src: Purrfect, alt: "purrfect" },
    { src: Hiss, alt: "hisss" },
    { src: Ekekek, alt: "ekekekek" },
    { src: Overnap, alt: "nap" },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        mt: 1,
        overflowX: "auto",
        flexWrap: "nowrap",
        pb: 1,
      }}
    >
      {buttons.map(({ src, alt }) => {
        const count = reactionSummary[alt] || 0;

        return (
          <Box key={alt} sx={{ position: "relative" }}>
            <Button
              variant="soft"
              size="sm"
              className={`reaction-btn ${alt}`}
              onClick={() => {
                console.log("🐾 Clicking reaction:", alt);
                react(postId, overlordId, alt);
              }}
              sx={{
                px: 1.5,
                py: 1,
                minWidth: iconWidth + 16,
                height: iconHeight + 16,
                borderRadius: "md",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: "0 0 auto",
                position: "relative",
                overflow: "visible",
              }}
            >
              <img
                src={src}
                alt={alt}
                style={{
                  width: iconWidth,
                  height: iconHeight,
                  objectFit: "contain",
                }}
              />
            </Button>

            {count > 0 && (
              <Typography
                level="body-xs"
                sx={{
                  position: "absolute",
                  top: 0,
                  right: 4,
                  backgroundColor: "primary.solidBg",
                  color: "white",
                  borderRadius: "xl",
                  px: 0.8,
                  py: 0.1,
                  fontSize: "10px",
                  fontWeight: "bold",
                  lineHeight: 1.2,
                  minWidth: 18,
                  textAlign: "center",
                }}
              >
                {count}
              </Typography>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default ReactionBar;
