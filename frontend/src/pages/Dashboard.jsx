import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import PasswordTable from "../components/PasswordTable";

function Dashboard({ onLogout }) {
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPasswords();
  }, []);

  const fetchPasswords = async () => {
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/passwords", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPasswords(response.data || []);
    } catch (err) {
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        setError("Your session expired. Please sign in again.");
        onLogout();
        return;
      }

      setError(
        err.response?.data || "Unable to load passwords. Please try again."
      );
      console.error("Error fetching passwords:", err);
    } finally {
      setLoading(false);
    }
  };

  const strongCount = passwords.filter((item) => item.isStrong).length;
  const weakCount = passwords.length - strongCount;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <p className="text-cyan-400 uppercase tracking-[0.3em] text-sm font-semibold mb-2">
              SecureVault Dashboard
            </p>
            <h1 className="text-4xl font-bold text-white">Welcome back, vault manager</h1>
            <p className="text-slate-400 mt-2">
              Review your latest saved credentials and keep your online identity safe.
            </p>
          </div>

          <button
            onClick={onLogout}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
          >
            Logout
          </button>
        </header>

        <div className="grid gap-6 md:grid-cols-3 mb-10">
          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/20">
            <p className="text-sm text-slate-400 uppercase tracking-[0.25em] mb-3">Total Vault Items</p>
            <p className="text-5xl font-bold text-cyan-400">{passwords.length}</p>
          </div>

          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/20">
            <p className="text-sm text-slate-400 uppercase tracking-[0.25em] mb-3">Strong Credentials</p>
            <p className="text-5xl font-bold text-emerald-400">{strongCount}</p>
          </div>

          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/20">
            <p className="text-sm text-slate-400 uppercase tracking-[0.25em] mb-3">Weak Credentials</p>
            <p className="text-5xl font-bold text-rose-400">{weakCount}</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-3xl border border-red-500/30 bg-red-500/10 p-5 text-red-200">
            {error}
          </div>
        )}

        <section className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/20">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Password Vault</h2>
              <p className="text-slate-400 mt-1">
                Stored entries are encrypted and available only while signed in.
              </p>
            </div>
            <div className="flex gap-3">

             <button
            onClick={() => navigate("/add")}
            className="rounded-2xl bg-green-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-600"
            >+Add Password
            </button>

  <button
    onClick={fetchPasswords}
    className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
  >
    Refresh
  </button>

</div>
          </div>

       <PasswordTable
  passwords={passwords}
  loading={loading}
  refreshPasswords={fetchPasswords}
  onEdit={(item) => navigate(`/edit/${item.id}`)}
/>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
