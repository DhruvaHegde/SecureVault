import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function OAuth2Callback({ onLoginSuccess }) {
  const navigate = useNavigate();

  const [message, setMessage] = useState(
    "Completing Google login..."
  );

  // Prevent OAuth code from being exchanged more than once
  const hasExchangedCode = useRef(false);

  useEffect(() => {
    if (hasExchangedCode.current) {
      return;
    }

    hasExchangedCode.current = true;

    const exchangeCode = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (!code) {
        setMessage("Invalid Google login request.");
        toast.error("Google login failed.");
        return;
      }

      try {
        setMessage("Verifying Google account...");

        const response = await fetch(
          "http://localhost:8081/api/auth/oauth2/exchange",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              code: code,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok || !data.token) {
          throw new Error(
            data.message || "Google login failed."
          );
        }

        // Save JWT
        localStorage.setItem("token", data.token);

        toast.success("Google login successful!");

        if (onLoginSuccess) {
          onLoginSuccess();
        }

        // Remove code from browser URL
        window.history.replaceState(
          {},
          document.title,
          "/oauth2/callback"
        );

        // Go to dashboard
        navigate("/dashboard", {
          replace: true,
        });

      } catch (error) {
        console.error(
          "Google OAuth exchange failed:",
          error
        );

        setMessage(
          error.message ||
          "Unable to complete Google login."
        );

        toast.error(
          error.message ||
          "Google login failed."
        );
      }
    };

    exchangeCode();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="text-center">
        <div className="text-cyan-400 text-xl font-semibold">
          {message}
        </div>

        <p className="text-slate-400 mt-2">
          Please wait while SecureVault completes
          your Google login.
        </p>
      </div>
    </div>
  );
}

export default OAuth2Callback;