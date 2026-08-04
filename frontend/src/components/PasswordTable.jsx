import { useState } from "react";
import api from "../services/api";

function PasswordTable({
  passwords,
  loading,
  refreshPasswords,
  onEdit,
}) {

  const [visiblePassword, setVisiblePassword] = useState(null);

  const togglePassword = (id) => {
    if (visiblePassword === id) {
      setVisiblePassword(null);
    } else {
      setVisiblePassword(id);
    }
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
    <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/70">

      <table className="min-w-full">

        <thead className="bg-slate-900 text-white">
          <tr>
            <th className="p-4">Website</th>
            <th className="p-4">Username</th>
            <th className="p-4">Password</th>
            <th className="p-4">Category</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>

        <tbody>

          {loading ? (

            <tr>
              <td colSpan="5" className="text-center p-6">
                Loading...
              </td>
            </tr>

          ) : passwords.length === 0 ? (

            <tr>
              <td colSpan="5" className="text-center p-6">
                No Passwords
              </td>
            </tr>

          ) : (

            passwords.map((item) => (

              <tr key={item.id} className="border-b border-slate-700">

                <td className="p-4">{item.websiteName}</td>

                <td className="p-4">{item.username}</td>

                <td className="p-4">
                  {visiblePassword === item.id
                    ? item.password
                    : "••••••••"}

                  <button
                    onClick={() => togglePassword(item.id)}
                    className="ml-3 text-cyan-400 hover:text-cyan-300"
                  >
                    {visiblePassword === item.id ? "Hide" : "Show"}
                  </button>
                </td>

                <td className="p-4">{item.category}</td>

                <td className="p-4">
                  <div className="flex gap-2">

                    <button
                      onClick={() => onEdit(item)}
                      className="bg-yellow-500 hover:bg-yellow-600 px-3 py-2 rounded text-white"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deletePassword(item.id)}
                      className="bg-red-500 hover:bg-red-600 px-3 py-2 rounded text-white"
                    >
                      Delete
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