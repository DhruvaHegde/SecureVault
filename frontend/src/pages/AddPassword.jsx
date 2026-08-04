import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

  useEffect(() => {
    if (id) {
      fetchPassword();
    }
  }, [id]);

  const fetchPassword = async () => {
  try {
    const token = localStorage.getItem("token");

    console.log("Token:", token);

    const response = await api.get(`/passwords/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Response:", response);
    console.log("Data:", response.data);

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

    if (error.response) {
      console.log(error.response.data);
      console.log(error.response.status);
    }

    alert("Unable to load password.");
  }
};
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      const token = localStorage.getItem("token");

      if (id) {

        await api.put(
          `/passwords/${id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        alert("Password Updated Successfully!");

      } else {

        await api.post(
          "/passwords/add",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        alert("Password Saved Successfully!");
      }

      navigate("/dashboard");

    } catch (error) {

      console.error(error);

      if (error.response) {
        alert(error.response.data);
      } else {
        alert("Something went wrong.");
      }

    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">

      <form
        onSubmit={handleSubmit}
        className="bg-slate-800 p-8 rounded-xl w-[500px] shadow-xl"
      >

        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          {id ? "Edit Password" : "Add New Password"}
        </h1>

        <input
          type="text"
          name="websiteName"
          placeholder="Website Name"
          value={formData.websiteName}
          onChange={handleChange}
          className="w-full p-3 mb-4 rounded bg-slate-700 text-white"
          required
        />

        <input
          type="text"
          name="websiteUrl"
          placeholder="Website URL"
          value={formData.websiteUrl}
          onChange={handleChange}
          className="w-full p-3 mb-4 rounded bg-slate-700 text-white"
        />

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          className="w-full p-3 mb-4 rounded bg-slate-700 text-white"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full p-3 mb-4 rounded bg-slate-700 text-white"
          required
        />

        <input
          type="text"
          name="category"
          placeholder="Category"
          value={formData.category}
          onChange={handleChange}
          className="w-full p-3 mb-4 rounded bg-slate-700 text-white"
        />

        <textarea
          name="notes"
          placeholder="Notes"
          value={formData.notes}
          onChange={handleChange}
          className="w-full p-3 mb-6 rounded bg-slate-700 text-white"
        />

        <button
          type="submit"
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded"
        >
          {id ? "Update Password" : "Save Password"}
        </button>

      </form>

    </div>
  );
}

export default AddPassword;