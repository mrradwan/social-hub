import React, { useState, useEffect } from "react";
import { NavLink, Link } from "react-router"; 

// --- Icons & UI Components ---
import { 
  LuNewspaper, 
  LuSparkles, 
  LuEarth, 
  LuBookmark, 
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
 * MobileNav Component
 * Provides a mobile-friendly navigation menu and a collapsible "Suggested Friends" list.
 * Hidden on extra-large (xl) screens.
 */
export default function MobileNav() {
  // --- Local States ---
  const [showFriends, setShowFriends] = useState(false); 
  const [hasFetched, setHasFetched] = useState(false);   
  
  // Suggestions logic states
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [followLoaders, setFollowLoaders] = useState({});

  /**
   * Fetch suggestions ONLY when the user opens the accordion for the first time.
   */
  useEffect(() => {
    if (showFriends && !hasFetched) {
      fetchSuggestions();
      setHasFetched(true);
    }
  }, [showFriends, hasFetched]);

  // Fetches follow suggestions from the API
  const fetchSuggestions = async () => {
    try {
      setIsLoading(true);
      const response = await getFollowSuggestions(3); 
      const usersArray = response.data?.suggestions || [];
      setSuggestions(Array.isArray(usersArray) ? usersArray : []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]); 
    } finally {
      setIsLoading(false);
    }
  };

  // Handles Optimistic UI follow/unfollow functionality
  const handleFollow = async (userId) => {
    try {
      setFollowLoaders(prev => ({ ...prev, [userId]: true })); 
      await toggleFollowUser(userId);
      
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
      setFollowLoaders(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Filter the list based on search input
  const filteredSuggestions = suggestions.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /**
   * 💡 Dynamic class function for NavLinks
   * Returns active styling (blue) if the link matches the current URL,
   * otherwise returns the default styling (gray).
   */
  const navClass = ({ isActive }) =>
    `flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition ${
      isActive
        ? "bg-[#e7f3ff] text-[#1877f2]" // Active styling
        : "bg-slate-50 text-slate-700 hover:bg-slate-100" // Default styling
    }`;

  return (
    <div className="mb-4 space-y-4 xl:hidden">
      
      {/* --- Top Navigation Links --- */}
      <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <NavLink to="/" className={navClass}>
            <LuNewspaper /> Feed
          </NavLink>
          <NavLink to="/userposts" className={navClass}>
            <LuSparkles /> My Posts
          </NavLink>
          <NavLink to="/community" className={navClass}>
            <LuEarth /> Community
          </NavLink>
          <NavLink to="/saved" className={navClass}>
            <LuBookmark /> Saved
          </NavLink>
        </div>
      </div>

      {/* --- Collapsible Suggested Friends Section --- */}
      <div className="relative">
        <button
          onClick={() => setShowFriends(!showFriends)}
          type="button"
          className="inline-flex w-full cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition hover:bg-slate-50"
        >
          <span className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-900">
            <LuUsers className="text-[#1877f2]" />
            Suggested Friends
          </span>
          <span className="inline-flex items-center gap-2">
            {!isLoading && filteredSuggestions.length > 0 && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                {filteredSuggestions.length}
              </span>
            )}
            <span className="text-xs font-bold text-[#1877f2]">
              {showFriends ? "Hide" : "Show"}
            </span>
          </span>
        </button>

        {/* --- Dropdown Content --- */}
        {showFriends && (
          <div className="mt-2 animate-in fade-in slide-in-from-top-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            
            {/* Search Input */}
            <div className="mb-3">
              <label className="relative block">
                <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search friends..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-[#1877f2] focus:bg-white"
                />
              </label>
            </div>

            {/* Suggestions List */}
            <div className="space-y-3">
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <FaSpinner className="animate-spin text-2xl text-[#1877f2]" />
                </div>
              ) : filteredSuggestions.length > 0 ? (
                filteredSuggestions.map((user) => (
                  <div key={user._id} className="rounded-xl border border-slate-200 p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <Link 
                        to={`/profile/${user._id}`} 
                        className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-lg px-1 py-1 text-left transition hover:bg-slate-50"
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

                    {user.followersCount !== undefined && (
                      <div className="mt-2 flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5">
                          {user.followersCount} followers
                        </span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="py-2 text-center text-sm text-slate-500">No suggestions found.</p>
              )}
            </div>

            {/* View More Link */}
            {!isLoading && suggestions.length > 0 && (
              <Link 
                to="/suggested" 
                className="mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
              >
                View more
              </Link>
            )}
          </div>
        )}
      </div>

    </div>
  );
}