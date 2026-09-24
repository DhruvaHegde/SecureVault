import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function OAuth2Callback({ onLoginSuccess }) {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    // Only process the callback if a token exists
    if (!token) {
      return;
    }

    // Save JWT
    localStorage.setItem("token", token);

    console.log("Google login successful");
    console.log(
      "Token saved:",
      Boolean(localStorage.getItem("token"))
    );

    toast.success("Google login successful!");

    // Update authentication state
    if (onLoginSuccess) {
      onLoginSuccess();
    }

    // Remove token from URL
    window.history.replaceState(
      {},
      document.title,
      "/oauth2/callback"
    );

    // Go to dashboard
    navigate("/dashboard", {
      replace: true,
    });

    // Run this callback only once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="text-center">

        <div className="text-cyan-400 text-xl font-semibold">
          Signing you in...
        </div>

        <p className="text-slate-400 mt-2">
          Please wait while SecureVault completes Google login.
        </p>

      </div>
    </div>
  );
}

export default OAuth2Callback;