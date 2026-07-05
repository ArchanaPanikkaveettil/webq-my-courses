import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Spinner from "../ui/Spinner";

export default function GlobalSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Debouncing search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    const handler = setTimeout(async () => {
      try {
        const response = await api.get(`search/?q=${encodeURIComponent(query)}`);
        setResults(response.data);
      } catch (err) {
        console.error("Search failed:", err);
        setError("Failed to fetch search results.");
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(handler);
  }, [query]);

  // Click outside listener to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectResult = (item) => {
    setIsOpen(false);
    setQuery("");
    setResults(null);

    if (item.type === "course") {
      navigate(`/courses/${item.id}`, { state: { activeTab: "syllabus" } });
    } else if (item.type === "module") {
      navigate(`/courses/${item.course_id}`, { state: { activeTab: "syllabus" } });
    } else if (item.type === "material") {
      navigate(`/courses/${item.course_id}`, { state: { activeTab: "syllabus" } });
    } else if (item.type === "assignment") {
      navigate(`/courses/${item.course_id}`, { state: { activeTab: "assignments" } });
    } else if (item.type === "live_session") {
      navigate(`/courses/${item.course_id}`, { state: { activeTab: "live_sessions" } });
    }
  };

  const highlightMatch = (text, q) => {
    if (!q) return text;
    const regex = new RegExp(`(${q})`, "gi");
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === q.toLowerCase() ? (
            <mark key={i} className="bg-purple-100 text-purple-900 font-bold px-0.5 rounded-sm">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const hasResults = results && (
    results.courses.length > 0 ||
    results.modules.length > 0 ||
    results.materials.length > 0 ||
    results.assignments.length > 0 ||
    results.live_sessions.length > 0
  );

  return (
    <div ref={containerRef} className="relative w-full max-w-md font-sans">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Global search courses, syllabus, tasks..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full bg-gray-50 hover:bg-gray-100/70 focus:bg-white pl-9 pr-8 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs sm:text-sm text-gray-800 transition-all font-semibold"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults(null);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && (query.trim().length >= 2 || loading || error) && (
        <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-150 shadow-xl z-50 max-h-[450px] overflow-y-auto p-2 scrollbar-thin text-left">
          
          {loading && (
            <div className="flex items-center justify-center py-8 gap-2.5 text-gray-500 text-xs font-semibold">
              <Spinner size="sm" />
              Searching database...
            </div>
          )}

          {error && (
            <div className="text-center py-6 text-red-500 text-xs font-semibold">
              {error}
            </div>
          )}

          {!loading && !error && !hasResults && (
            <div className="text-center py-8 text-gray-400 text-xs font-semibold space-y-1">
              <p className="text-gray-900 font-bold">No results found</p>
              <p>Try searching for another keyword or term.</p>
            </div>
          )}

          {!loading && !error && hasResults && (
            <div className="space-y-4 p-1">
              {/* Category: Courses */}
              {results.courses.length > 0 && (
                <div>
                  <h4 className="px-3 py-1 text-[10px] font-bold text-purple-600 uppercase tracking-wider bg-purple-50 rounded-lg">
                    📚 Courses
                  </h4>
                  <div className="mt-1 space-y-0.5">
                    {results.courses.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => handleSelectResult(c)}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-xl transition-colors flex items-center justify-between text-xs font-semibold text-gray-700 cursor-pointer"
                      >
                        <span>{highlightMatch(c.title, query)}</span>
                        <span className="text-[10px] font-bold uppercase text-gray-400">{c.code}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Category: Modules */}
              {results.modules.length > 0 && (
                <div>
                  <h4 className="px-3 py-1 text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 rounded-lg">
                    📂 Syllabus Modules
                  </h4>
                  <div className="mt-1 space-y-0.5">
                    {results.modules.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => handleSelectResult(m)}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-xl transition-colors text-xs font-semibold text-gray-700 cursor-pointer"
                      >
                        <p className="font-bold text-gray-900">{highlightMatch(m.title, query)}</p>
                        <p className="text-[10px] text-gray-400 font-semibold">{m.course_name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Category: Study Materials */}
              {results.materials.length > 0 && (
                <div>
                  <h4 className="px-3 py-1 text-[10px] font-bold text-green-600 uppercase tracking-wider bg-green-50 rounded-lg">
                    📝 Study Materials
                  </h4>
                  <div className="mt-1 space-y-0.5">
                    {results.materials.map((sm) => (
                      <button
                        key={sm.id}
                        onClick={() => handleSelectResult(sm)}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-xl transition-colors flex items-center justify-between text-xs font-semibold text-gray-700 cursor-pointer"
                      >
                        <div className="space-y-0.5 flex-1 pr-2">
                          <p className="font-bold text-gray-900 leading-snug">{highlightMatch(sm.title, query)}</p>
                          <p className="text-[10px] text-gray-400 font-semibold">{sm.course_name}</p>
                        </div>
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-green-100 text-green-700 rounded-md border border-green-200 shrink-0">
                          {sm.material_type}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Category: Assignments */}
              {results.assignments.length > 0 && (
                <div>
                  <h4 className="px-3 py-1 text-[10px] font-bold text-amber-600 uppercase tracking-wider bg-amber-50 rounded-lg">
                    ✏️ Assignments
                  </h4>
                  <div className="mt-1 space-y-0.5">
                    {results.assignments.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => handleSelectResult(a)}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-xl transition-colors text-xs font-semibold text-gray-700 cursor-pointer"
                      >
                        <p className="font-bold text-gray-900">{highlightMatch(a.title, query)}</p>
                        <p className="text-[10px] text-gray-400 font-semibold">{a.course_name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Category: Live Sessions */}
              {results.live_sessions.length > 0 && (
                <div>
                  <h4 className="px-3 py-1 text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 rounded-lg">
                    🎥 Live Sessions
                  </h4>
                  <div className="mt-1 space-y-0.5">
                    {results.live_sessions.map((ls) => (
                      <button
                        key={ls.id}
                        onClick={() => handleSelectResult(ls)}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-xl transition-colors text-xs font-semibold text-gray-700 cursor-pointer"
                      >
                        <p className="font-bold text-gray-900">{highlightMatch(ls.title, query)}</p>
                        <p className="text-[10px] text-gray-400 font-semibold">{ls.course_name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
