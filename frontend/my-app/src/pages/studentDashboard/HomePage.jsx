import { API } from "@/api/Axios";
import { BookOpen, ChevronRight, Search, Sparkles, Layers } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  const [subjects, setSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await API.get("/api/subjects");
        setSubjects(res.data.subjects || []);
      } catch (err) {
        console.error("Error fetching subjects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  const filteredSubjects = subjects.filter((sub) => sub.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Learning Dashboard</h1>
            </div>
            <p className="mt-1 text-sm text-slate-500">Select a subject below to explore chapters and study materials.</p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          /* Skeleton Loader Grid */
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-40 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm animate-pulse flex flex-col justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-100" />
                  <div className="h-5 w-32 rounded bg-slate-100" />
                </div>
                <div className="h-4 w-24 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : filteredSubjects.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">{searchQuery ? "No matching subjects found" : "No subjects available"}</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-sm">
              {searchQuery ? `Try searching for something else standard or clear the query.` : "Check back later when new subjects are published."}
            </p>
          </div>
        ) : (
          /* Subjects Cards Grid */
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSubjects.map((sub) => (
              <Link
                key={sub._id}
                to={`/subjects/${sub._id}`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">Subject</span>
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-slate-800 transition-colors group-hover:text-primary">{sub.name}</h3>
                  {sub.description && <p className="mt-1 line-clamp-2 text-sm text-slate-500">{sub.description}</p>}
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold text-primary">
                  <span>Explore Coursework</span>
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
