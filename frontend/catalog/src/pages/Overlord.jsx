// src/pages/Overlord.jsx
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
import ProfileHeader from "../components/overlord/ProfileHeader"; // ha máshol van, igazítsd az importot

const API_URL = import.meta.env.VITE_API_URL;

const Overlord = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [overlord, setOverlord] = useState(null);
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingOverlord, setLoadingOverlord] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState(null);

  // Jelenlegi user lekérése
  useEffect(() => {
    setLoadingUser(true);
    fetch(`${API_URL}/profiles/me/`, {
      credentials: "include",
      headers: { Accept: "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Nem sikerült a felhasználó lekérése");
        return res.json();
      })
      .then((data) => setCurrentUser(data))
      .catch(() => {
        // ha nem sikerül, akkor nem vagy bejelentkezve vagy más baj van
      })
      .finally(() => setLoadingUser(false));
  }, []);

  // Overlord adatok lekérése
  useEffect(() => {
    if (!id) return;
    setLoadingOverlord(true);
    fetch(`${API_URL}/profiles/overlords/${id}/`, {
      credentials: "include",
      headers: { Accept: "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Hiba: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setOverlord(data);
        document.title = `Overlord • ${data.name}`;
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoadingOverlord(false));
  }, [id]);

  // Kapcsolódó posztok lekérése
  useEffect(() => {
    if (!overlord) return;
    setLoadingPosts(true);
    fetch(`${API_URL}/profiles/overlords/${id}/posts/`, {
      credentials: "include",
      headers: { Accept: "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Nem lehet lekérni a posztokat");
        return res.json();
      })
      .then((data) => setPosts(data))
      .catch(() => {
        // nem kritikus
      })
      .finally(() => setLoadingPosts(false));
  }, [overlord, id]);

  const isOwnOverlord =
    currentUser && overlord && overlord.slave === currentUser.id;

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
          Overlord nem található
        </Typography>
        <Typography level="body-md" sx={{ mb: 3 }}>
          {error}
        </Typography>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          Vissza
        </Button>
      </Container>
    );
  }

  if (!overlord) return null;

  return (
    <Sheet
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f9f9fa",
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Oldal címe + visszagomb */}
        <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
          <Typography level="h2" sx={{ flexGrow: 1 }}>
            Overlord
          </Typography>
          <Button size="sm" variant="outlined" onClick={() => navigate(-1)}>
            Vissza
          </Button>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Profil fejléc */}
        <Box sx={{ mb: 4 }}>
          <ProfileHeader
            overlord={overlord}
            actions={
              isOwnOverlord ? (
                <Button
                  variant="outlined"
                  size="sm"
                  onClick={() => navigate(`/overlords/${id}/edit`)}
                >
                  Szerkesztés
                </Button>
              ) : null
            }
          />
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Posztok listája */}
        <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <Typography level="h4">Posztok</Typography>
          {loadingPosts && <CircularProgress size="sm" />}
        </Box>

        <Box>
          {loadingPosts ? (
            <Typography level="body-sm">Betöltés...</Typography>
          ) : posts.length === 0 ? (
            <Typography level="body-sm">Nincsenek posztok.</Typography>
          ) : (
            <Typography level="body-md">
              {posts.length} poszt betöltve (itt lesz a lista)
            </Typography>
          )}
        </Box>
      </Container>
    </Sheet>
  );
};

export default Overlord;
