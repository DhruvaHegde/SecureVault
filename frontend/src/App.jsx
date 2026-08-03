import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddPassword from "./pages/AddPassword";

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

      <Route
        path="/"
        element={
          isAuthenticated
            ? <Navigate to="/dashboard" />
            : <Login onLoginSuccess={handleLoginSuccess} />
        }
      />

      <Route
        path="/dashboard"
        element={
          isAuthenticated
            ? <Dashboard onLogout={handleLogout} />
            : <Navigate to="/" />
        }
      />

      <Route
        path="/add"
        element={
          isAuthenticated
            ? <AddPassword />
            : <Navigate to="/" />
        }
      />

      <Route
        path="/edit/:id"
        element={
          isAuthenticated
            ? <AddPassword />
            : <Navigate to="/" />
        }
      />

    </Routes>
  );
}

export default App;