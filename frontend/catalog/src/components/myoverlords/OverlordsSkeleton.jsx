// src/components/myoverlords/OverlordsSkeleton.jsx
import { Box, Card, CardContent, Skeleton, Typography } from "@mui/joy";

const OverlordsSkeleton = () => {
  const fakeCards = Array.from({ length: 4 });

  return (
    <Box sx={{ width: "100%", mt: 4 }}>
      <Typography
        level="h5"
        mb={2}
        sx={{
          fontWeight: "bold",
          fontSize: { xs: "1.5rem", md: "1.8rem" },
        }}
      >
        My Overlords
      </Typography>

      <Box sx={{ display: "flex", gap: 2, overflowX: "auto", pb: 2 }}>
        {fakeCards.map((_, i) => (
          <Card
            key={i}
            sx={{
              width: 240,
              flexShrink: 0,
            }}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <Skeleton
                variant="circular"
                width={80}
                height={80}
                sx={{ mx: "auto", mb: 1 }}
              />
              <Skeleton height={20} width="60%" sx={{ mx: "auto", mb: 1 }} />
              <Skeleton height={24} width={40} sx={{ mx: "auto" }} />
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default OverlordsSkeleton;
