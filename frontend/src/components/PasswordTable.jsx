function PasswordTable({ passwords, loading }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/70">
      <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-300">
        <thead className="bg-slate-900/90 text-slate-400">
          <tr>
            <th className="px-6 py-4 font-semibold">Website</th>
            <th className="px-6 py-4 font-semibold">Username</th>
            <th className="px-6 py-4 font-semibold">Password</th>
            <th className="px-6 py-4 font-semibold">Category</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {loading ? (
            <tr>
              <td colSpan="4" className="px-6 py-8 text-center text-slate-400">
                Loading vault entries...
              </td>
            </tr>
          ) : passwords.length === 0 ? (
            <tr>
              <td colSpan="4" className="px-6 py-10 text-center text-slate-400">
                No passwords stored yet.
              </td>
            </tr>
          ) : (
            passwords.map((item, index) => (
              <tr key={index} className="bg-slate-950/80 hover:bg-slate-900/90 transition-colors">
                <td className="px-6 py-4 font-medium text-white">{item.websiteName}</td>
                <td className="px-6 py-4">{item.username}</td>
                <td className="px-6 py-4 text-slate-200">••••••••</td>
                <td className="px-6 py-4">{item.category || "General"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default PasswordTable;
