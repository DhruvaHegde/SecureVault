import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

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

      toast.success("Login successful!");

      onLoginSuccess();

      navigate("/dashboard");

    } catch (err) {
      console.log("LOGIN ERROR:", err);

      if (err.response) {
        console.log("Status:", err.response.status);
        console.log("Data:", err.response.data);

        setError(err.response.data);
        toast.error(
          typeof err.response.data === "string"
            ? err.response.data
            : "Login failed."
        );
      } else {
        setError("Unable to connect to server.");
        toast.error("Unable to connect to server.");
      }

    } finally {
      setLoading(false);
    }
  };

  // Google Login
  const handleGoogleLogin = () => {
    window.location.href =
      "http://localhost:8081/oauth2/authorization/google";
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-950">

      <div className="max-w-lg w-full bg-slate-900 rounded-3xl p-10 border border-slate-700 shadow-2xl">

        {/* Header */}
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


        {/* Email / Password Login */}
        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >

          {/* Email */}
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
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-white outline-none focus:border-cyan-400"
            />

          </div>


          {/* Password */}
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
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-white outline-none focus:border-cyan-400"
            />

          </div>


          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm">
              {error}
            </p>
          )}


          {/* Sign In */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-xl transition disabled:opacity-60"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

        </form>


        {/* Divider */}
        <div className="flex items-center gap-4 my-7">

          <div className="flex-1 h-px bg-slate-700"></div>

          <span className="text-slate-500 text-sm">
            OR
          </span>

          <div className="flex-1 h-px bg-slate-700"></div>

        </div>


        {/* Google Login */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-semibold py-3 rounded-xl transition"
        >

          {/* Google Logo */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
          >
            <path
              fill="#4285F4"
              d="M21.35 12.23c0-.79-.07-1.55-.2-2.28H12v4.32h5.23a4.47 4.47 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.92-4.18 2.92-7.43z"
            />

            <path
              fill="#34A853"
              d="M12 21.5c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.5z"
            />

            <path
              fill="#FBBC05"
              d="M6.54 13.58a5.86 5.86 0 0 1 0-3.76V7.29H3.3a9.75 9.75 0 0 0 0 8.82l3.24-2.53z"
            />

            <path
              fill="#EA4335"
              d="M12 5.79c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.83 2.85 14.63 2 12 2a9.74 9.74 0 0 0-8.7 5.29l3.24 2.53C7.31 7.51 9.46 5.79 12 5.79z"
            />
          </svg>

          Continue with Google

        </button>


        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-6">
          Your Google account is used only for authentication.
        </p>

      </div>

    </div>
  );
}

export default Login;