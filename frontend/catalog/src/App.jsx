import React from "react";
import { CssBaseline, CssVarsProvider } from "@mui/joy";
import theme from "./theme";
import Navbar from "./components/navbar/Navbar";
import { HashRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/Login";
import Welcome from "./components/login/Welcome";
import RegisterPage from "./pages/Register";

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
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </HashRouter>
    </CssVarsProvider>
  );
}

export default App;
