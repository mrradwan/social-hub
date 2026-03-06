import React from "react";
import { NavLink } from "react-router";

// --- Icons ---
import { 
  LuNewspaper, 
  LuSparkles, 
  LuEarth, 
  LuBookmark 
} from "react-icons/lu";

// --- Navigation Configuration ---
// Array of navigation items to keep the JSX clean and easily expandable.
const navItems = [
  { to: "/", icon: <LuNewspaper size={18} />, label: "Feed" },
  { to: "/userposts", icon: <LuSparkles size={18} />, label: "My Posts" },
  { to: "/community", icon: <LuEarth size={18} />, label: "Community" },
  { to: "/saved", icon: <LuBookmark size={18} />, label: "Saved" },
];

/**
 * SidebarUI Component
 * Renders the main left-side navigation menu for desktop view.
 * Uses React Router's NavLink to automatically highlight the active page.
 * Hidden on mobile/tablet devices (below xl screens).
 */
export default function SidebarUI() {
  /**
   * Dynamic class function for navigation links.
   * Applies a blue highlight if the link is active, otherwise applies a default gray style.
   * * @param {Object} props - React Router NavLink props
   * @param {boolean} props.isActive - Whether the current route matches the link
   */
  const navClass = ({ isActive }) =>
    `mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-bold transition ${
      isActive
        ? "bg-[#e7f3ff] text-[#1877f2]" // Active styling
        : "text-slate-700 hover:bg-slate-100" // Default styling
    }`;

  return (
    <aside className="hidden h-fit space-y-3 xl:sticky xl:top-20 xl:block">
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        
        {/* Render navigation items dynamically */}
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={navClass}>
            {item.icon}
            {item.label}
          </NavLink>
        ))}
        
      </div>
    </aside>
  );
}