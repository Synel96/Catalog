// src/theme.js
import { extendTheme } from "@mui/joy/styles";

const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          solidBg: "#ffb3b3",
          solidHoverBg: "#ff9999",
          solidActiveBg: "#ff8080",
          softColor: "#5c2a2a",
          softBg: "#ffe6e6",
          softHoverBg: "#ffcccc",
          softActiveBg: "#ffb3b3",
        },
        neutral: {
          plainColor: "#333",
        },
        background: {
          body: "#fff7f7",
          surface: "#ffffff",
          popup: "#fff0f0",
          level1: "#fff7f7",
        },
      },
    },
  },
  fontFamily: {
    display: "'Comfortaa', sans-serif",
    body: "'Inter', sans-serif",
  },
  shadow: {
    sm: "0 1px 2px rgba(0,0,0,0.1)",
    md: "0 4px 8px rgba(0,0,0,0.1)",
  },
});

export default theme;
