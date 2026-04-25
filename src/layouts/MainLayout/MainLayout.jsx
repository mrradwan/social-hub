import React from "react";
import { Outlet, useLocation } from "react-router";

// --- Layout Components ---
import Navbar from "../../components/Navbar/Navbar";
import MobileNav from "../../components/MobileNav/MobileNav";
import SidebarUI from "../../components/SidebarUI/SidebarUI";
import Footer from "../../components/Footer/Footer"; // Acts as the right sidebar (Suggested Friends)

/**
 * MainLayout Component
 * Serves as the primary wrapper for the application's authenticated routes.
 * * Implements a responsive CSS Grid layout:
 * - Mobile/Tablet: Single-column stack (Navbar -> MobileNav -> Outlet).
 * - Desktop (xl): 3-column grid (SidebarUI -> Outlet -> Footer).
 * * Dynamically hides sidebars on specific focus-heavy pages (Profile, Settings, Suggested).
 */
export default function MainLayout() {
  const { pathname } = useLocation();

  // --- Layout Logic ---
  // Determine whether to hide the left and right sidebars based on the current route
  const hideSidebars = 
    pathname === "/settings" || 
    pathname.startsWith("/profile") || 
    pathname.includes("/suggested");

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      
      {/* Top Navigation Bar (Always visible) */}
      <Navbar />

      <div className="mx-auto max-w-7xl px-3 py-3.5">
        <main className="min-w-0">
          <div
            className={`grid gap-4 ${
              hideSidebars
                ? "mx-auto grid-cols-1 max-w-7xl" // 💡 Center the main content gracefully when sidebars are hidden
                : "xl:grid-cols-[240px_minmax(0,1fr)_300px]" // 3-column layout for large screens
            }`}
          >
            
            {/* --- Left Column: Navigation Sidebar --- */}
            {!hideSidebars && <SidebarUI />}

            {/* --- Center Column: Main Content Area --- */}
            {/* 💡 Wrapped MobileNav and Outlet together to ensure they strictly occupy the center grid cell */}
            <div className="flex min-w-0 flex-col">
              <MobileNav />
              <Outlet />
            </div>

            {/* --- Right Column: Suggested Friends Sidebar --- */}
            {!hideSidebars && <Footer />}
            
          </div>
        </main>
      </div>
      
    </div>
  );
}