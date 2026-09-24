import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import api from "../services/api";

function AddPassword() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    websiteName: "",
    websiteUrl: "",
    username: "",
    password: "",
    category: "",
    notes: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [passwordLength, setPasswordLength] = useState(16);

  useEffect(() => {
    if (id) {
      fetchPassword();
    }
  }, [id]);

  const fetchPassword = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get(`/passwords/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFormData({
        websiteName: response.data.websiteName || "",
        websiteUrl: response.data.websiteUrl || "",
        username: response.data.username || "",
        password: response.data.password || "",
        category: response.data.category || "",
        notes: response.data.notes || "",
      });
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("Unable to load password.");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const generatePassword = async () => {
    try {
      setGenerating(true);

      const token = localStorage.getItem("token");

      const response = await api.get(
        `/passwords/generate?length=${passwordLength}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const generatedPassword =
        typeof response.data === "string"
          ? response.data
          : response.data.password;

      setFormData((current) => ({
        ...current,
        password: generatedPassword,
      }));

      setShowPassword(true);

      toast.success("Strong password generated!");
    } catch (error) {
      console.error("Generate Password Error:", error);

      toast.error(
        error.response?.data || "Unable to generate password."
      );
    } finally {
      setGenerating(false);
    }
  };

  const copyGeneratedPassword = async () => {
    if (!formData.password) {
      toast.error("Generate a password first.");
      return;
    }

    try {
      await navigator.clipboard.writeText(formData.password);
      toast.success("Password copied!");
    } catch (error) {
      console.error(error);
      toast.error("Unable to copy password.");
    }
  };

  const getStrength = () => {
    const password = formData.password;

    if (!password) {
      return {
        label: "No password",
        width: "0%",
        className: "bg-slate-600",
      };
    }

    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*()_+=<>?{}\[\]-]/.test(password)) score++;

    if (score <= 2) {
      return {
        label: "Weak",
        width: "33%",
        className: "bg-rose-500",
      };
    }

    if (score <= 4) {
      return {
        label: "Medium",
        width: "66%",
        className: "bg-amber-500",
      };
    }

    return {
      label: "Strong",
      width: "100%",
      className: "bg-emerald-500",
    };
  };

  const strength = getStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      if (id) {
        await api.put(`/passwords/${id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        toast.success("Password updated successfully!");
      } else {
        await api.post("/passwords/add", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        toast.success("Password saved successfully!");
      }

      navigate("/dashboard");
    } catch (error) {
      console.error(error);

      if (error.response) {
        toast.error(
          typeof error.response.data === "string"
            ? error.response.data
            : "Unable to save password."
        );
      } else {
        toast.error("Something went wrong.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>

          <div className="flex items-center gap-2 text-cyan-400">
            <ShieldCheck size={22} />
            <span className="font-semibold">SecureVault</span>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">

          <div className="mb-8">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400">
                <KeyRound size={24} />
              </div>

              <div>
                <h1 className="text-2xl font-bold">
                  {id ? "Edit Password" : "Add New Password"}
                </h1>

                <p className="text-sm text-slate-400">
                  {id
                    ? "Update your stored credentials."
                    : "Securely store your website credentials."}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Website */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Website Name
              </label>

              <input
                type="text"
                name="websiteName"
                placeholder="Example: GitHub"
                value={formData.websiteName}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500"
                required
              />
            </div>

            {/* URL */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Website URL
              </label>

              <input
                type="text"
                name="websiteUrl"
                placeholder="https://github.com"
                value={formData.websiteUrl}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500"
              />
            </div>

            {/* Username */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Username / Email
              </label>

              <input
                type="text"
                name="username"
                placeholder="your@email.com"
                value={formData.username}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Password
              </label>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 pr-12 font-mono text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={copyGeneratedPassword}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400"
                  title="Copy password"
                >
                  <Copy size={19} />
                </button>
              </div>

              {/* Strength */}
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-slate-400">
                    Password Strength
                  </span>

                  <span className="font-semibold text-slate-300">
                    {strength.label}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full transition-all ${strength.className}`}
                    style={{ width: strength.width }}
                  />
                </div>
              </div>
            </div>

            {/* Generator */}
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">

              <div className="mb-4 flex items-center gap-2">
                <RefreshCw size={18} className="text-cyan-400" />

                <h2 className="font-semibold text-white">
                  Password Generator
                </h2>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">

                <div className="flex-1">
                  <label className="mb-2 block text-sm text-slate-400">
                    Password Length
                  </label>

                  <input
                    type="range"
                    min="8"
                    max="32"
                    value={passwordLength}
                    onChange={(e) =>
                      setPasswordLength(Number(e.target.value))
                    }
                    className="w-full accent-cyan-500"
                  />

                  <div className="mt-1 flex justify-between text-xs text-slate-500">
                    <span>8</span>
                    <span className="font-semibold text-cyan-400">
                      {passwordLength}
                    </span>
                    <span>32</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={generatePassword}
                  disabled={generating}
                  className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw
                    size={18}
                    className={generating ? "animate-spin" : ""}
                  />

                  {generating ? "Generating..." : "Generate"}
                </button>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Category
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
              >
                <option value="">Select Category</option>
                <option value="Social">Social</option>
                <option value="Work">Work</option>
                <option value="Banking">Banking</option>
                <option value="Shopping">Shopping</option>
                <option value="Education">Education</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Notes
              </label>

              <textarea
                name="notes"
                placeholder="Optional notes..."
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3 pt-4 sm:flex-row">

              <button
                type="submit"
                className="flex-1 rounded-xl bg-cyan-500 py-3 font-bold text-slate-950 transition hover:bg-cyan-400"
              >
                {id ? "Update Password" : "Save Password"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                Cancel
              </button>

            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default AddPassword;