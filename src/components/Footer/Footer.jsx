import React, { useState, useEffect } from "react";
import { Link } from "react-router";

// --- Icons & UI Components ---
import { LuUsers, LuSearch, LuUserPlus, LuUserCheck } from "react-icons/lu";
import { FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";

// --- Services & Helpers ---
import { getAvatar } from "../lib/HelperFunctions/fn";
import { getFollowSuggestions, toggleFollowUser } from "../../services/userService";

/**
 * Footer / Suggested Friends Sidebar Component
 * Displays a list of suggested users to follow with search functionality.
 */
export default function Footer() {
  // --- Local States ---
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Tracks loading state for individual follow buttons (keyed by userId)
  const [followLoaders, setFollowLoaders] = useState({});

  // Fetch suggestions on component mount
  useEffect(() => {
    fetchSuggestions();
  }, []);

  /**
   * Fetches follow suggestions from the API and updates the state.
   */
  const fetchSuggestions = async () => {
    try {
      setIsLoading(true);
      const response = await getFollowSuggestions(5); 
      
      // Extract the suggestions array based on the API response structure
      const usersArray = response.data?.suggestions || [];

      // Ensure the result is a valid array before setting state
      if (Array.isArray(usersArray)) {
        setSuggestions(usersArray);
      } else {
        setSuggestions([]); 
      }
      
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]); 
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles following/unfollowing a user.
   * Uses Optimistic UI updates for a faster user experience.
   * * @param {string} userId - The ID of the user to follow/unfollow
   */
  const handleFollow = async (userId) => {
    try {
      // Activate the spinner for this specific user's button
      setFollowLoaders(prev => ({ ...prev, [userId]: true })); 
      
      await toggleFollowUser(userId);
      
      // Optimistic UI Update: Toggle the isFollowing status locally
      setSuggestions(prev => prev.map(user => {
        if (user._id === userId) {
          return { ...user, isFollowing: !user.isFollowing };
        }
        return user;
      }));
      
    } catch (error) {
      console.error("Follow error:", error);
      toast.error("Failed to update follow status.");
    } finally {
      // Deactivate the spinner
      setFollowLoaders(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Filter the suggestions list based on the search input
  const filteredSuggestions = suggestions.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="hidden h-fit w-full max-w-xs xl:sticky xl:top-21 xl:block">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        
        {/* --- Header --- */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <LuUsers className="text-[#1877f2]" />
            <h3 className="text-base font-extrabold text-slate-900">
              Suggested Friends
            </h3>
          </div>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
            {filteredSuggestions.length}
          </span>
        </div>

        {/* --- Search Bar --- */}
        <div className="mb-3">
          <label className="relative block">
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search suggestions..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-[#1877f2] focus:bg-white"
            />
          </label>
        </div>

        {/* --- Suggestions List --- */}
        <div className="custom-scrollbar max-h-[50vh] space-y-3 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="flex justify-center py-6">
              <FaSpinner className="animate-spin text-2xl text-[#1877f2]" />
            </div>
          ) : filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((user) => (
              <div key={user._id} className="rounded-xl border border-slate-200 bg-white p-2.5 transition hover:border-[#c7dafc]">
                <div className="flex items-center justify-between gap-2">
                  
                  {/* User Profile Link */}
                  <Link
                    to={`/profile/${user._id}`}
                    className="flex min-w-0 flex-1 items-center gap-2 rounded-lg py-1 text-left transition"
                  >
                    <img
                      src={getAvatar(user.photo)}
                      alt={user.name}
                      className="h-10 w-10 rounded-full border border-slate-100 object-cover"
                    />
                    <div className="min-w-0 flex-1">
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

                {/* Followers Count */}
                {user.followersCount !== undefined && (
                  <div className="mt-2 flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                    <span className="rounded-full border border-slate-100 bg-slate-50 px-2 py-0.5">
                      {user.followersCount} followers
                    </span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="py-4 text-center text-sm text-slate-500">No suggestions found.</p>
          )}
        </div>

        {/* --- View More Link --- */}
        {!isLoading && suggestions.length > 0 && (
          <Link 
            to="/suggested" 
            className="mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
          >
            View more
          </Link>
        )}
      </div>
    </aside>
  );
}