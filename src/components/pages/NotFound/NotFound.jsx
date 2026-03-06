import React from "react";
import { Link } from "react-router";

// --- Icons ---
import { LuSearchX, LuHouse } from "react-icons/lu";

/**
 * NotFound Component (404 Page)
 * Displays a user-friendly error message when navigating to a non-existent route.
 * Matches the SocialHub design system with a clear call-to-action to return home.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center px-4 text-center">
      
      {/* --- Illustration / Icon --- */}
      {/* A soft blue circle with a search-cancel icon to represent "Not Found" */}
      <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-[#e7f3ff] shadow-inner">
        <LuSearchX className="text-7xl text-[#1877f2]" />
      </div>

      {/* --- Text Content --- */}
      <h1 className="mb-2 text-7xl font-black text-slate-900 drop-shadow-sm">
        404
      </h1>
      <h2 className="mb-4 text-2xl font-extrabold text-slate-800 sm:text-3xl">
        Oops! Page Not Found
      </h2>
      <p className="mb-8 max-w-md text-base leading-relaxed text-slate-500">
        The page you are looking for might have been removed, had its name changed, 
        or is temporarily unavailable. Let's get you back on track!
      </p>

      {/* --- Call to Action Button --- */}
      <Link
        to="/"
        className="group flex cursor-pointer items-center gap-2 rounded-xl bg-[#1877f2] px-8 py-3.5 text-sm font-bold text-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-[#166fe5] hover:shadow-md"
      >
        <LuHouse className="text-lg" />
        Back to Feed
      </Link>
      
    </div>
  );
}