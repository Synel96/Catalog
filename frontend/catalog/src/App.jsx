import React from "react";
import { CssBaseline, CssVarsProvider } from "@mui/joy";
import theme from "./theme";
import Navbar from "./components/navbar/Navbar";
import { HashRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/Login";
import Street from "./pages/Street";
import RegisterPage from "./pages/Register";
import MySlave from "./pages/MySlave";
import Overlord from "./pages/Overlord";

function App() {
  return (
    <CssVarsProvider theme={theme}>
      <CssBaseline />
      <HashRouter>
        <Navbar />

        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/my-slave" element={<MySlave />} />
          <Route path="/street" element={<Street />} />
          <Route path="/overlords/:id" element={<Overlord />} />
        </Routes>
      </HashRouter>
    </CssVarsProvider>
  );
}

export default App;
