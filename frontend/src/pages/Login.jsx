import { useContext, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import heroIllustration from "../assets/hero_illustration.png";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-fill username if rememberMe was previously checked
  useEffect(() => {
    const savedUsername = localStorage.getItem("rememberedUsername");
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);

    try {
      const response = await api.post("token/", {
        username,
        password,
      });

      // Save tokens in localStorage
      localStorage.setItem("accessToken", response.data.access);
      localStorage.setItem("refreshToken", response.data.refresh);

      // Handle remember me logic
      if (rememberMe) {
        localStorage.setItem("rememberedUsername", username);
      } else {
        localStorage.removeItem("rememberedUsername");
      }

      // Update global context state
      login(response.data.access);

      // Redirect to protected dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.detail || "Invalid username or password. Please try again.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* Left side panel (Illustration) - hidden on mobile/tablet */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 text-white relative items-center justify-center p-12 overflow-hidden">
        {/* Glow vector shapes */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-600/10 rounded-full filter blur-3xl opacity-60 animate-blob" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-600/10 rounded-full filter blur-3xl opacity-60 animate-blob animation-delay-2000" />
        
        <div className="relative z-10 max-w-lg space-y-8 flex flex-col items-center text-center">
          <div className="space-y-4">
            <h2 className="text-4xl font-extrabold tracking-tight">Empower Your Learning</h2>
            <p className="text-purple-200/80 leading-relaxed text-sm">
              Access your enrolled courses, view live classes, download learning resources, submit assignments, and track your completions dynamically.
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

      {/* Right side panel (Login Form) */}
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
              <h1 className="text-2xl font-extrabold text-gray-950 tracking-tight">Welcome Back</h1>
              <p className="text-sm text-gray-500">Sign in with your student credentials.</p>
            </div>
          </div>

          {/* Error message block */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center gap-2.5 animate-fade-in-up">
              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div className="space-y-1.5 text-left">
              <label htmlFor="username" className="text-sm font-semibold text-gray-700">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                disabled={loading}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="student1"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50 transition-all text-sm text-gray-900"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5 text-left">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Please contact the LMS administrator to reset your password."); }} className="text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50 transition-all text-sm text-gray-900"
                />
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.5 3.5M12 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L19 19" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center text-left">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                disabled={loading}
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4.5 w-4.5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
              />
              <label htmlFor="remember" className="ml-2 text-xs font-semibold text-gray-600 cursor-pointer">
                Remember my username
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full py-2.5 text-sm font-semibold"
            >
              Sign In
            </Button>
          </form>

          {/* Home Link */}
          <div className="text-center pt-2">
            <Link to="/" className="text-xs font-semibold text-gray-500 hover:text-purple-600 transition-colors inline-flex items-center gap-1.5 group">
              <svg className="h-4 w-4 transform group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}