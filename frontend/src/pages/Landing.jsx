import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import heroIllustration from "../assets/hero_illustration.png";

export default function Landing() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("hero");

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      const heroEl = document.getElementById("hero");
      const featuresEl = document.getElementById("features");
      const statsEl = document.getElementById("stats");
      const aboutEl = document.getElementById("about");

      if (aboutEl && scrollPos >= aboutEl.offsetTop - 100) {
        setActiveSection("about");
      } else if (statsEl && scrollPos >= statsEl.offsetTop - 100) {
        setActiveSection("stats");
      } else if (featuresEl && scrollPos >= featuresEl.offsetTop - 100) {
        setActiveSection("features");
      } else {
        setActiveSection("hero");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const stats = [
    {
      value: "10+",
      label: "Premium Courses",
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      value: "500+",
      label: "Active Students",
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      value: "98%",
      label: "Completion Rate",
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      )
    },
    {
      value: "25+",
      label: "Weekly Live Sessions",
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )
    }
  ];

  const features = [
    {
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: "Interactive Study Materials",
      description: "Access high-quality PDFs, videos, and revision notes anytime, anywhere. Track your completed items with a single click."
    },
    {
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      title: "Attending Live Classes",
      description: "Join interactive live session classrooms with professional faculty members. Never miss a session with in-app reminders."
    },
    {
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      title: "Track Assignments & Grades",
      description: "Submit homework assignments directly through the app. Receive detailed faculty evaluations and grades in real-time."
    }
  ];

  const navLinks = [
    { label: "Features", href: "#features", key: "features" },
    { label: "Statistics", href: "#stats", key: "stats" },
    { label: "About", href: "#about", key: "about" }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans overflow-x-hidden">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100/80 sticky top-0 z-40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => navigate("/")}>
              <div className="h-10 w-10 rounded-xl bg-purple-600 hover:bg-purple-700 flex items-center justify-center shadow-lg shadow-purple-200 transition-all duration-300 group-hover:scale-105">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight transition-colors group-hover:text-purple-600">
                My Courses <span className="text-purple-600 group-hover:text-purple-700">LMS</span>
              </span>
            </div>

            {/* Menu Links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.key}
                  href={link.href}
                  className={`relative py-1 transition-all duration-200 font-semibold text-sm ${
                    activeSection === link.key
                      ? "text-purple-600 after:w-full"
                      : "text-gray-500 hover:text-purple-600 after:w-0"
                  } after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-purple-600 after:transition-all after:duration-300`}
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" className="hover:text-purple-700 font-bold" onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button variant="primary" className="font-bold" onClick={() => navigate("/register")}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="hero"
        className="relative flex-1 min-h-[85vh] flex items-center justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24"
      >
        {/* Background blobs for visual effects */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-300/30 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-pink-300/20 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob animation-delay-4000" />

        <div className="relative z-10 w-full flex flex-col lg:flex-row items-center justify-between gap-16 animate-fade-in-up">
          {/* Left Text Column */}
          <div className="flex-1 text-center lg:text-left space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100/60 border border-purple-200/50 text-purple-700 text-xs font-semibold uppercase tracking-wider backdrop-blur-xs">
              ✨ Next Generation Student Portal
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1]">
              Elevate Your Learning <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 animate-gradient-slow">
                Experience
              </span>
            </h1>
            <p className="text-lg text-gray-600/90 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              A comprehensive student Learning Management System designed to streamline virtual education. View your enrolled classes, engage in live sessions, download materials, track completions, and submit assignments within a single modern dashboard.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <Button size="lg" variant="primary" className="px-8 py-3 text-base shadow-xl shadow-purple-200/50 hover:shadow-purple-200/80" onClick={() => navigate("/register")}>
                Get Started Now
              </Button>
              <Button size="lg" variant="secondary" className="px-8 py-3 text-base" onClick={() => navigate("/register")}>
                Sign In to Portal
              </Button>
            </div>
          </div>

          {/* Right Illustration Column */}
          <div className="flex-1 w-full max-w-lg lg:max-w-none flex justify-center animate-float">
            <div className="relative w-full max-w-md lg:max-w-xl">
              {/* Glow backlighting */}
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-3xl filter blur-3xl opacity-20 transform scale-[1.05]" />
              
              {/* Image Frame */}
              <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100/50 transform hover:scale-[1.01] transition-transform duration-300">
                <img
                  src={heroIllustration}
                  alt="My Courses LMS illustration"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section id="stats" className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-8 sm:-mt-12 lg:-mt-16 mb-16 animate-fade-in-up animation-delay-2000">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <Card
              key={idx}
              hover={false}
              className="flex items-center gap-5 p-6 bg-white/70 backdrop-blur-md border border-gray-200/50 shadow-lg hover:shadow-xl hover:-translate-y-1 hover:border-purple-200/50 transition-all duration-300 rounded-2xl"
            >
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-100">
                {stat.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-extrabold text-gray-900 tracking-tight leading-none mb-1">
                  {stat.value}
                </span>
                <span className="text-sm font-semibold text-gray-500">
                  {stat.label}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Feature Cards Section */}
      <section id="features" className="bg-white border-y border-gray-100 py-20 sm:py-28 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <div className="text-xs font-bold uppercase tracking-widest text-purple-600">Core Features</div>
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl tracking-tight leading-tight">
              Everything you need in one clean portal
            </h2>
            <p className="text-lg text-gray-500">
              Designed from the ground up for modern virtual classroom workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <Card
                key={idx}
                hover={false}
                className="flex flex-col gap-6 text-left p-8 h-full border border-gray-100/70 hover:shadow-2xl hover:-translate-y-2 hover:border-purple-100 transition-all duration-300 rounded-2xl"
              >
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-200">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-xl text-gray-900 tracking-tight">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="bg-slate-900 text-gray-400 py-16 border-t border-slate-800 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-8 border-b border-slate-800">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-purple-600 flex items-center justify-center shadow-md shadow-purple-800">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="font-bold text-lg text-white">
                My Courses <span className="text-purple-500">LMS</span>
              </span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-8 text-sm">
              <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
              <span className="hover:text-white cursor-pointer transition-colors">Contact Support</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <span>Designed for modern, intuitive virtual instruction environments.</span>
            <span>
              © {new Date().getFullYear()} My Courses LMS. All rights reserved.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
