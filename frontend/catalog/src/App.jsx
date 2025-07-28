import React from "react";
import { CssBaseline, CssVarsProvider } from "@mui/joy";
import theme from "./theme";
import Navbar from "./components/navbar/Navbar";
import { HashRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/Login";
import Welcome from "./components/login/Welcome";

function App() {
  return (
    <CssVarsProvider theme={theme}>
      <CssBaseline />
      <HashRouter>
        {/* Navigációs sáv */}
        <Navbar />

        {/* Alkalmazáson belüli routok */}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Welcome />} />
          {/* A Register oldalra mutató útvonal csak akkor kerüljön ide,
              ha már elkészítetted a Register komponenst */}
        </Routes>
      </HashRouter>
    </CssVarsProvider>
  );
}

export default App;
