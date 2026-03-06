import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";

// --- Icons & UI Components ---
import { 
  LuArrowLeft, 
  LuUsers, 
  LuSearch, 
  LuUserPlus, 
  LuUserCheck 
} from "react-icons/lu";
import { FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";

// --- Services & Helpers ---
import { getAvatar } from "../lib/HelperFunctions/fn";
import { getFollowSuggestions, toggleFollowUser } from "../../services/userService";

/**
 * Suggested Component
 * Displays a full-page list of suggested users to follow.
 * Implements a client-side pagination (Load More) and a search filter for better UX.
 */
export default function Suggested() {
  const navigate = useNavigate();

  // --- Local States ---
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Tracks loading state for individual follow buttons
  const [followLoaders, setFollowLoaders] = useState({});

  // Client-side pagination state: controls how many users are visible at once
  const [visibleCount, setVisibleCount] = useState(10);

  // Fetch initial suggestions on mount
  useEffect(() => {
    fetchSuggestions();
  }, []);

  /**
   * Fetches a large batch of suggestions (e.g., 50) from the server at once.
   * This allows us to use client-side pagination to render them 10 at a time,
   * reducing the number of API calls needed.
   */
  const fetchSuggestions = async () => {
    try {
      setIsLoading(true);
      const response = await getFollowSuggestions(50);
      const usersArray = response.data?.suggestions || [];
      
      if (Array.isArray(usersArray)) {
        setSuggestions(usersArray);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles following/unfollowing a user with Optimistic UI updates.
   * @param {string} userId - ID of the user to toggle follow status
   */
  const handleFollow = async (userId) => {
    try {
      // Activate loading spinner for this specific button
      setFollowLoaders(prev => ({ ...prev, [userId]: true }));
      await toggleFollowUser(userId);
      
      // Optimistic update
      setSuggestions(prev => prev.map(user => 
        user._id === userId ? { ...user, isFollowing: !user.isFollowing } : user
      ));
    } catch (error) {
      toast.error("Failed to update follow status.");
    } finally {
      // Deactivate spinner
      setFollowLoaders(prev => ({ ...prev, [userId]: false }));
    }
  };

  // --- Data Processing (Search & Pagination) ---

  // 1. Filter the entire suggestions array based on the search query
  const filteredSuggestions = suggestions.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 2. Slice the filtered array to show only the `visibleCount` amount
  const displayedSuggestions = filteredSuggestions.slice(0, visibleCount);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      
      {/* --- Back Button --- */}
      <button 
        onClick={() => navigate(-1)}
        className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
      >
        <LuArrowLeft />
        Back to feed
      </button>

      {/* --- Main Content Section --- */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        
        {/* Header & Count Badge */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <LuUsers className="text-[#1877f2]" />
            <h1 className="text-xl font-extrabold text-slate-900">
              All Suggested Friends
            </h1>
          </div>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
            {filteredSuggestions.length}
          </span>
        </div>

        {/* Search Input */}
        <label className="relative mb-4 block">
          <LuSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or username..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-[#1877f2] focus:bg-white"
          />
        </label>

        {/* --- Render Suggestions Grid --- */}
        {isLoading ? (
          <div className="flex justify-center py-10">
            <FaSpinner className="animate-spin text-3xl text-[#1877f2]" />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {displayedSuggestions.length > 0 ? (
              displayedSuggestions.map(user => (
                <article key={user._id} className="rounded-xl border border-slate-200 bg-white p-3 transition hover:border-[#c7dafc]">
                  <div className="flex items-center justify-between gap-3">
                    
                    {/* User Info Link */}
                    <Link to={`/profile/${user._id}`} className="flex min-w-0 items-center gap-3 rounded-lg px-1 py-1 text-left transition hover:bg-slate-50">
                      <img
                        src={getAvatar(user.photo)}
                        alt={user.name}
                        className="h-12 w-12 rounded-full border border-slate-100 object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900 hover:underline">
                          {user.name}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          @{user.username || "user"}
                        </p>
                      </div>
                    </Link>
                    
                    {/* Follow/Unfollow Button */}
                    <button 
                      onClick={() => handleFollow(user._id)}
                      disabled={followLoaders[user._id]}
                      className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition disabled:opacity-60 ${
                        user.isFollowing 
                          ? "bg-slate-100 text-slate-700 hover:bg-slate-200" 
                          : "bg-[#e7f3ff] text-[#1877f2] hover:bg-[#d8ebff]"
                      }`}
                    >
                      {followLoaders[user._id] ? (
                        <FaSpinner className="animate-spin" />
                      ) : user.isFollowing ? (
                        <><LuUserCheck /> Following</>
                      ) : (
                        <><LuUserPlus /> Follow</>
                      )}
                    </button>
                  </div>

                  {/* Followers & Mutual Friends Badges */}
                  {(user.followersCount !== undefined || user.mutualCount) && (
                    <div className="mt-2 flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                      {user.followersCount !== undefined && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5">
                          {user.followersCount} followers
                        </span>
                      )}
                      {user.mutualCount && (
                        <span className="rounded-full bg-[#edf4ff] px-2 py-0.5 text-[#1877f2]">
                          {user.mutualCount} mutual
                        </span>
                      )}
                    </div>
                  )}
                </article>
              ))
            ) : (
              <p className="col-span-2 py-4 text-center text-sm text-slate-500">No suggestions found.</p>
            )}
          </div>
        )}

        {/* --- Load More Button --- */}
        {/* Only renders if there are more items in the filtered array than currently visible */}
        {!isLoading && visibleCount < filteredSuggestions.length && (
          <button 
            onClick={() => setVisibleCount(prev => prev + 10)} 
            className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
          >
            Load more users
          </button>
        )}
      </section>
    </div>
  );
}