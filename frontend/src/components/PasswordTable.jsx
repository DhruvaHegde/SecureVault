import toast from "react-hot-toast";
import { useState } from "react";
import {
  Copy,
  Eye,
  EyeOff,
  Globe,
  Pencil,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Trash2,
} from "lucide-react";
import api from "../services/api";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function getPasswordStatus(lastUpdated) {
  if (!lastUpdated) return { label: "Unknown", className: "border-slate-700 bg-slate-800/70 text-slate-300", Icon: ShieldAlert };

  const updatedAt = new Date(lastUpdated).getTime();
  if (Number.isNaN(updatedAt)) {
    return { label: "Unknown", className: "border-slate-700 bg-slate-800/70 text-slate-300", Icon: ShieldAlert };
  }

  const daysSinceUpdate = Math.max(0, Math.floor((Date.now() - updatedAt) / DAY_IN_MS));
  if (daysSinceUpdate <= 30) {
    return { label: "Safe", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300", Icon: ShieldCheck };
  }
  if (daysSinceUpdate <= 90) {
    return { label: "Warning", className: "border-amber-500/30 bg-amber-500/10 text-amber-300", Icon: ShieldAlert };
  }
  return { label: "Expired", className: "border-rose-500/30 bg-rose-500/10 text-rose-300", Icon: ShieldX };
}

function formatLastUpdated(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function getWebsiteHref(url) {
  if (!url) return null;
  try {
    const parsed = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : null;
  } catch {
    return null;
  }
}

function PasswordTable({ passwords = [], loading = false, refreshPasswords, onEdit }) {
  const [visiblePassword, setVisiblePassword] = useState(null);

  const togglePassword = (id) => {
    setVisiblePassword((currentId) => (currentId === id ? null : id));
  };

  const copyPassword = async (password) => {
    try {
      await navigator.clipboard.writeText(password ?? "");
      toast.success("Password copied successfully!");
    } catch (error) {
      console.error("Unable to copy password:", error);
      toast.error("Unable to copy password.");
    }
  };

  const deletePassword = async (item) => {
    const id = item.id ?? item.passwordId ?? item._id;
    if (id == null) {
      toast.error("This entry does not have an ID.");
      return;
    }
    if (!window.confirm(`Delete the password for ${item.websiteName || "this website"}?`)) return;

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/passwords/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      toast.success("Password deleted successfully!");
      await refreshPasswords?.();
    } catch (error) {
      console.error("Unable to delete password:", error);
     toast.error(error.response?.data || "Unable to delete password.");
    }
  };

  const rows = Array.isArray(passwords) ? passwords : [];

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/70">
      <div className="overflow-x-auto">
        <table className="min-w-[1050px] w-full divide-y divide-slate-800 text-left text-sm text-slate-300">
          <thead className="bg-slate-900/90 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th scope="col" className="px-5 py-4 font-semibold">Website</th>
              <th scope="col" className="px-5 py-4 font-semibold">Username</th>
              <th scope="col" className="px-5 py-4 font-semibold">Password</th>
              <th scope="col" className="px-5 py-4 font-semibold">Category</th>
              <th scope="col" className="px-5 py-4 font-semibold">Last Updated</th>
              <th scope="col" className="px-5 py-4 font-semibold">Status</th>
              <th scope="col" className="px-5 py-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-slate-400" aria-live="polite">
                  Loading vault entries...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                  No passwords stored yet.
                </td>
              </tr>
            ) : (
              rows.map((item, index) => {
                const id = item.id ?? item.passwordId ?? item._id ?? index;
                const status = getPasswordStatus(item.lastUpdated);
                const StatusIcon = status.Icon;
                const websiteHref = getWebsiteHref(item.websiteUrl);
                const isVisible = visiblePassword === id;

                return (
                  <tr key={id} className="transition-colors hover:bg-slate-900/70">
                    <td className="px-5 py-4 font-medium text-white">
                      <div className="flex items-center gap-2">
                        <Globe size={16} className="shrink-0 text-cyan-400" aria-hidden="true" />
                        {websiteHref ? (
                          <a href={websiteHref} target="_blank" rel="noreferrer" className="max-w-48 truncate hover:text-cyan-300 hover:underline">
                            {item.websiteName || item.websiteUrl || "Unnamed website"}
                          </a>
                        ) : (
                          <span className="max-w-48 truncate">{item.websiteName || "Unnamed website"}</span>
                        )}
                      </div>
                    </td>
                    <td className="max-w-48 truncate px-5 py-4" title={item.username || ""}>{item.username || "—"}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="max-w-40 truncate font-mono text-slate-200" title={isVisible ? item.password || "" : undefined}>
                          {isVisible ? item.password || "" : "••••••••"}
                        </span>
                        <button type="button" onClick={() => togglePassword(id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label={isVisible ? "Hide password" : "Show password"} title={isVisible ? "Hide password" : "Show password"}>
                          {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button type="button" onClick={() => copyPassword(item.password)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-cyan-300" aria-label="Copy password" title="Copy password">
                          <Copy size={16} />
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4">{item.category || "General"}</td>
                    <td className="whitespace-nowrap px-5 py-4">{formatLastUpdated(item.lastUpdated)}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${status.className}`}>
                        <StatusIcon size={14} aria-hidden="true" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <button type="button" onClick={() => onEdit?.(item)} className="rounded-lg p-2 text-slate-400 transition hover:bg-cyan-500/10 hover:text-cyan-300" aria-label={`Edit ${item.websiteName || "password"}`} title="Edit">
                          <Pencil size={16} />
                        </button>
                        <button type="button" onClick={() => deletePassword(item)} className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-300" aria-label={`Delete ${item.websiteName || "password"}`} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PasswordTable;
