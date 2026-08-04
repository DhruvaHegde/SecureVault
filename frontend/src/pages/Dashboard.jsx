import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import PasswordTable from "../components/PasswordTable";

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

      setPasswords(response.data || []);
    } catch (err) {
      console.error(err);

      if (
        err.response?.status === 401 ||
        err.response?.status === 403
      ) {
        alert("Session Expired");
        onLogout();
        return;
      }

      setError("Unable to fetch passwords.");
    } finally {
      setLoading(false);
    }
  };

  // Search + Category Filter
  const filteredPasswords = passwords.filter((item) => {

    const matchesSearch =
      item.websiteName.toLowerCase().includes(search.toLowerCase()) ||
      item.username.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || item.category === category;

    return matchesSearch && matchesCategory;
  });

  const strongCount = passwords.filter((item) => item.isStrong).length;
  const weakCount = passwords.length - strongCount;

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}

        <div className="flex justify-between items-center mb-10">

          <div>
            <h1 className="text-4xl font-bold">
              SecureVault Dashboard
            </h1>

            <p className="text-slate-400 mt-2">
              Manage your passwords securely.
            </p>
          </div>

          <button
            onClick={onLogout}
            className="bg-red-500 hover:bg-red-600 px-5 py-3 rounded-xl"
          >
            Logout
          </button>

        </div>

        {/* Stats */}

        <div className="grid md:grid-cols-3 gap-5 mb-10">

          <div className="bg-slate-900 p-6 rounded-3xl">
            <p>Total Passwords</p>
            <h2 className="text-5xl font-bold text-cyan-400 mt-2">
              {passwords.length}
            </h2>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl">
            <p>Strong Passwords</p>
            <h2 className="text-5xl font-bold text-green-400 mt-2">
              {strongCount}
            </h2>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl">
            <p>Weak Passwords</p>
            <h2 className="text-5xl font-bold text-red-400 mt-2">
              {weakCount}
            </h2>
          </div>

        </div>

        {error && (
          <div className="bg-red-500 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Vault */}

        <div className="bg-slate-900 rounded-3xl p-6">

          <div className="flex flex-wrap gap-4 justify-between items-center mb-6">

            <div>
              <h2 className="text-2xl font-bold">
                Password Vault
              </h2>

              <p className="text-slate-400">
                Search and manage your passwords.
              </p>
            </div>

            <div className="flex gap-3 flex-wrap">

              {/* Search */}

              <input
                type="text"
                placeholder="Search website..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-slate-800 px-4 py-3 rounded-xl text-white border border-slate-700"
              />

              {/* Category Filter */}

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-slate-800 px-4 py-3 rounded-xl text-white border border-slate-700"
              >
                <option value="All">All Categories</option>
                <option value="Development">Development</option>
                <option value="Social">Social</option>
                <option value="Banking">Banking</option>
                <option value="Shopping">Shopping</option>
                <option value="Education">Education</option>
                <option value="Personal">Personal</option>
              </select>

              <button
                onClick={() => navigate("/add")}
                className="bg-green-500 hover:bg-green-600 px-5 py-3 rounded-xl"
              >
                + Add Password
              </button>

              <button
                onClick={fetchPasswords}
                className="bg-cyan-500 hover:bg-cyan-600 px-5 py-3 rounded-xl text-black font-semibold"
              >
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