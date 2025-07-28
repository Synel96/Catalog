import React, { useState, useEffect } from "react";
import { Box, Typography, IconButton } from "@mui/joy";

// Public mappából közvetlenül hivatkozott képek URL-jei
const slides = [
  "/catalog.png",
  "/slide1.png",
  "/slide2.png",
  "/slide3.png",
  "/slide4.png",
  "/slide5.png",
];

const Welcome = () => {
  const [current, setCurrent] = useState(0);
  const length = slides.length;

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev === length - 1 ? 0 : prev + 1));
  };

  // Autoplay effect: 5 másodpercenként vált
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [length]);

  if (!Array.isArray(slides) || length === 0) return null;

  return (
    <Box sx={{ textAlign: "center", p: 4 }}>
      <Typography level="h2" sx={{ mb: 2 }}>
        Have a mice day!
      </Typography>

      <Box
        sx={{
          position: "relative",
          maxWidth: 600,
          mx: "auto",
          boxShadow: "md",
          borderRadius: "md",
        }}
      >
        <IconButton
          onClick={prevSlide}
          sx={{
            position: "absolute",
            top: "50%",
            left: 0,
            transform: "translateY(-50%)",
            backgroundColor: "background.surface",
            opacity: 0.75,
          }}
        >
          ‹
        </IconButton>

        <Box
          component="img"
          src={slides[current]}
          alt={`Slide ${current + 1}`}
          sx={{
            width: "100%",
            display: "block",
            borderRadius: "md",
          }}
        />

        <IconButton
          onClick={nextSlide}
          sx={{
            position: "absolute",
            top: "50%",
            right: 0,
            transform: "translateY(-50%)",
            backgroundColor: "background.surface",
            opacity: 0.75,
          }}
        >
          ›
        </IconButton>
      </Box>
    </Box>
  );
};

export default Welcome;
