import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Sheet,
  Container,
  Typography,
  Button,
  CircularProgress,
  Divider,
} from "@mui/joy";
import ProfileHeader from "../components/overlord/ProfileHeader";
import { useStreetStore } from "../store/useStreetStore";
import { useWhiskerStore } from "../store/useWhiskerStore";
import {
  createWhisker,
  deleteWhisker,
} from "../services/overlords/whiskersService";
import { getOverlordById } from "../services/overlords/overlordsService";
import OverlordPostFeed from "../components/overlord/OverlordPostFeed";
import StreetPostFeed from "../components/street/StreetPostFeed";
import OverlordStreetPostForm from "../components/overlord/OverlordStreetPostForm";

const API_URL = import.meta.env.VITE_API_URL;

const Overlord = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [overlord, setOverlord] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingOverlord, setLoadingOverlord] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState(null);

  const streetOverlord = useStreetStore((state) => state.selectedOverlord);
  const { isWhiskered, fetchWhiskerStatus } = useWhiskerStore();

  const currentOverlordId = streetOverlord?.id || null;

  useEffect(() => {
    setLoadingUser(true);
    fetch(`${API_URL}/profiles/me/`, {
      credentials: "include",
      headers: { Accept: "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user");
        return res.json();
      })
      .then((data) => setCurrentUser(data))
      .catch(() => {})
      .finally(() => setLoadingUser(false));
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoadingOverlord(true);
    fetch(`${API_URL}/profiles/overlords/${id}/`, {
      credentials: "include",
      headers: { Accept: "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setOverlord(data);
        document.title = `Overlord • ${data.name}`;
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoadingOverlord(false));
  }, [id]);

  useEffect(() => {
    if (overlord && currentOverlordId && overlord.id !== currentOverlordId) {
      fetchWhiskerStatus(currentOverlordId, overlord.id);
    }
  }, [overlord, currentOverlordId, fetchWhiskerStatus]);

  const isOwnOverlord =
    currentUser &&
    overlord &&
    overlord.slave === currentUser.id &&
    overlord.id === currentOverlordId;

  const handleWhisker = async () => {
    try {
      await createWhisker(currentOverlordId, overlord.id);
      const updated = await getOverlordById(overlord.id);
      setOverlord(updated);
      fetchWhiskerStatus(currentOverlordId, overlord.id);
    } catch (err) {
      console.error("Whisker failed", err);
    }
  };

  const handleUnwhisker = async () => {
    try {
      await deleteWhisker(currentOverlordId, overlord.id);
      const updated = await getOverlordById(overlord.id);
      setOverlord(updated);
      fetchWhiskerStatus(currentOverlordId, overlord.id);
    } catch (err) {
      console.error("Unwhisker failed", err);
    }
  };

  if (loadingOverlord || loadingUser) {
    return (
      <Box sx={{ p: 6, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography level="h4" sx={{ mb: 2 }} color="danger">
          Overlord not found
        </Typography>
        <Typography level="body-md" sx={{ mb: 3 }}>
          {error}
        </Typography>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          Back
        </Button>
      </Container>
    );
  }

  if (!overlord) return null;

  return (
    <Sheet sx={{ minHeight: "100vh", backgroundColor: "#f9f9fa", py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
          <Typography level="h2" sx={{ flexGrow: 1 }}>
            Overlord
          </Typography>
          <Button size="sm" variant="outlined" onClick={() => navigate(-1)}>
            Back
          </Button>
        </Box>

        <Divider sx={{ mb: 4 }} />

        <Box sx={{ mb: 4 }}>
          <ProfileHeader
            overlord={overlord}
            currentOverlordId={currentOverlordId}
            showWhiskerButtons={overlord.id !== currentOverlordId}
            onWhisker={handleWhisker}
            onUnwhisker={handleUnwhisker}
            actions={
              isOwnOverlord ? (
                <Button
                  variant="outlined"
                  size="sm"
                  onClick={() => navigate(`/overlords/${id}/edit`)}
                >
                  Edit
                </Button>
              ) : null
            }
          />
        </Box>

        {isOwnOverlord && (
          <>
            <OverlordStreetPostForm overlord={overlord} />
            <Divider sx={{ my: 4 }} />
            <Typography level="h4" sx={{ mb: 2 }}>
              Posts on the Street
            </Typography>
            <StreetPostFeed />
            <Divider sx={{ my: 4 }} />
          </>
        )}

        <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <Typography level="h4">Posts</Typography>
        </Box>

        <OverlordPostFeed overlordId={parseInt(id)} />
      </Container>
    </Sheet>
  );
};

export default Overlord;
