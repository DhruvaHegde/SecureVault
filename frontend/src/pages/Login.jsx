import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login({ onLoginSuccess }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      console.log("LOGIN RESPONSE:", response);
      console.log("TOKEN:", response.data);

      localStorage.setItem("token", response.data);

      console.log(
        "Saved Token:",
        localStorage.getItem("token")
      );

      onLoginSuccess();

      navigate("/dashboard");

    } catch (err) {
      console.log("LOGIN ERROR:", err);

      if (err.response) {
        console.log("Status:", err.response.status);
        console.log("Data:", err.response.data);

        setError(err.response.data);
      } else {
        setError("Unable to connect to server.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-950">
      <div className="max-w-lg w-full bg-slate-900 rounded-3xl p-10 border border-slate-700 shadow-2xl">

        <div className="text-center mb-8">
          <p className="text-cyan-400 uppercase tracking-[0.3em] text-sm font-semibold mb-2">
            SecureVault
          </p>

          <h1 className="text-4xl font-bold text-white">
            Sign in to your vault
          </h1>

          <p className="text-slate-400 mt-3">
            Access your passwords securely and keep sensitive credentials protected.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">

          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Email
            </label>

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-white"
            />
          </div>

          {error && (
            <p className="text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-xl"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

        </form>

      </div>
    </div>
  );
}

export default Login;