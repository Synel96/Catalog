import { Card, CardContent, Box, Skeleton, Typography } from "@mui/joy";

const SlaveProfileSkeleton = () => {
  return (
    <Card sx={{ maxWidth: 400, mx: "auto", mt: 4, p: 2 }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Skeleton variant="circular" width={64} height={64} />
          <Box>
            <Skeleton width={120} height={20} />
            <Skeleton width={180} height={16} sx={{ mt: 0.5 }} />
          </Box>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography level="body-sm" textColor="neutral.500" mb={0.5}>
            Bio
          </Typography>
          <Skeleton width="100%" height={18} />
          <Skeleton width="80%" height={18} sx={{ mt: 0.5 }} />
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography level="body-sm" textColor="neutral.500" mb={0.5}>
            Joined
          </Typography>
          <Skeleton width="50%" height={16} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default SlaveProfileSkeleton;
