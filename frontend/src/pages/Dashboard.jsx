import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import useApi from "../hooks/useApi";
import api from "../api/axios";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import ProgressBar from "../components/ui/ProgressBar";
import Badge from "../components/ui/Badge";
import Spinner from "../components/ui/Spinner";
import GlobalSearch from "../components/common/GlobalSearch";
import NotificationBell from "../components/common/NotificationBell";

// API Call: Fetch my courses
const fetchMyCourses = () => api.get("my-courses/");
const fetchDashboardSummary = () => api.get("dashboard-summary/");

export default function Dashboard() {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const { data: courses, loading, error, execute: refetchCourses } = useApi(fetchMyCourses);
  const { data: summary, loading: summaryLoading, error: summaryError, execute: refetchSummary } = useApi(fetchDashboardSummary);

  // UI preferences states
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem("dashboardViewMode") || "grid";
  });
  const [pinnedCourses, setPinnedCourses] = useState(() => {
    const saved = localStorage.getItem("pinnedCourses");
    return saved ? JSON.parse(saved) : [];
  });

  // Save view mode preference
  useEffect(() => {
    localStorage.setItem("dashboardViewMode", viewMode);
  }, [viewMode]);

  // Save pinned courses preference
  useEffect(() => {
    localStorage.setItem("pinnedCourses", JSON.stringify(pinnedCourses));
  }, [pinnedCourses]);

  const togglePinCourse = (courseId) => {
    setPinnedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Filter & Sort Courses
  const filteredCourses = courses
    ? courses.filter((course) => {
        const matchesSearch =
          course.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.course_code.toLowerCase().includes(searchQuery.toLowerCase());
        
        let matchesFilter = true;
        if (courseFilter === "in_progress") {
          matchesFilter = course.progress > 0 && course.progress < 100;
        } else if (courseFilter === "completed") {
          matchesFilter = course.progress === 100;
        }
        
        return matchesSearch && matchesFilter;
      })
    : [];

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    const aPinned = pinnedCourses.includes(a.id);
    const bPinned = pinnedCourses.includes(b.id);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return 0;
  });

  // Statistics calculation
  const totalCoursesCount = courses ? courses.length : 0;
  const completedCoursesCount = courses
    ? courses.filter((c) => c.progress === 100).length
    : 0;
  const averageProgress =
    courses && courses.length > 0
      ? Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / courses.length)
      : 0;

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      {/* Header / Navbar */}
      <nav className="bg-white border-b border-gray-150 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/dashboard")}>
              <div className="h-10 w-10 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-200">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">
                My Courses <span className="text-purple-600">LMS</span>
              </span>
            </div>

            {/* Global Search Component */}
            <div className="hidden md:flex flex-1 justify-center max-w-sm mx-4">
              <GlobalSearch />
            </div>

            {/* Profile & Logout */}
            <div className="flex items-center gap-4">
              <NotificationBell />

              <div 
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigate("/profile")}
              >
                {user?.profile_photo ? (
                  <img
                    src={user.profile_photo}
                    alt={user.full_name || "Student"}
                    className="h-8 w-8 rounded-full object-cover border border-purple-200"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm border border-purple-200">
                    {user?.full_name ? user.full_name[0].toUpperCase() : (user?.username ? user.username[0].toUpperCase() : "S")}
                  </div>
                )}
                <span className="hidden sm:inline text-sm font-semibold text-gray-700">
                  {user?.full_name || user?.username || "Student"}
                </span>
              </div>
              
              <Button 
                variant="secondary" 
                size="sm" 
                className="font-semibold text-xs py-1.5" 
                onClick={() => navigate("/profile")}
              >
                My Profile
              </Button>

              <Button variant="secondary" size="sm" className="font-semibold text-xs py-1.5" onClick={handleLogout}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-purple-900 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-xl shadow-purple-900/10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full filter blur-3xl opacity-60" />
          <div className="absolute bottom-0 left-10 w-60 h-60 bg-indigo-600/10 rounded-full filter blur-3xl opacity-60" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 text-left">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Welcome back, {user?.full_name || user?.username || "Student"}!
              </h1>
              <p className="text-purple-200/90 text-sm sm:text-base">
                Track your active syllabus, modules, live classes, and achievements here.
              </p>
            </div>

            {/* Stats indicators */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 shrink-0">
              <div className="text-center px-2">
                <span className="block text-2xl font-bold tracking-tight">{totalCoursesCount}</span>
                <span className="text-[10px] font-semibold text-purple-200 uppercase tracking-wider">Courses</span>
              </div>
              <div className="text-center px-2 border-x border-white/10">
                <span className="block text-2xl font-bold tracking-tight">{completedCoursesCount}</span>
                <span className="text-[10px] font-semibold text-purple-200 uppercase tracking-wider">Completed</span>
              </div>
              <div className="text-center px-2">
                <span className="block text-2xl font-bold tracking-tight">{averageProgress}%</span>
                <span className="text-[10px] font-semibold text-purple-200 uppercase tracking-wider">Avg Progress</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Overview Cards */}
        {summaryLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className="bg-white border border-gray-150 rounded-2xl p-5 animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-8 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : summaryError ? (
          <div className="text-red-500 text-sm text-left">Failed to load statistics.</div>
        ) : summary?.stats ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card hover={false} className="p-5 border border-gray-150 rounded-2xl bg-white text-left shadow-xs flex flex-col justify-between">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Enrolled Courses</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-black text-gray-900">{summary.stats.total_courses}</span>
                <span className="text-gray-500 text-xs font-semibold">Classes</span>
              </div>
            </Card>

            <Card hover={false} className="p-5 border border-gray-150 rounded-2xl bg-white text-left shadow-xs flex flex-col justify-between">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Overall Progress</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-black text-purple-650">{summary.stats.overall_progress}%</span>
                <span className="text-gray-500 text-xs font-semibold">Average</span>
              </div>
            </Card>

            <Card hover={false} className="p-5 border border-gray-150 rounded-2xl bg-white text-left shadow-xs flex flex-col justify-between">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Completed Lessons</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-black text-green-655">{summary.stats.completed_materials}</span>
                <span className="text-gray-500 text-xs font-semibold">Materials</span>
              </div>
            </Card>

            <Card hover={false} className="p-5 border border-gray-150 rounded-2xl bg-white text-left shadow-xs flex flex-col justify-between">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Pending Assignments</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-black text-amber-650">{summary.stats.pending_assignments}</span>
                <span className="text-gray-500 text-xs font-semibold">Todo</span>
              </div>
            </Card>

            <Card hover={false} className="p-5 border border-gray-150 rounded-2xl bg-white text-left shadow-xs flex flex-col justify-between">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Upcoming Classes</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-black text-indigo-650">{summary.stats.upcoming_live_sessions}</span>
                <span className="text-gray-500 text-xs font-semibold">Live</span>
              </div>
            </Card>
          </div>
        ) : null}

        {/* Continue Learning Widget */}
        {!summaryLoading && summary?.continue_learning && (
          <Card hover={false} className="p-6 border border-purple-100 bg-purple-50/40 rounded-2xl text-left flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[9px] font-bold text-purple-700 bg-purple-100 uppercase rounded border border-purple-200">Next Up</span>
                <span className="text-xs text-purple-600 font-bold uppercase tracking-wide">{summary.continue_learning.course_code}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 leading-snug">
                {summary.continue_learning.material_title}
              </h3>
              <p className="text-gray-500 text-xs font-semibold">
                Module: {summary.continue_learning.module_title} • {summary.continue_learning.course_name}
              </p>
            </div>

            <Button
              variant="primary"
              className="py-2 px-6 font-bold text-xs shadow-sm shrink-0 mt-2 md:mt-0"
              onClick={() => navigate(`/courses/${summary.continue_learning.course_id}`)}
            >
              Resume Learning
            </Button>
          </Card>
        )}

        {/* Filter Controls & Layout toggler */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by course name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200/80 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-900"
            />
          </div>

          {/* Local Course Filters */}
          <div className="flex bg-gray-150 rounded-lg p-0.5 border border-gray-200/50">
            {["all", "in_progress", "completed"].map((f) => (
              <button
                key={f}
                onClick={() => setCourseFilter(f)}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer capitalize ${
                  courseFilter === f ? "bg-white text-purple-650 shadow-xs" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {f.replace("_", " ")}
              </button>
            ))}
          </div>

          {/* Toggle buttons */}
          <div className="flex items-center gap-3 shrink-0">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-0.5 border border-gray-200/50">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-all cursor-pointer ${
                  viewMode === "grid" ? "bg-white text-purple-600 shadow-xs" : "text-gray-400 hover:text-gray-600"
                }`}
                title="Grid View"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-all cursor-pointer ${
                  viewMode === "list" ? "bg-white text-purple-600 shadow-xs" : "text-gray-400 hover:text-gray-600"
                }`}
                title="List View"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Refetch button */}
            <Button
              variant="secondary"
              size="md"
              className="py-2.5 px-3.5 cursor-pointer"
              onClick={() => {
                refetchCourses();
                refetchSummary();
              }}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.5" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Dashboard Content Lists */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Spinner size="lg" />
            <span className="text-gray-500 font-semibold text-sm">Loading enrolled courses...</span>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-center space-y-4">
            <div className="text-red-700 font-bold text-lg">Failed to load courses</div>
            <p className="text-sm text-red-600">{error}</p>
            <Button variant="danger" size="md" onClick={refetchCourses}>
              Retry Query
            </Button>
          </div>
        ) : sortedCourses.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-150 p-16 text-center space-y-4 shadow-sm">
            <div className="h-16 w-16 bg-gray-55 rounded-full flex items-center justify-center mx-auto text-gray-400">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">No courses found</h3>
            <p className="text-gray-500 max-w-sm mx-auto text-sm">
              {searchQuery
                ? "We couldn't find any courses matching your search query. Clear search and try again."
                : "You are not enrolled in any courses at the moment. Contact the administrator to enroll."}
            </p>
            {searchQuery && (
              <Button variant="ghost" className="text-purple-600 font-bold text-sm" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                : "flex flex-col gap-4"
            }
          >
            {sortedCourses.map((course) => {
              const isPinned = pinnedCourses.includes(course.id);
              
              if (viewMode === "grid") {
                return (
                  <Card
                    key={course.id}
                    hover={false}
                    className="flex flex-col justify-between border border-gray-150 hover:shadow-xl hover:-translate-y-1 hover:border-purple-200/50 transition-all duration-300 rounded-2xl overflow-hidden p-0 h-full bg-white relative"
                  >
                    {/* Course Card Top Header Image */}
                    <div className="h-36 bg-gradient-to-br from-purple-600 to-indigo-700 relative flex items-center justify-center p-6 text-white text-center">
                      <span className="font-extrabold text-2xl tracking-tight drop-shadow-md">
                        {course.course_code}
                      </span>
                      {/* Pinned star button */}
                      <button
                        onClick={() => togglePinCourse(course.id)}
                        className={`absolute top-4 right-4 p-2 rounded-lg backdrop-blur-md border cursor-pointer transition-all duration-200 ${
                          isPinned
                            ? "bg-amber-450 border-amber-300 text-white"
                            : "bg-white/10 border-white/20 text-white/70 hover:bg-white/20 hover:text-white"
                        }`}
                        title={isPinned ? "Unpin Course" : "Pin Course"}
                      >
                        <svg className="h-4.5 w-4.5" fill={isPinned ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.969 0 1.371 1.24.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.18 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.97-2.883c-.783-.57-.38-1.81.588-1.81h4.907a1 1 0 00.95-.69l1.519-4.674z" />
                        </svg>
                      </button>
                    </div>

                    {/* Card Content body */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-6 text-left">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge type="purple">{course.estimated_duration}</Badge>
                          {isPinned && <Badge type="warning">Pinned</Badge>}
                        </div>
                        <h3 className="font-extrabold text-xl text-gray-900 line-clamp-1 leading-snug">
                          {course.course_name}
                        </h3>
                        <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
                          {course.description}
                        </p>
                      </div>

                      <div className="space-y-4 pt-2">
                        {/* Progress */}
                        <ProgressBar value={course.progress} />
                        
                        {/* CTA button */}
                        <Button
                          variant="primary"
                          className="w-full py-2.5 font-bold text-sm"
                          onClick={() => navigate(`/courses/${course.id}`)}
                        >
                          Go to Course
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              } else {
                // List View
                return (
                  <Card
                    key={course.id}
                    hover={false}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 border border-gray-150 hover:shadow-xl hover:border-purple-200/50 transition-all duration-300 rounded-2xl bg-white p-6 text-left"
                  >
                    {/* Course Code and Details */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
                      <div className="h-14 w-20 shrink-0 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
                        {course.course_code}
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-extrabold text-lg text-gray-900 leading-snug">
                            {course.course_name}
                          </h3>
                          <Badge type="purple">{course.estimated_duration}</Badge>
                          {isPinned && <Badge type="warning">Pinned</Badge>}
                        </div>
                        <p className="text-gray-500 text-sm line-clamp-1 leading-relaxed">
                          {course.description}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar & Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:w-1/2 shrink-0">
                      {/* Progress */}
                      <ProgressBar value={course.progress} className="flex-1" />
                      
                      {/* Action buttons */}
                      <div className="flex items-center gap-3 shrink-0">
                        {/* Toggle Pin */}
                        <button
                          onClick={() => togglePinCourse(course.id)}
                          className={`p-2.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                            isPinned
                              ? "bg-amber-50 border-amber-200 text-amber-500 hover:bg-amber-100/50"
                              : "bg-white border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                          }`}
                          title={isPinned ? "Unpin Course" : "Pin Course"}
                        >
                          <svg className="h-5 w-5" fill={isPinned ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.969 0 1.371 1.24.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.18 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.97-2.883c-.783-.57-.38-1.81.588-1.81h4.907a1 1 0 00.95-.69l1.519-4.674z" />
                          </svg>
                        </button>
                        
                        {/* Go to course button */}
                        <Button
                          variant="primary"
                          className="py-2.5 px-5 font-bold text-sm shadow-sm"
                          onClick={() => navigate(`/courses/${course.id}`)}
                        >
                          Go to Course
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              }
            })}
          </div>
        )}

        {/* Widgets section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
          {/* Recent Activity */}
          <Card hover={false} className="p-6 sm:p-8 border border-gray-150 bg-white rounded-2xl text-left space-y-6">
            <h3 className="font-bold text-lg text-gray-900 tracking-tight flex items-center gap-2">
              <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent Activity
            </h3>

            {summaryLoading ? (
              <div className="space-y-4 py-2">
                {[1, 2, 3].map((idx) => (
                  <div key={idx} className="h-10 bg-gray-100 rounded animate-pulse w-full"></div>
                ))}
              </div>
            ) : !summary?.recent_activities || summary.recent_activities.length === 0 ? (
              <div className="text-gray-400 text-sm py-4 text-center">No recent activities completed yet. Start learning!</div>
            ) : (
              <div className="space-y-4">
                {summary.recent_activities.map((act, idx) => {
                  const dateStr = act.timestamp
                    ? new Date(act.timestamp).toLocaleDateString(undefined, {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })
                    : "Recently";

                  return (
                    <div key={idx} className="flex gap-4 items-start border-b border-gray-50 last:border-0 pb-3.5 last:pb-0">
                      <div className={`p-2 rounded-lg shrink-0 ${
                        act.type === "material" ? "bg-green-50 text-green-600" : "bg-purple-50 text-purple-600"
                      }`}>
                        {act.type === "material" ? (
                          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 space-y-0.5 text-left">
                        <p className="text-sm font-bold text-gray-900 leading-normal">{act.title}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{act.course_name} • {dateStr}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Upcoming Deadlines */}
          <Card hover={false} className="p-6 sm:p-8 border border-gray-150 bg-white rounded-2xl text-left space-y-6">
            <h3 className="font-bold text-lg text-gray-900 tracking-tight flex items-center gap-2">
              <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Upcoming Deadlines & Sessions
            </h3>

            {summaryLoading ? (
              <div className="space-y-4 py-2">
                {[1, 2, 3].map((idx) => (
                  <div key={idx} className="h-10 bg-gray-100 rounded animate-pulse w-full"></div>
                ))}
              </div>
            ) : !summary?.upcoming_deadlines || summary.upcoming_deadlines.length === 0 ? (
              <div className="text-gray-400 text-sm py-4 text-center">No upcoming deadlines or sessions scheduled.</div>
            ) : (
              <div className="space-y-4">
                {summary.upcoming_deadlines.map((dead, idx) => {
                  const dateStr = dead.due_date
                    ? new Date(dead.due_date).toLocaleDateString(undefined, {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })
                    : "TBD";

                  return (
                    <div key={idx} className="flex gap-4 items-start border-b border-gray-50 last:border-0 pb-3.5 last:pb-0">
                      <div className={`p-2 rounded-lg shrink-0 ${
                        dead.type === "assignment" ? "bg-amber-50 text-amber-600" : "bg-indigo-50 text-indigo-650"
                      }`}>
                        {dead.type === "assignment" ? (
                          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        ) : (
                          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 space-y-0.5 text-left">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-gray-900 leading-normal">{dead.title}</p>
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                            dead.type === "assignment" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          }`}>
                            {dead.type === "assignment" ? "Due Date" : "Live Session"}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{dead.course_name} • {dateStr}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
