import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddPassword from "./pages/AddPassword";
import OAuth2Callback from "./pages/OAuth2Callback";

import "./App.css";

function App() {

  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("token"))
  );

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  return (
    <Routes>

      {/* =========================
          HOME / LOGIN
      ========================== */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login onLoginSuccess={handleLoginSuccess} />
          )
        }
      />

      {/* =========================
          LOGIN
          Supports /login as well
      ========================== */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login onLoginSuccess={handleLoginSuccess} />
          )
        }
      />

      {/* =========================
          GOOGLE OAUTH CALLBACK
      ========================== */}
      <Route
        path="/oauth2/callback"
        element={
          <OAuth2Callback
            onLoginSuccess={handleLoginSuccess}
          />
        }
      />

      {/* =========================
          DASHBOARD
      ========================== */}
      <Route
        path="/dashboard"
        element={
          isAuthenticated ? (
            <Dashboard onLogout={handleLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* =========================
          ADD PASSWORD
      ========================== */}
      <Route
        path="/add"
        element={
          isAuthenticated ? (
            <AddPassword />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* =========================
          EDIT PASSWORD
      ========================== */}
      <Route
        path="/edit/:id"
        element={
          isAuthenticated ? (
            <AddPassword />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* =========================
          UNKNOWN URL
      ========================== */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}

export default App;