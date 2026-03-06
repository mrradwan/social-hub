import React, { useState, useContext, useEffect, useRef } from "react";
import { NavLink, Link } from "react-router";

// --- Icons & UI Components ---
import {
  LuHouse,
  LuUser,
  LuMessageCircle,
  LuMenu,
  LuSettings,
  LuLogOut,
} from "react-icons/lu";
import { Skeleton } from "@heroui/react";
import { toast } from "react-toastify";

// --- Context & Services ---
import { AuthContext } from "../../context/AuthContext";
import { ProfileContext } from "../../context/ProfileContext";
import { getUnreadCount, getNotifications } from "../../services/notificationsService";
import dAvatar from "../../img/default-profile.png";

/**
 * Navbar Component
 * Main top navigation bar featuring active route highlighting, user dropdown menu, 
 * and real-time notification polling with toast alerts.
 */
export default function Navbar() {
  // --- Local States ---
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // useRef is used to track the previous notification count without triggering re-renders
  const prevCountRef = useRef(0);

  // --- Contexts ---
  const { setToken } = useContext(AuthContext);
  const { profileData, isLoadingProfile } = useContext(ProfileContext);

  /**
   * Polls the server for new notifications every 10 seconds.
   * If the unread count increases, it fetches the latest notification and displays a toast.
   */
  useEffect(() => {
    const checkNewNotifications = async () => {
      if (!localStorage.getItem("userToken")) return;

      try {
        // 1. Fetch total unread count
        const countRes = await getUnreadCount();
        const currentCount = countRes.data?.unreadCount || 0;

        // 2. Compare: If count increased since last check, trigger toast
        if (currentCount > prevCountRef.current && prevCountRef.current !== 0) {
          
          // 3. Fetch recent notifications to get the latest one
          const notifsRes = await getNotifications(true);
          const notifications = notifsRes.data?.notifications || [];
          
          // The last item in the array is usually the newest notification
          const latestNotif = notifications[notifications.length - 1];

          if (latestNotif) {
            const actorName = latestNotif.actor?.name || "Someone";
            let actionText = "interacted with your post";

            // Format notification message based on type
            if (latestNotif.type === "like_post") {
              actionText = "liked your post";
            } else if (latestNotif.type === "comment_post") {
              actionText = "commented on your post";
            } else if (latestNotif.type === "follow") {
              actionText = "started following you";
            }

            // Display Facebook-style toast
            toast.info(`🔔 ${actorName} ${actionText}`, {
              position: "bottom-right",
              autoClose: 5000,
              hideProgressBar: true,
              theme: "light",
            });
          }
        }

        // Update states for the next polling cycle
        setUnreadCount(currentCount);
        prevCountRef.current = currentCount;
      } catch (error) {
        console.error("Error polling notifications:", error);
      }
    };

    // Initial check on mount
    checkNewNotifications();
    
    // Set interval for continuous polling (every 10 seconds)
    const intervalId = setInterval(checkNewNotifications, 10000);
    return () => clearInterval(intervalId);
  }, []);

  /**
   * Clears the user token from local storage and context, logging the user out.
   */
  function handleLogout() {
    localStorage.removeItem("userToken");
    setToken(null);
  }

  /**
   * Dynamic class function for navigation links.
   * Returns active styling (blue with shadow) if the link matches the current URL.
   */
  const navItemClass = ({ isActive }) =>
    `relative flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-extrabold transition sm:gap-2 sm:px-3.5 ${
      isActive
        ? "bg-white text-[#1f6fe5] shadow-sm"
        : "text-slate-600 hover:bg-white/90 hover:text-slate-900"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-2 py-1.5 sm:gap-3 sm:px-3">
        
        {/* --- Logo Brand --- */}
        <NavLink className="flex items-center gap-3" to="/">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-500 bg-gradient-to-r from-cyan-400 to-blue-500 p-2.5 text-lg font-bold text-white">
            S
          </div>
          <p className="hidden text-xl font-extrabold text-slate-900 sm:block">
            Social hub
          </p>
        </NavLink>

        {/* --- Center Navigation Links --- */}
        <nav className="flex min-w-0 items-center gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50/90 px-1 py-1 sm:px-1.5">
          <NavLink to="/" className={navItemClass}>
            <LuHouse className="text-xl" />
            <span className="hidden sm:inline">Feed</span>
          </NavLink>
          
          <NavLink to="/profile" className={navItemClass}>
            <LuUser className="text-xl" />
            <span className="hidden sm:inline">Profile</span>
          </NavLink>
          
          <NavLink to="/notifications" className={navItemClass}>
            <div className="relative">
              <LuMessageCircle className="text-xl" />
              {/* Notification Badge */}
              {unreadCount > 0 && (
                <span className="absolute -right-2 -top-2 inline-flex min-w-4 items-center justify-center rounded-full bg-[#ef4444] px-1 text-[10px] font-black leading-4 text-white shadow-sm">
                  {unreadCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">Notifications</span>
          </NavLink>
        </nav>

        {/* --- Right Side: User Dropdown --- */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-1.5 transition hover:bg-slate-100"
          >
            {isLoadingProfile ? (
              <>
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="hidden h-4 w-24 rounded-lg md:block" />
              </>
            ) : (
              <>
                <img
                  src={profileData?.photo || dAvatar}
                  alt="user avatar"
                  className="h-8 w-8 rounded-full object-cover shadow-sm"
                />
                <span className="hidden max-w-35 truncate text-sm font-semibold text-slate-800 md:block">
                  {profileData?.name || "User"}
                </span>
              </>
            )}
            <LuMenu className="text-slate-500" />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 z-50 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
              <Link
                to="/profile"
                onClick={() => setIsDropdownOpen(false)}
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <LuUser className="text-xl" />
                Profile
              </Link>
              
              <Link
                to="/settings"
                onClick={() => setIsDropdownOpen(false)}
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <LuSettings className="text-xl" />
                Settings
              </Link>
              
              <div className="my-1 border-t border-slate-200"></div>
              
              <button
                onClick={handleLogout}
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
              >
                <LuLogOut className="text-xl" />
                Logout
              </button>
            </div>
          )}
        </div>
        
      </div>
    </header>
  );
}