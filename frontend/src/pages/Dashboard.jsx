import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Activity,
  Clock3,
  KeyRound,
  LockKeyhole,
  Plus,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  TrendingUp,
  LogOut,
} from "lucide-react";

import api from "../services/api";
import PasswordTable from "../components/PasswordTable";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function getPasswordStatus(lastUpdated) {
  if (!lastUpdated) {
    return "Unknown";
  }

  const updatedAt = new Date(lastUpdated).getTime();

  if (Number.isNaN(updatedAt)) {
    return "Unknown";
  }

  const daysSinceUpdate = Math.max(
    0,
    Math.floor((Date.now() - updatedAt) / DAY_IN_MS)
  );

  if (daysSinceUpdate <= 30) {
    return "Safe";
  }

  if (daysSinceUpdate <= 90) {
    return "Warning";
  }

  return "Expired";
}

function Dashboard({ onLogout }) {
  const navigate = useNavigate();

  const [passwords, setPasswords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    fetchPasswords();
  }, []);

  const fetchPasswords = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/passwords", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPasswords(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error(err);

      if (
        err.response?.status === 401 ||
        err.response?.status === 403
      ) {
        toast.error("Session expired. Please login again.");
        onLogout();
        return;
      }

      setError("Unable to fetch passwords.");
      toast.error("Unable to fetch passwords.");
    } finally {
      setLoading(false);
    }
  };

  // Search + Category Filter
  const filteredPasswords = passwords.filter((item) => {
    const websiteName = item.websiteName || "";
    const username = item.username || "";

    const matchesSearch =
      websiteName.toLowerCase().includes(search.toLowerCase()) ||
      username.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || item.category === category;

    return matchesSearch && matchesCategory;
  });

  // Security Analytics
  const analytics = useMemo(() => {
    const total = passwords.length;

    let safe = 0;
    let warning = 0;
    let expired = 0;
    let unknown = 0;

    passwords.forEach((item) => {
      const status = getPasswordStatus(item.lastUpdated);

      if (status === "Safe") safe++;
      else if (status === "Warning") warning++;
      else if (status === "Expired") expired++;
      else unknown++;
    });

    const recentlyUpdated = passwords.filter((item) => {
      if (!item.lastUpdated) return false;

      const updatedAt = new Date(item.lastUpdated).getTime();

      if (Number.isNaN(updatedAt)) return false;

      const daysSinceUpdate =
        (Date.now() - updatedAt) / DAY_IN_MS;

      return daysSinceUpdate <= 30;
    }).length;

    const healthPercentage =
      total === 0
        ? 0
        : Math.round((safe / total) * 100);

    const categoryCounts = {};

    passwords.forEach((item) => {
      const categoryName = item.category || "General";

      categoryCounts[categoryName] =
        (categoryCounts[categoryName] || 0) + 1;
    });

    return {
      total,
      safe,
      warning,
      expired,
      unknown,
      recentlyUpdated,
      healthPercentage,
      categoryCounts,
    };
  }, [passwords]);

  const categoryEntries = Object.entries(
    analytics.categoryCounts
  ).sort((a, b) => b[1] - a[1]);

  const handleLogout = () => {
    onLogout();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* HEADER */}
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400">
                <LockKeyhole size={26} />
              </div>

              <h1 className="text-4xl font-bold">
                SecureVault Dashboard
              </h1>
            </div>

            <p className="text-slate-400">
              Manage your passwords securely.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-3 font-semibold transition hover:bg-red-600"
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>

        {/* TOP STATS */}
        <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {/* Total */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400">
                <KeyRound size={22} />
              </div>

              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Vault
              </span>
            </div>

            <p className="text-sm text-slate-400">
              Total Passwords
            </p>

            <h2 className="mt-2 text-4xl font-bold text-cyan-400">
              {analytics.total}
            </h2>
          </div>

          {/* Safe */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
                <ShieldCheck size={22} />
              </div>

              <span className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
                Safe
              </span>
            </div>

            <p className="text-sm text-slate-400">
              Recently Updated
            </p>

            <h2 className="mt-2 text-4xl font-bold text-emerald-400">
              {analytics.safe}
            </h2>
          </div>

          {/* Warning */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-xl bg-amber-500/10 p-3 text-amber-400">
                <ShieldAlert size={22} />
              </div>

              <span className="text-xs font-semibold uppercase tracking-wide text-amber-400">
                Warning
              </span>
            </div>

            <p className="text-sm text-slate-400">
              Need Attention
            </p>

            <h2 className="mt-2 text-4xl font-bold text-amber-400">
              {analytics.warning}
            </h2>
          </div>

          {/* Expired */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-xl bg-rose-500/10 p-3 text-rose-400">
                <ShieldX size={22} />
              </div>

              <span className="text-xs font-semibold uppercase tracking-wide text-rose-400">
                Expired
              </span>
            </div>

            <p className="text-sm text-slate-400">
              Old Passwords
            </p>

            <h2 className="mt-2 text-4xl font-bold text-rose-400">
              {analytics.expired}
            </h2>
          </div>

        </div>

        {/* SECURITY ANALYTICS */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">

          {/* Password Health */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

            <div className="mb-6 flex items-center justify-between">

              <div>
                <div className="flex items-center gap-2">
                  <Activity
                    size={20}
                    className="text-cyan-400"
                  />

                  <h2 className="text-xl font-bold">
                    Password Health
                  </h2>
                </div>

                <p className="mt-1 text-sm text-slate-400">
                  Based on password update activity.
                </p>
              </div>

              <div className="text-right">
                <span className="text-3xl font-bold text-cyan-400">
                  {analytics.healthPercentage}%
                </span>
              </div>

            </div>

            {/* Progress Bar */}
            <div className="mb-6 h-4 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-cyan-500 transition-all duration-700"
                style={{
                  width: `${analytics.healthPercentage}%`,
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">

              <div className="rounded-2xl bg-slate-800/70 p-4">
                <div className="flex items-center gap-2 text-emerald-400">
                  <ShieldCheck size={17} />
                  <span className="text-sm font-medium">
                    Safe
                  </span>
                </div>

                <p className="mt-2 text-2xl font-bold">
                  {analytics.safe}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-800/70 p-4">
                <div className="flex items-center gap-2 text-amber-400">
                  <ShieldAlert size={17} />
                  <span className="text-sm font-medium">
                    Warning
                  </span>
                </div>

                <p className="mt-2 text-2xl font-bold">
                  {analytics.warning}
                </p>
              </div>

            </div>

          </div>

          {/* Activity */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-violet-500/10 p-3 text-violet-400">
                <TrendingUp size={22} />
              </div>

              <div>
                <h2 className="text-xl font-bold">
                  Security Activity
                </h2>

                <p className="text-sm text-slate-400">
                  Overview of your vault activity.
                </p>
              </div>
            </div>

            <div className="space-y-4">

              <div className="flex items-center justify-between rounded-2xl bg-slate-800/70 p-4">
                <div className="flex items-center gap-3">
                  <Clock3
                    size={20}
                    className="text-cyan-400"
                  />

                  <span className="text-slate-300">
                    Updated in last 30 days
                  </span>
                </div>

                <span className="text-xl font-bold text-white">
                  {analytics.recentlyUpdated}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-slate-800/70 p-4">
                <div className="flex items-center gap-3">
                  <ShieldAlert
                    size={20}
                    className="text-amber-400"
                  />

                  <span className="text-slate-300">
                    Passwords needing attention
                  </span>
                </div>

                <span className="text-xl font-bold text-amber-400">
                  {analytics.warning + analytics.expired}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-slate-800/70 p-4">
                <div className="flex items-center gap-3">
                  <KeyRound
                    size={20}
                    className="text-violet-400"
                  />

                  <span className="text-slate-300">
                    Uncategorized
                  </span>
                </div>

                <span className="text-xl font-bold text-white">
                  {analytics.categoryCounts.General || 0}
                </span>
              </div>

            </div>

          </div>

        </div>

        {/* CATEGORY OVERVIEW */}
        <div className="mb-8 rounded-3xl border border-slate-800 bg-slate-900 p-6">

          <div className="mb-6">
            <h2 className="text-2xl font-bold">
              Category Overview
            </h2>

            <p className="mt-1 text-slate-400">
              Distribution of passwords in your vault.
            </p>
          </div>

          {categoryEntries.length === 0 ? (

            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-8 text-center">
              <KeyRound
                size={30}
                className="mx-auto mb-3 text-slate-600"
              />

              <p className="text-slate-400">
                No password categories available yet.
              </p>
            </div>

          ) : (

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              {categoryEntries.map(([name, count]) => {

                const percentage =
                  analytics.total === 0
                    ? 0
                    : Math.round(
                        (count / analytics.total) * 100
                      );

                return (
                  <div
                    key={name}
                    className="rounded-2xl bg-slate-800/70 p-4"
                  >

                    <div className="mb-3 flex items-center justify-between">
                      <span className="font-medium text-slate-200">
                        {name}
                      </span>

                      <span className="font-bold text-cyan-400">
                        {count}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-700">
                      <div
                        className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                      {percentage}% of vault
                    </p>

                  </div>
                );
              })}

            </div>

          )}

        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        {/* VAULT */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">

            <div>
              <h2 className="text-2xl font-bold">
                Password Vault
              </h2>

              <p className="text-slate-400">
                Search and manage your passwords.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">

              {/* Search */}
              <input
                type="text"
                placeholder="Search website..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500"
              />

              {/* Category */}
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
              >
                <option value="All">
                  All Categories
                </option>

                <option value="Development">
                  Development
                </option>

                <option value="Social">
                  Social
                </option>

                <option value="Banking">
                  Banking
                </option>

                <option value="Shopping">
                  Shopping
                </option>

                <option value="Education">
                  Education
                </option>

                <option value="Personal">
                  Personal
                </option>

                <option value="Work">
                  Work
                </option>

                <option value="Entertainment">
                  Entertainment
                </option>

                <option value="Other">
                  Other
                </option>
              </select>

              {/* Add Password */}
              <button
                type="button"
                onClick={() => navigate("/add")}
                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                <Plus size={18} />
                Add Password
              </button>

              {/* Refresh */}
              <button
                type="button"
                onClick={fetchPasswords}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={18}
                  className={loading ? "animate-spin" : ""}
                />

                Refresh
              </button>

            </div>

          </div>

          <PasswordTable
            passwords={filteredPasswords}
            loading={loading}
            refreshPasswords={fetchPasswords}
            onEdit={(item) => navigate(`/edit/${item.id}`)}
          />

        </div>

      </div>

    </div>
  );
}

export default Dashboard;