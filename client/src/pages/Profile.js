import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../app/authContext";
import { getMyProfile, updateMyProfile } from "../api/user.api";

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState({ message: "", type: "success" });
  const [form, setForm] = useState({
    rollNo: "",
    className: "",
    branch: "",
    year: "",
  });

  const showNotice = (message, type = "success") => {
    setNotice({ message, type });
    setTimeout(() => {
      setNotice({ message: "", type: "success" });
    }, 1800);
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getMyProfile();
        const profile = data?.user || {};
        setForm({
          rollNo: profile.rollNo || "",
          className: profile.className || "",
          branch: profile.branch || "",
          year: profile.year || "",
        });
      } catch (error) {
        showNotice(error?.response?.data?.message || "Failed to load profile", "error");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const result = await updateMyProfile(form);
      if (result?.user && user) {
        updateUser({ ...user, ...result.user });
      }
      showNotice("Profile updated successfully");
      setTimeout(() => navigate("/marketplace"), 600);
    } catch (error) {
      showNotice(error?.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container page page-shell profile-page">
      <div className="profile-card">
        <h2 className="profile-title">Edit Profile</h2>
        <p className="profile-subtitle">Update your student details for campus trade verification.</p>

        {notice.message && (
          <div className={`profile-notice ${notice.type}`} role="status" aria-live="polite">
            {notice.message}
          </div>
        )}

        {loading ? (
          <p className="profile-loading">Loading profile...</p>
        ) : (
          <form className="profile-form" onSubmit={handleSubmit}>
            <label>
              Roll No
              <input
                name="rollNo"
                value={form.rollNo}
                onChange={handleChange}
                placeholder="e.g. 23xxx..."
                className="profile-input"
              />
            </label>

            <label>
              Class
              <input
                name="className"
                value={form.className}
                onChange={handleChange}
                placeholder="e.g. CSE-A"
                className="profile-input"
              />
            </label>

            <label>
              Branch
              <input
                name="branch"
                value={form.branch}
                onChange={handleChange}
                placeholder="e.g. CSE"
                className="profile-input"
              />
            </label>

            <label>
              Year
              <input
                name="year"
                value={form.year}
                onChange={handleChange}
                placeholder="e.g. 2nd"
                className="profile-input"
              />
            </label>

            <button className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
