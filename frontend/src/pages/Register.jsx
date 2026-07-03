import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import heroIllustration from "../assets/hero_illustration.png";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    // Mock register success since backend does not provide a register API
    setTimeout(() => {
      setLoading(false);
      setSuccess("Account successfully registered! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* Left side panel (Illustration) - hidden on mobile/tablet */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 text-white relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-600/10 rounded-full filter blur-3xl opacity-60 animate-blob" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-600/10 rounded-full filter blur-3xl opacity-60 animate-blob animation-delay-2000" />
        
        <div className="relative z-10 max-w-lg space-y-8 flex flex-col items-center text-center">
          <div className="space-y-4">
            <h2 className="text-4xl font-extrabold tracking-tight">Join My Courses LMS</h2>
            <p className="text-purple-200/80 leading-relaxed text-sm">
              Create an account to gain access to learning resources, live classrooms, quizzes, and tracking tools to accelerate your studies.
            </p>
          </div>
          
          <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-white/5 backdrop-blur-xs p-3">
            <img
              src={heroIllustration}
              alt="LMS portal interface preview"
              className="rounded-xl w-full h-auto"
            />
          </div>
        </div>
      </div>

      {/* Right side panel (Register Form) */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:w-1/2 min-h-screen">
        <Card hover={false} className="w-full max-w-md p-8 sm:p-10 border border-gray-100/85 rounded-2xl shadow-2xl bg-white space-y-6">
          {/* Header & Logo */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2.5 cursor-pointer group" onClick={() => navigate("/")}>
              <div className="h-10 w-10 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-200 transition-all duration-300 group-hover:scale-105">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight transition-colors group-hover:text-purple-600">
                My Courses <span className="text-purple-600 group-hover:text-purple-700">LMS</span>
              </span>
            </div>
            
            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold text-gray-950 tracking-tight">Create Account</h1>
              <p className="text-sm text-gray-500">Sign up to get started as a student.</p>
            </div>
          </div>

          {/* Error / Success message block */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center gap-2.5 animate-fade-in-up">
              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-semibold flex items-center gap-2.5 animate-fade-in-up">
              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1 text-left">
              <label htmlFor="name" className="text-xs font-bold text-gray-700 uppercase tracking-wide">Full Name</label>
              <input
                id="name"
                type="text"
                required
                disabled={loading}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50 transition-all text-sm text-gray-900"
              />
            </div>

            {/* Username */}
            <div className="space-y-1 text-left">
              <label htmlFor="username" className="text-xs font-bold text-gray-700 uppercase tracking-wide">Username</label>
              <input
                id="username"
                type="text"
                required
                disabled={loading}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50 transition-all text-sm text-gray-900"
              />
            </div>

            {/* Email */}
            <div className="space-y-1 text-left">
              <label htmlFor="email" className="text-xs font-bold text-gray-700 uppercase tracking-wide">Email</label>
              <input
                id="email"
                type="email"
                required
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50 transition-all text-sm text-gray-900"
              />
            </div>

            {/* Password */}
            <div className="space-y-1 text-left">
              <label htmlFor="password" className="text-xs font-bold text-gray-700 uppercase tracking-wide">Password</label>
              <input
                id="password"
                type="password"
                required
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50 transition-all text-sm text-gray-900"
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-1 text-left">
              <label htmlFor="confirmPassword" className="text-xs font-bold text-gray-700 uppercase tracking-wide">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                required
                disabled={loading}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50 transition-all text-sm text-gray-900"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full py-2.5 text-sm font-semibold mt-2"
            >
              Sign Up
            </Button>
          </form>

          {/* Already have an account link */}
          <div className="text-center pt-2 text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-purple-600 hover:text-purple-700 transition-colors">
              Login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
