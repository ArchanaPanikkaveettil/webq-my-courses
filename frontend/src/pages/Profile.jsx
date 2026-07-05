import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import ProgressBar from "../components/ui/ProgressBar";
import Badge from "../components/ui/Badge";
import Spinner from "../components/ui/Spinner";

export default function Profile() {
  const navigate = useNavigate();
  const { user: authUser, setUser: setAuthUser } = useContext(AuthContext);

  // Profile data state
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit fields state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState(null);
  const [updateError, setUpdateError] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Fetch full profile info
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("me/");
      setProfile(response.data);
      
      // Initialize edit fields
      setFullName(response.data.full_name || "");
      setEmail(response.data.email || "");
      setProfilePhoto(response.data.profile_photo || "");
    } catch (err) {
      console.error("Failed to load profile:", err);
      setError("Failed to load profile details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateSuccess(null);
    setUpdateError(null);

    if (!fullName.trim()) {
      setUpdateError("Full Name cannot be empty.");
      return;
    }
    if (!email.trim()) {
      setUpdateError("Email cannot be empty.");
      return;
    }

    setUpdating(true);
    try {
      const response = await api.patch("me/", {
        full_name: fullName,
        email: email,
        profile_photo: profilePhoto,
      });
      setProfile(response.data);
      setUpdateSuccess("Profile updated successfully!");
      
      // Sync with global auth context
      setAuthUser(response.data);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setUpdateError(err.response?.data?.detail || "An error occurred while updating profile.");
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError("Current password is required.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setPasswordLoading(true);
    try {
      await api.post("change-password/", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPasswordSuccess("Password updated successfully!");
      
      // Clear password form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Failed to change password:", err);
      setPasswordError(err.response?.data?.detail || "Incorrect current password or invalid request.");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center space-y-4 font-sans">
        <Spinner size="lg" />
        <span className="text-gray-500 font-semibold text-sm">Loading your profile...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-6 font-sans">
        <Card hover={false} className="w-full max-w-md p-8 border border-red-100 text-center space-y-5 bg-white rounded-2xl shadow-xl">
          <div className="h-14 w-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Load Error</h2>
          <p className="text-sm text-gray-500 leading-relaxed font-semibold">{error}</p>
          <Button variant="primary" className="w-full py-2.5 font-bold" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const joinDate = profile?.date_joined 
    ? new Date(profile.date_joined).toLocaleDateString(undefined, {
        year: 'numeric', month: 'long', day: 'numeric'
      })
    : "N/A";

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-purple-900 via-indigo-950 to-purple-950 text-white relative py-12 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full filter blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-60 h-60 bg-indigo-600/10 rounded-full filter blur-3xl opacity-60 pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-6 relative z-10 text-left">
          {/* Back link */}
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-purple-200 hover:text-white transition-colors group cursor-pointer"
          >
            <svg className="h-4.5 w-4.5 transform group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {profile?.profile_photo ? (
              <img
                src={profile.profile_photo}
                alt={profile.full_name}
                className="h-20 w-20 rounded-full object-cover border-2 border-purple-500/50 shadow-md bg-white shrink-0"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-purple-100/10 text-purple-200 border-2 border-purple-500/30 flex items-center justify-center font-bold text-3xl shrink-0">
                {profile?.full_name ? profile.full_name[0].toUpperCase() : "S"}
              </div>
            )}
            <div className="space-y-1 text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                {profile?.full_name}
              </h1>
              <p className="text-purple-200 text-sm font-semibold">
                Student ID: <span className="font-bold">{profile?.student_id || "N/A"}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Columns - Forms & Edits */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Profile Info Form */}
            <Card hover={false} className="p-8 border border-gray-150 rounded-2xl shadow-xs bg-white text-left">
              <h2 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">Profile Information</h2>
              
              {updateSuccess && (
                <div className="mb-5 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-bold">
                  {updateSuccess}
                </div>
              )}
              {updateError && (
                <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-bold">
                  {updateError}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide text-left block">Username</label>
                    <input
                      type="text"
                      value={profile?.username || ""}
                      disabled
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-400 font-semibold cursor-not-allowed focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide text-left block">Student ID</label>
                    <input
                      type="text"
                      value={profile?.student_id || "N/A"}
                      disabled
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-400 font-semibold cursor-not-allowed focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide text-left block">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide text-left block">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide text-left block">Profile Photo URL</label>
                  <input
                    type="text"
                    value={profilePhoto}
                    onChange={(e) => setProfilePhoto(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-gray-400 mt-1 leading-normal text-left">
                    Input a direct image link URL to update your profile photo avatar.
                  </p>
                </div>

                <div className="pt-2 text-right">
                  <Button
                    type="submit"
                    variant="primary"
                    className="font-bold text-sm px-6 py-2.5 shadow-md"
                    loading={updating}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </Card>

            {/* Security Settings */}
            <Card hover={false} className="p-8 border border-gray-150 rounded-2xl shadow-xs bg-white text-left">
              <h2 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">Security</h2>
              
              {passwordSuccess && (
                <div className="mb-5 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-bold">
                  {passwordSuccess}
                </div>
              )}
              {passwordError && (
                <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-bold">
                  {passwordError}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-5">
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2 text-right">
                  <Button
                    type="submit"
                    variant="primary"
                    className="font-bold text-sm px-6 py-2.5 shadow-md"
                    loading={passwordLoading}
                  >
                    Change Password
                  </Button>
                </div>
              </form>
            </Card>

          </div>

          {/* Right Column - Sidebar info & courses */}
          <div className="space-y-8">
            
            {/* Account Metadata card */}
            <Card hover={false} className="p-6 sm:p-8 border border-gray-150 rounded-2xl shadow-xs bg-white text-left space-y-4">
              <h3 className="font-bold text-lg text-gray-900 tracking-tight">Account Summary</h3>
              
              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-400 font-semibold">Joined Date</span>
                  <span className="text-gray-700 font-bold">{joinDate}</span>
                </div>
                <div className="flex justify-between pb-1 items-center">
                  <span className="text-gray-400 font-semibold">Department</span>
                  <span className="text-purple-600 font-bold uppercase tracking-wider text-[10px] bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-100">
                    Computer Science
                  </span>
                </div>
              </div>
            </Card>

            {/* Enrolled Courses list card */}
            <Card hover={false} className="p-6 sm:p-8 border border-gray-150 rounded-2xl shadow-xs bg-white text-left space-y-6">
              <h3 className="font-bold text-lg text-gray-900 tracking-tight">Enrolled Courses</h3>

              {!profile?.enrolled_courses || profile.enrolled_courses.length === 0 ? (
                <div className="text-gray-400 text-sm text-center py-4">Not enrolled in any courses yet.</div>
              ) : (
                <div className="space-y-5">
                  {profile.enrolled_courses.map((course) => (
                    <div key={course.id} className="space-y-2 border-b border-gray-50 last:border-0 pb-4 last:pb-0">
                      <div className="flex justify-between items-start gap-3 text-left">
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm leading-snug">{course.course_name}</h4>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{course.course_code}</span>
                        </div>
                        {course.progress === 100 && (
                          <Badge type="success" className="text-[9px] py-0.5 px-1.5 uppercase font-bold shrink-0">
                            Completed
                          </Badge>
                        )}
                      </div>
                      <ProgressBar value={course.progress} />
                    </div>
                  ))}
                </div>
              )}
            </Card>

          </div>

        </div>
      </main>
    </div>
  );
}
