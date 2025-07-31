import { Box } from "@mui/joy";
import MySlaveSection from "../components/myslave/MySlaveSection";

const MySlave = () => {
  return (
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
      {/* Bal oldal: Slave profil */}
      <Box sx={{ width: 400, flexShrink: 0 }}>
        <MySlaveSection />
      </Box>

      {/* Jobb oldal: ide jön majd a MyOverlordsCarousel */}
      <Box sx={{ flex: 1 }}>{/* Placeholder jobb oldalra */}</Box>
    </Box>
  );
};

export default MySlave;
