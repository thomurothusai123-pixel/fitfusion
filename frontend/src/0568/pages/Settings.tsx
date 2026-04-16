import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { BASEURL } from "../../utils";
import { toast, ToastContainer } from "react-toastify";

const Settings = () => {
  const { user } = useSelector((state: any) => state.authReducer);
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: "", email: "", gender: "", phone: "", password: "", confirmPassword: ""
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        gender: user.gender || "",
        phone: user.phone ? String(user.phone) : "",
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id) { toast.error("You must be logged in."); return; }
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match."); return;
    }
    if (formData.password && formData.password.length < 6) {
      toast.error("Password must be at least 6 characters."); return;
    }
    setLoading(true);
    try {
      const payload: Record<string, any> = {};
      if (formData.name) payload.name = formData.name;
      if (formData.email) payload.email = formData.email;
      if (formData.gender) payload.gender = formData.gender;
      if (formData.phone) payload.phone = formData.phone;
      if (formData.password) payload.password = formData.password;
      const res = await axios.patch(`${BASEURL}/user/update/${user._id}`, payload);
      if (res.data?.message === "Profile updated successfully") {
        toast.success("Profile updated successfully!");
        setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));
      } else {
        toast.warning(res.data?.message || "Unexpected response.");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto w-full">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <img
            src={user?.img || "https://www.customguide.com/img/user-images/generic-profile.png"}
            alt="Profile"
            className="w-16 h-16 rounded-full object-cover border border-gray-200 mr-4"
          />
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{user?.name || "Guest User"}</h2>
            <p className="text-sm text-gray-500">{user?.email || "Not signed in"}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${user?.verified ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
              {user?.verified ? "Verified" : "Unverified"}
            </span>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input id="settings-name" type="text" name="name" value={formData.name} onChange={handleChange}
                placeholder="Enter your name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input id="settings-email" type="email" name="email" value={formData.email} onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select id="settings-gender" name="gender" value={formData.gender} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Not Assigned">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input id="settings-phone" type="tel" name="phone" value={formData.phone} onChange={handleChange}
                placeholder="Enter your phone number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <hr className="border-gray-100 my-2" />
          <h3 className="text-base font-semibold text-gray-700">Change Password</h3>
          <p className="text-xs text-gray-400 -mt-2">Leave blank to keep your current password.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input id="settings-password" type="password" name="password" value={formData.password} onChange={handleChange}
                placeholder="Min. 6 characters"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input id="settings-confirm-password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                placeholder="Repeat new password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button id="settings-save-btn" type="submit" disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
