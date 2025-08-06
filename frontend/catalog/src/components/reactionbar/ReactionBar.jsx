import React from "react";
import { Box, Button } from "@mui/joy";
import Purrfect from "../../assets/reactions/purrfect.png";
import Hiss from "../../assets/reactions/hiss.png";
import Ekekek from "../../assets/reactions/ekekek.png";
import Overnap from "../../assets/reactions/overnap.png";

const iconWidth = 96;
const iconHeight = 63;

const ReactionBar = ({ postId }) => {
  const buttons = [
    { src: Purrfect, alt: "purrfect" },
    { src: Hiss, alt: "hiss" },
    { src: Ekekek, alt: "ekekekek" },
    { src: Overnap, alt: "overnap" },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        mt: 1,
        overflowX: "auto", // görgethető vízszintesen
        flexWrap: "nowrap", // egy sorban marad
        pb: 1, // alsó padding, nehogy levágja
      }}
    >
      {buttons.map(({ src, alt }) => (
        <Button
          key={alt}
          variant="soft"
          size="sm"
          sx={{
            px: 1.5,
            py: 1,
            minWidth: iconWidth + 16,
            height: iconHeight + 16,
            borderRadius: "md",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "0 0 auto", // ne zsugorodjon, fix méret
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
      ))}
    </Box>
  );
};

export default ReactionBar;
