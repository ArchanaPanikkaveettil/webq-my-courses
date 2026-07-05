import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import useApi from "../hooks/useApi";
import api from "../api/axios";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import ProgressBar from "../components/ui/ProgressBar";
import Badge from "../components/ui/Badge";
import Spinner from "../components/ui/Spinner";
import Modal from "../components/ui/Modal";

// Fetch course details helper (static, defined outside component scope)
const fetchCourseDetails = (courseId) => api.get(`my-courses/${courseId}/`);

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [expandedModules, setExpandedModules] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [toggleLoading, setToggleLoading] = useState({});
  const [activeTab, setActiveTab] = useState("syllabus");
  const [submitting, setSubmitting] = useState({});
  const [selectedSession, setSelectedSession] = useState(null);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);

  const location = useLocation();

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location]);

  // Tabbed Filters
  const [moduleFilter, setModuleFilter] = useState("all");
  const [materialFilter, setMaterialFilter] = useState("all");
  const [materialTypeFilter, setMaterialTypeFilter] = useState("all");
  const [assignmentFilter, setAssignmentFilter] = useState("all");
  const [liveSessionFilter, setLiveSessionFilter] = useState("all");

  const handleAssignSubmit = async (assignmentId) => {
    if (submitting[assignmentId]) return;

    setSubmitting((prev) => ({ ...prev, [assignmentId]: true }));
    try {
      const response = await api.post(`assignments/${assignmentId}/submit/`);
      const updatedSubmission = response.data;

      setData((prevCourse) => {
        if (!prevCourse) return prevCourse;
        const updatedAssignments = prevCourse.assignments.map((assignment) => {
          if (assignment.id === assignmentId) {
            return {
              ...assignment,
              submission: updatedSubmission
            };
          }
          return assignment;
        });
        return {
          ...prevCourse,
          assignments: updatedAssignments
        };
      });
    } catch (err) {
      console.error("Failed to submit assignment:", err);
      alert("Failed to submit assignment. Please try again.");
    } finally {
      setSubmitting((prev) => ({ ...prev, [assignmentId]: false }));
    }
  };

  const toggleModuleExpand = (moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  // Call API using useApi hook (immediate=false to trigger fetch manually with ID)
  const { data: course, loading, error, execute: refetchCourse, setData } = useApi(fetchCourseDetails, false);

  // Fetch course details when ID changes
  useEffect(() => {
    if (id) {
      refetchCourse(id).catch((err) => {
        console.error("Error fetching course details:", err);
      });
    }
  }, [id, refetchCourse]);

  // Helper to find the first incomplete material/module
  const getFirstIncompleteMaterial = () => {
    if (!course || !course.modules) return null;
    for (const module of course.modules) {
      if (module.materials) {
        for (const material of module.materials) {
          if (!material.completed) {
            return { module, material };
          }
        }
      }
    }
    return null;
  };

  const getSessionStatus = (session) => {
    const now = new Date();
    const start = new Date(session.scheduled_at);
    const end = new Date(start.getTime() + session.duration_minutes * 60 * 1000);

    if (now >= start && now <= end) {
      return { label: "Live", type: "success", isLive: true, isCompleted: false };
    } else if (now < start) {
      return { label: "Upcoming", type: "purple", isLive: false, isCompleted: false };
    } else {
      return { label: "Completed", type: "neutral", isLive: false, isCompleted: true };
    }
  };

  const handleJoinSession = (session) => {
    if (!session.meeting_link || session.meeting_link.trim() === "" || session.meeting_link.includes("placeholder")) {
      setSelectedSession(session);
      setIsSessionModalOpen(true);
    } else {
      window.open(session.meeting_link, "_blank");
    }
  };

  const handleOpenMaterial = (material) => {
    if (!material.resource_url || material.resource_url.includes("example.com")) {
      setSelectedMaterial(material);
      setIsModalOpen(true);
    } else {
      window.open(material.resource_url, "_blank");
    }
  };

  const handleToggleCompletion = async (materialId) => {
    if (toggleLoading[materialId]) return;

    setToggleLoading((prev) => ({ ...prev, [materialId]: true }));
    try {
      const response = await api.post(`materials/${materialId}/toggle/`);
      const { completed, course_progress } = response.data;

      setData((prevCourse) => {
        if (!prevCourse) return prevCourse;
        const updatedModules = prevCourse.modules.map((mod) => {
          const updatedMaterials = mod.materials.map((mat) => {
            if (mat.id === materialId) {
              return { ...mat, completed };
            }
            return mat;
          });
          return { ...mod, materials: updatedMaterials };
        });
        return { ...prevCourse, progress: course_progress, modules: updatedModules };
      });
    } catch (err) {
      console.error("Failed to toggle completion status:", err);
      alert("An error occurred while updating completion status. Please try again.");
    } finally {
      setToggleLoading((prev) => ({ ...prev, [materialId]: false }));
    }
  };

  const handleContinueLearning = () => {
    const nextItem = getFirstIncompleteMaterial();
    if (nextItem) {
      handleOpenMaterial(nextItem.material);
    } else {
      alert("Congratulations! You have completed all study materials in this course.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center space-y-4 font-sans">
        <Spinner size="lg" />
        <span className="text-gray-500 font-semibold text-sm">Loading course details...</span>
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
          <h2 className="text-xl font-bold text-gray-900">Access Restricted</h2>
          <p className="text-sm text-gray-500 leading-relaxed font-semibold">
            {error.includes("enrolled") 
              ? "You are not enrolled in this course. Please contact your administrator." 
              : error}
          </p>
          <Button variant="primary" className="w-full py-2.5 font-bold" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  const totalModules = course.modules ? course.modules.length : 0;
  const nextIncomplete = getFirstIncompleteMaterial();

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

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge type="warning" className="px-3 py-1 text-xs uppercase tracking-wide font-bold">
                {course.course_code}
              </Badge>
              <Badge type="purple" className="px-3 py-1 text-xs uppercase tracking-wide font-bold">
                {course.estimated_duration}
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              {course.course_name}
            </h1>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 -mb-px" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("syllabus")}
              className={`py-4 px-1 border-b-2 font-bold text-sm cursor-pointer whitespace-nowrap transition-all ${
                activeTab === "syllabus"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Syllabus & Coursework
            </button>
            <button
              onClick={() => setActiveTab("assignments")}
              className={`py-4 px-1 border-b-2 font-bold text-sm cursor-pointer whitespace-nowrap transition-all ${
                activeTab === "assignments"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Assignments ({course.assignments ? course.assignments.length : 0})
            </button>
            <button
              onClick={() => setActiveTab("live_sessions")}
              className={`py-4 px-1 border-b-2 font-bold text-sm cursor-pointer whitespace-nowrap transition-all ${
                activeTab === "live_sessions"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Live Sessions ({course.live_sessions ? course.live_sessions.length : 0})
            </button>
          </nav>
        </div>
      </div>

      {/* Workspace Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-8">
            {activeTab === "syllabus" && (
              <>
                {/* About Course Card */}
                <Card hover={false} className="p-8 border border-gray-150 rounded-2xl shadow-xs bg-white text-left">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">About this Course</h2>
                  <p className="text-gray-600 leading-relaxed text-base whitespace-pre-line">
                    {course.description}
                  </p>
                </Card>

                {/* Syllabus Overview Accordion */}
                <Card hover={false} className="p-8 border border-gray-150 rounded-2xl shadow-xs bg-white text-left">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Syllabus Outline</h2>
                    <Badge type="purple" className="font-bold">{totalModules} Modules</Badge>
                  </div>

                  {/* Modules local filters */}
                  <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-gray-150 space-y-4 text-left">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Smart Filters</span>
                      {(moduleFilter !== "all" || materialFilter !== "all" || materialTypeFilter !== "all") && (
                        <button
                          onClick={() => {
                            setModuleFilter("all");
                            setMaterialFilter("all");
                            setMaterialTypeFilter("all");
                          }}
                          className="text-xs text-purple-650 hover:text-purple-800 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      {/* Module Status Selector */}
                      <div className="space-y-1.5">
                        <label className="font-bold text-gray-400 uppercase tracking-wide block">Modules</label>
                        <select
                          value={moduleFilter}
                          onChange={(e) => setModuleFilter(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-purple-500 font-semibold text-gray-700"
                        >
                          <option value="all">All Modules</option>
                          <option value="completed">Completed</option>
                          <option value="incomplete">Incomplete</option>
                        </select>
                      </div>

                      {/* Materials Status Selector */}
                      <div className="space-y-1.5">
                        <label className="font-bold text-gray-400 uppercase tracking-wide block">Materials Status</label>
                        <select
                          value={materialFilter}
                          onChange={(e) => setMaterialFilter(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-purple-500 font-semibold text-gray-700"
                        >
                          <option value="all">All Statuses</option>
                          <option value="completed">Completed Only</option>
                          <option value="pending">Pending Only</option>
                        </select>
                      </div>

                      {/* Materials Type Selector */}
                      <div className="space-y-1.5">
                        <label className="font-bold text-gray-400 uppercase tracking-wide block">Materials Type</label>
                        <select
                          value={materialTypeFilter}
                          onChange={(e) => setMaterialTypeFilter(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-purple-500 font-semibold text-gray-700"
                        >
                          <option value="all">All Types</option>
                          <option value="PDF">PDF Documents</option>
                          <option value="VIDEO">Video Lessons</option>
                          <option value="NOTE">Lecture Notes</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {(() => {
                    const filteredModules = (course.modules || [])
                      .map((mod) => {
                        const filteredMaterials = (mod.materials || []).filter((material) => {
                          let matchesStatus = true;
                          if (materialFilter === "completed") {
                            matchesStatus = material.completed;
                          } else if (materialFilter === "pending") {
                            matchesStatus = !material.completed;
                          }

                          let matchesType = true;
                          if (materialTypeFilter !== "all") {
                            matchesType = material.material_type === materialTypeFilter;
                          }

                          return matchesStatus && matchesType;
                        });

                        const originalCompleted = mod.materials && mod.materials.length > 0 && mod.materials.every(m => m.completed);

                        return {
                          ...mod,
                          materials: filteredMaterials,
                          isCompleted: originalCompleted
                        };
                      })
                      .filter((mod) => {
                        if (moduleFilter === "completed") {
                          return mod.isCompleted;
                        } else if (moduleFilter === "incomplete") {
                          return !mod.isCompleted;
                        }
                        return true;
                      });

                    return filteredModules.length === 0 ? (
                      <div className="text-gray-500 text-sm text-center py-6">No matching modules or materials found.</div>
                    ) : (
                      <div className="space-y-4">
                        {filteredModules.map((mod, idx) => {
                          const isCompleted = mod.isCompleted;
                          const isExpanded = !!expandedModules[mod.id];

                        return (
                          <div 
                            key={mod.id}
                            className="border border-gray-200/80 rounded-xl overflow-hidden bg-white shadow-xs transition-all duration-200"
                          >
                            {/* Accordion Header */}
                            <div 
                              onClick={() => toggleModuleExpand(mod.id)}
                              className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 cursor-pointer select-none transition-colors"
                            >
                              <div className="flex items-center gap-4 flex-1">
                                {/* Completion Icon */}
                                <div className="shrink-0">
                                  {isCompleted ? (
                                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-green-600" title="Module Completed">
                                      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                      </svg>
                                    </div>
                                  ) : (
                                    <div className="h-6 w-6 rounded-full border-2 border-gray-300 flex items-center justify-center" title="Module Incomplete">
                                      <div className="h-2 w-2 rounded-full bg-transparent" />
                                    </div>
                                  )}
                                </div>

                                {/* Title & Desc */}
                                <div className="text-left">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Module {idx + 1}</span>
                                    {isCompleted && <Badge type="success" className="text-[10px] py-0.5 px-1.5 font-bold">Done</Badge>}
                                  </div>
                                  <h4 className="font-bold text-gray-900 text-sm sm:text-base leading-snug">{mod.title}</h4>
                                  {mod.description && (
                                    <p className="text-gray-500 text-xs mt-0.5 leading-normal">{mod.description}</p>
                                  )}
                                </div>
                              </div>

                              {/* Toggle Arrow */}
                              <div className="text-gray-400 pl-4">
                                <svg 
                                  className={`h-5 w-5 transform transition-transform duration-250 ${isExpanded ? "rotate-180" : ""}`} 
                                  fill="none" 
                                  viewBox="0 0 24 24" 
                                  stroke="currentColor"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>

                            {/* Accordion Body (Expanded Content) */}
                            {isExpanded && (
                              <div className="border-t border-gray-150 p-4 bg-white space-y-3.5 divide-y divide-gray-100/50 animate-fade-in-up">
                                {mod.materials && mod.materials.length > 0 ? (
                                  mod.materials.map((material) => (
                                    <div key={material.id} className="flex items-center justify-between text-sm pt-3 first:pt-0">
                                      <div className="flex items-center gap-3 text-gray-700">
                                        {/* Material Type Icon */}
                                        <div className="shrink-0">
                                          {material.material_type === "PDF" && (
                                            <svg className="h-4.5 w-4.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                          )}
                                          {material.material_type === "VIDEO" && (
                                            <svg className="h-4.5 w-4.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                          )}
                                          {material.material_type === "NOTE" && (
                                            <svg className="h-4.5 w-4.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                          )}
                                          {material.material_type !== "PDF" && material.material_type !== "VIDEO" && material.material_type !== "NOTE" && (
                                            <svg className="h-4.5 w-4.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                          )}
                                        </div>
                                        <span className="font-medium text-gray-750">{material.title}</span>
                                      </div>
                                      
                                      {/* Completion & Action Buttons */}
                                      <div className="flex items-center gap-2.5 shrink-0 pl-4">
                                        <Button
                                          variant="secondary"
                                          size="sm"
                                          className="py-1 px-3 text-xs font-semibold"
                                          onClick={() => handleOpenMaterial(material)}
                                        >
                                          Open/View
                                        </Button>

                                        {material.completed ? (
                                          <Badge type="success" className="font-bold text-xs py-1 px-3 border border-green-200">
                                            Completed
                                          </Badge>
                                        ) : (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="py-1 px-3 text-xs font-bold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100/75 border border-purple-100 rounded-lg flex items-center gap-1.5"
                                            onClick={() => handleToggleCompletion(material.id)}
                                            loading={!!toggleLoading[material.id]}
                                          >
                                            Mark as Complete
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-gray-400 text-xs py-2 text-center">No study materials in this module yet.</div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                        })}
                      </div>
                    );
                  })()}
                </Card>
              </>
            )}

            {activeTab === "assignments" && (
              <Card hover={false} className="p-8 border border-gray-150 rounded-2xl shadow-xs bg-white text-left">
                <h2 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">Course Assignments</h2>

                {/* Assignments local filters */}
                <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-gray-150 flex flex-wrap items-center justify-between gap-4 text-left">
                  <div className="flex bg-gray-150 rounded-lg p-0.5 border border-gray-200/50">
                    {["all", "pending", "submitted", "late", "graded"].map((f) => (
                      <button
                        key={f}
                        onClick={() => setAssignmentFilter(f)}
                        className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer capitalize ${
                          assignmentFilter === f ? "bg-white text-purple-650 shadow-xs" : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                  {assignmentFilter !== "all" && (
                    <button
                      onClick={() => setAssignmentFilter("all")}
                      className="text-xs text-purple-650 hover:text-purple-800 font-bold cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>

                {(() => {
                  const filtered = (course.assignments || []).filter((assign) => {
                    const sub = assign.submission;
                    const isSubmitted = sub && (sub.status === "SUBMITTED" || sub.status === "EVALUATED");
                    const isPastDue = new Date(assign.due_date) < new Date();
                    
                    if (assignmentFilter === "pending") {
                      return !isSubmitted;
                    }
                    if (assignmentFilter === "submitted") {
                      return isSubmitted;
                    }
                    if (assignmentFilter === "late") {
                      return !isSubmitted && isPastDue;
                    }
                    if (assignmentFilter === "graded") {
                      return sub && sub.status === "EVALUATED";
                    }
                    return true;
                  });

                  return filtered.length === 0 ? (
                    <div className="text-gray-500 text-sm text-center py-8">No matching assignments found.</div>
                  ) : (
                    <div className="space-y-6">
                      {filtered.map((assign) => {
                        const getAssignmentStatus = (item) => {
                          const sub = item.submission;
                          if (sub) {
                            if (sub.status === "EVALUATED") {
                              return {
                                label: `Evaluated (Grade: ${sub.grade})`,
                                type: "success",
                                isSubmitted: true
                              };
                            }
                            if (sub.status === "SUBMITTED") {
                              const isLateSub = new Date(sub.submitted_at) > new Date(item.due_date);
                              return {
                                label: isLateSub ? "Submitted (Late)" : "Submitted",
                                type: isLateSub ? "warning" : "success",
                                isSubmitted: true
                              };
                            }
                          }
                          const isPastDue = new Date(item.due_date) < new Date();
                          return {
                            label: isPastDue ? "Late" : "Pending",
                            type: isPastDue ? "danger" : "warning",
                            isSubmitted: false
                          };
                        };

                        const statusInfo = getAssignmentStatus(assign);
                        const formattedDueDate = new Date(assign.due_date).toLocaleDateString(undefined, {
                          weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        });
                        const formattedSubDate = assign.submission?.submitted_at ? new Date(assign.submission.submitted_at).toLocaleDateString(undefined, {
                          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        }) : null;

                        return (
                          <div key={assign.id} className="p-5 border border-gray-200/80 rounded-xl bg-white shadow-xs space-y-4 text-left">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                              <div className="space-y-1">
                                <h3 className="font-bold text-gray-900 text-base sm:text-lg">{assign.title}</h3>
                                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold">
                                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span>Due Date: {formattedDueDate}</span>
                                </div>
                              </div>
                              <Badge type={statusInfo.type} className="font-bold text-xs uppercase px-2.5 py-0.5">
                                {statusInfo.label}
                              </Badge>
                            </div>

                            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed whitespace-pre-line text-left">
                              {assign.description}
                            </p>

                            <div className="flex flex-wrap items-center justify-between gap-4 pt-3.5 border-t border-gray-100 text-xs">
                              <div className="text-gray-400 font-semibold text-left">
                                {assign.submission ? (
                                  <div className="space-y-1">
                                    <p>
                                      Submitted: <span className="font-bold text-gray-500">{formattedSubDate}</span>
                                    </p>
                                    {assign.submission.feedback && (
                                      <p className="p-2.5 rounded-lg bg-slate-50 border border-gray-150 text-gray-600 mt-1">
                                        <span className="font-bold block text-gray-700">Feedback:</span> {assign.submission.feedback}
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <p className="font-semibold text-amber-650">Pending submission. Please submit before the due date.</p>
                                )}
                              </div>

                              {!statusInfo.isSubmitted && (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  className="font-bold text-xs py-2 px-4 shadow-sm"
                                  onClick={() => handleAssignSubmit(assign.id)}
                                  loading={!!submitting[assign.id]}
                                >
                                  Submit Assignment
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </Card>
            )}

            {activeTab === "live_sessions" && (
              <Card hover={false} className="p-8 border border-gray-150 rounded-2xl shadow-xs bg-white text-left">
                <h2 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">Live Classes</h2>

                {/* Live Sessions local filters */}
                <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-gray-150 flex flex-wrap items-center justify-between gap-4 text-left">
                  <div className="flex bg-gray-150 rounded-lg p-0.5 border border-gray-200/50">
                    {["all", "upcoming", "live", "completed"].map((f) => (
                      <button
                        key={f}
                        onClick={() => setLiveSessionFilter(f)}
                        className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer capitalize ${
                          liveSessionFilter === f ? "bg-white text-purple-650 shadow-xs" : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                  {liveSessionFilter !== "all" && (
                    <button
                      onClick={() => setLiveSessionFilter("all")}
                      className="text-xs text-purple-650 hover:text-purple-800 font-bold cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>

                {(() => {
                  const filtered = (course.live_sessions || []).filter((session) => {
                    const statusInfo = getSessionStatus(session);
                    if (liveSessionFilter === "upcoming") {
                      return !statusInfo.isLive && !statusInfo.isCompleted;
                    }
                    if (liveSessionFilter === "live") {
                      return statusInfo.isLive;
                    }
                    if (liveSessionFilter === "completed") {
                      return statusInfo.isCompleted;
                    }
                    return true;
                  });

                  return filtered.length === 0 ? (
                    <div className="text-gray-500 text-sm text-center py-8">No matching live sessions found.</div>
                  ) : (
                    <div className="space-y-6">
                      {filtered.map((session) => {
                        const statusInfo = getSessionStatus(session);
                        
                        const startDate = new Date(session.scheduled_at);
                        const endDate = new Date(startDate.getTime() + session.duration_minutes * 60 * 1000);
                        
                        const formattedDate = startDate.toLocaleDateString(undefined, {
                          weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                        });
                        const formattedStartTime = startDate.toLocaleTimeString(undefined, {
                          hour: '2-digit', minute: '2-digit'
                        });
                        const formattedEndTime = endDate.toLocaleTimeString(undefined, {
                          hour: '2-digit', minute: '2-digit'
                        });

                        const facultyName = course.faculty ? course.faculty.name : "Course Instructor";

                        return (
                          <div key={session.id} className="p-5 border border-gray-200/80 rounded-xl bg-white shadow-xs space-y-4 text-left">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                              <div className="space-y-1 text-left">
                                <h3 className="font-bold text-gray-900 text-base sm:text-lg">{session.title}</h3>
                                <p className="text-xs text-gray-400 font-semibold flex items-center gap-1">
                                  <span className="uppercase text-purple-600 font-bold">Host:</span> {facultyName}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {statusInfo.isLive && (
                                  <span className="flex h-2.5 w-2.5 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                                  </span>
                                )}
                                <Badge type={statusInfo.type} className="font-bold text-xs uppercase px-3 py-1">
                                  {statusInfo.label}
                                </Badge>
                              </div>
                            </div>

                            {/* Session details */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-3.5 border-y border-gray-50 text-sm text-gray-600">
                              <div className="flex items-center gap-2 text-left">
                                <svg className="h-4.5 w-4.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span>{formattedDate}</span>
                              </div>
                              <div className="flex items-center gap-2 text-left">
                                <svg className="h-4.5 w-4.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{formattedStartTime} - {formattedEndTime}</span>
                              </div>
                              <div className="flex items-center gap-2 text-left">
                                <svg className="h-4.5 w-4.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{session.duration_minutes} Mins</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                              <p className="text-gray-500 text-xs sm:text-sm max-w-md text-left leading-normal">
                                Join this live interactive session with your instructor to review recent topics, ask questions, and clarify concepts.
                              </p>
                              
                              <Button
                                variant={statusInfo.isCompleted ? "secondary" : "primary"}
                                size="sm"
                                className="font-bold text-xs py-2 px-5 shadow-sm"
                                disabled={statusInfo.isCompleted}
                                onClick={() => handleJoinSession(session)}
                              >
                                {statusInfo.isCompleted ? "Ended" : "Join Meeting"}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </Card>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Progress Card */}
            <Card hover={false} className="p-6 sm:p-8 border border-gray-150 rounded-2xl shadow-xs bg-white text-left space-y-6">
              <h3 className="font-bold text-lg text-gray-900 tracking-tight">Your Progress</h3>
              
              <ProgressBar value={course.progress} />
              
              <div className="pt-2">
                <Button
                  variant="primary"
                  className="w-full py-3 font-bold text-sm shadow-md hover:shadow-lg transition-all"
                  onClick={handleContinueLearning}
                >
                  {course.progress === 100 ? "Review Content" : "Continue Learning"}
                </Button>
                {nextIncomplete && (
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    Next up: <span className="font-semibold text-gray-500">{nextIncomplete.material.title}</span>
                  </p>
                )}
              </div>
            </Card>

            {/* Instructor Profile Card */}
            <Card hover={false} className="p-6 sm:p-8 border border-gray-150 rounded-2xl shadow-xs bg-white text-left space-y-6">
              <h3 className="font-bold text-lg text-gray-900 tracking-tight">Your Instructor</h3>
              
              {course.faculty ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    {course.faculty.profile_photo ? (
                      <img
                        src={course.faculty.profile_photo}
                        alt={course.faculty.name}
                        className="h-14 w-14 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg border border-purple-200">
                        {course.faculty.name ? course.faculty.name[0].toUpperCase() : "F"}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-gray-900 text-base leading-snug">{course.faculty.name}</h4>
                      <p className="text-gray-400 text-xs mt-0.5 uppercase tracking-wider font-bold">
                        {course.faculty.department || "Faculty"}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 space-y-2.5 border-t border-gray-100 text-sm">
                    <div className="flex items-center gap-2.5 text-gray-600">
                      <svg className="h-4.5 w-4.5 text-purple-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <a href={`mailto:${course.faculty.email}`} className="hover:text-purple-600 transition-colors truncate">
                        {course.faculty.email}
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-sm text-center py-4">No instructor assigned to this classroom yet.</div>
              )}
            </Card>
          </div>
        </div>
      </main>

      {/* Study Material Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedMaterial ? selectedMaterial.title : "Study Material"}
      >
        <div className="space-y-4 text-center py-6">
          <div className="h-16 w-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            {selectedMaterial?.material_type === "PDF" && (
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
            {selectedMaterial?.material_type === "VIDEO" && (
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {selectedMaterial?.material_type === "NOTE" && (
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            )}
          </div>
          <h4 className="text-lg font-bold text-gray-900">Resource Offline</h4>
          <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
            The resource <strong>{selectedMaterial?.title}</strong> is currently offline or not yet uploaded. Please contact your instructor.
          </p>
          <div className="pt-2">
            <Button variant="primary" className="px-6 py-2 text-sm font-semibold" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Live Session Modal */}
      <Modal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        title={selectedSession ? selectedSession.title : "Live Session"}
      >
        <div className="space-y-4 text-center py-6">
          <div className="h-16 w-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h4 className="text-lg font-bold text-gray-900">Meeting Link Pending</h4>
          <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
            The meeting link for <strong>{selectedSession?.title}</strong> has not yet been published by the instructor. Please check back 5-10 minutes before the scheduled start time.
          </p>
          <div className="pt-2">
            <Button variant="primary" className="px-6 py-2 text-sm font-semibold" onClick={() => setIsSessionModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
