import { useState } from "react";
import {
  Eye,
  EyeOff,
  Copy,
  Pencil,
  Trash2,
  Globe,
} from "lucide-react";

import api from "../services/api";

function PasswordTable({
  passwords,
  loading,
  refreshPasswords,
  onEdit,
}) {
  const [visiblePassword, setVisiblePassword] = useState(null);

  const togglePassword = (id) => {
    setVisiblePassword(visiblePassword === id ? null : id);
  };

  const copyPassword = (password) => {
    navigator.clipboard.writeText(password);
    alert("Password copied successfully!");
  };

  const deletePassword = async (id) => {
    if (!window.confirm("Delete this password?")) return;

    try {
      const token = localStorage.getItem("token");

      await api.delete(`/passwords/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Password Deleted Successfully");
      refreshPasswords();
    } catch (error) {
      console.error(error);
      alert("Unable to delete password");
    }
  };

  return (
    <div className="overflow-x-auto rounded-3xl border border-slate-700 shadow-xl">

      <table className="w-full text-left">

        <thead className="bg-slate-800 text-slate-300">

          <tr>

            <th className="px-6 py-4">Website</th>

            <th className="px-6 py-4">Username</th>

            <th className="px-6 py-4">Password</th>

            <th className="px-6 py-4">Category</th>

            <th className="px-6 py-4 text-center">Actions</th>

          </tr>

        </thead>

        <tbody>

          {loading ? (

            <tr>
              <td colSpan="5" className="text-center py-8 text-slate-400">
                Loading Passwords...
              </td>
            </tr>

          ) : passwords.length === 0 ? (

            <tr>
              <td colSpan="5" className="text-center py-8 text-slate-400">
                No Passwords Found
              </td>
            </tr>

          ) : (

            passwords.map((item) => (

              <tr
                key={item.id}
                className="border-b border-slate-800 hover:bg-slate-900 transition duration-200"
              >

                {/* Website */}

                <td className="px-6 py-5">

                  <div className="flex items-center gap-3">

                    <div className="bg-cyan-500/20 p-2 rounded-full">
                      <Globe size={18} className="text-cyan-400" />
                    </div>

                    <div>

                      <p className="font-semibold text-white">
                        {item.websiteName}
                      </p>

                      <p className="text-xs text-slate-500 truncate max-w-[180px]">
                        {item.websiteUrl}
                      </p>

                    </div>

                  </div>

                </td>

                {/* Username */}

                <td className="px-6 py-5 text-slate-300">
                  {item.username}
                </td>

                {/* Password */}

                <td className="px-6 py-5">

                  <div className="flex items-center gap-2">

                    <span className="font-mono">

                      {visiblePassword === item.id
                        ? item.password
                        : "••••••••"}

                    </span>

                    <button
                      onClick={() => togglePassword(item.id)}
                      className="text-cyan-400 hover:text-cyan-300"
                    >
                      {visiblePassword === item.id ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                    <button
                      onClick={() => copyPassword(item.password)}
                      className="text-green-400 hover:text-green-300"
                    >
                      <Copy size={18} />
                    </button>

                  </div>

                </td>

                {/* Category */}

                <td className="px-6 py-5">

                  <span className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full text-sm">

                    {item.category || "General"}

                  </span>

                </td>

                {/* Actions */}

                <td className="px-6 py-5">

                  <div className="flex justify-center gap-3">

                    <button
                      onClick={() => onEdit(item)}
                      className="bg-yellow-500 hover:bg-yellow-600 p-2 rounded-lg text-white transition"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      onClick={() => deletePassword(item.id)}
                      className="bg-red-500 hover:bg-red-600 p-2 rounded-lg text-white transition"
                    >
                      <Trash2 size={18} />
                    </button>

                  </div>

                </td>

              </tr>

            ))

          )}

        </tbody>

      </table>

    </div>
  );
}

export default PasswordTable;