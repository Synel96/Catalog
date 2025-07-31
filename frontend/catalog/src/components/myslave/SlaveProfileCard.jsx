import { Card, CardContent, Avatar, Box, Typography, Button } from "@mui/joy";

const SlaveProfileCard = ({ user }) => {
  return (
    <Card sx={{ maxWidth: 400, mx: "auto", mt: 4, p: 2 }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            src={user?.avatar}
            alt={user?.username}
            sx={{ width: 64, height: 64 }}
          />
          <Box>
            <Typography level="title-md">{user?.username}</Typography>
            <Typography level="body-sm" textColor="neutral.500">
              {user?.email}
            </Typography>
          </Box>
        </Box>

        {user?.bio && (
          <Box sx={{ mt: 2 }}>
            <Typography level="body-sm" textColor="neutral.500" mb={0.5}>
              Bio
            </Typography>
            <Typography>{user.bio}</Typography>
          </Box>
        )}

        <Box sx={{ mt: 2 }}>
          <Typography level="body-sm" textColor="neutral.500" mb={0.5}>
            Joined
          </Typography>
          <Typography>
            {new Date(user.date_joined).toLocaleDateString()}
          </Typography>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Button variant="outlined" fullWidth>
            Edit Profile
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SlaveProfileCard;
