import { Box } from "@mui/joy";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import SnackbarMessage from "../components/snackbar/SnackbarMessage";
import MySlaveSection from "../components/myslave/MySlaveSection";

const MySlave = () => {
  const location = useLocation();
  const [showSnackbar, setShowSnackbar] = useState(false);

  useEffect(() => {
    if (location.state?.fromLogin) {
      setShowSnackbar(true);

      // ✅ töröljük a state-et, hogy frissítéskor ne jelenjen meg újra
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <>
      {/* Layout */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 4,
          px: { xs: 2, md: 6 },
          py: 4,
        }}
      >
        {/* Left side: Slave profile */}
        <Box sx={{ width: 400, flexShrink: 0 }}>
          <MySlaveSection />
        </Box>

        {/* Right side: Overlords carousel (coming soon) */}
        <Box sx={{ flex: 1 }}>{/* Placeholder for right side */}</Box>
      </Box>

      {/* ✅ Joy UI Snackbar */}
      <SnackbarMessage
        open={showSnackbar}
        onClose={() => setShowSnackbar(false)}
        message="Login successful!"
      />
    </>
  );
};

export default MySlave;
