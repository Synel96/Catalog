import { Box } from "@mui/joy";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import SnackbarMessage from "../components/snackbar/SnackbarMessage";
import MySlaveSection from "../components/myslave/MySlaveSection";
import MyOverlordsSection from "../components/myoverlords/MyOverlordsSection"; // ⬅️ Frissített import

const MySlave = () => {
  const location = useLocation();
  const [showSnackbar, setShowSnackbar] = useState(false);

  useEffect(() => {
    if (location.state?.fromLogin) {
      setShowSnackbar(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: {
            xs: "column",
            md: "row",
          },
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 4,
          px: { xs: 2, md: 6 },
          py: 4,
        }}
      >
        {/* Left side: Slave profile */}
        <Box sx={{ width: { xs: "100%", md: 400 }, flexShrink: 0 }}>
          <MySlaveSection />
        </Box>

        {/* Right side: Overlords carousel with skeleton */}
        <Box sx={{ flex: 1 }}>
          <MyOverlordsSection /> {/* ⬅️ Itt használjuk az új komponenst */}
        </Box>
      </Box>

      <SnackbarMessage
        open={showSnackbar}
        onClose={() => setShowSnackbar(false)}
        message="Login successful!"
      />
    </>
  );
};

export default MySlave;
