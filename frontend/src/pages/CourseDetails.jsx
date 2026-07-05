import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

      {/* Workspace Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-8">
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

              {totalModules === 0 ? (
                <div className="text-gray-500 text-sm text-center py-6">No modules registered for this course yet.</div>
              ) : (
                <div className="space-y-4">
                  {course.modules.map((mod, idx) => {
                    const isCompleted = mod.materials && mod.materials.length > 0 && mod.materials.every(m => m.completed);
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
              )}
            </Card>
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
    </div>
  );
}
