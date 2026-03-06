import React from "react";
import { Link, Outlet, useLocation } from "react-router";

// --- Images & Assets ---
import alexiMG from "../../img/avatar.png";
import formIMG from "../../img/hero-avatar.png";

// --- Icons ---
import { FiMessageSquare } from "react-icons/fi";
import { FaImage, FaBell, FaUsers, FaHeart, FaStar } from "react-icons/fa";

/**
 * AuthLayout Component
 * Serves as the layout wrapper for authentication pages (Login / Register).
 * Features a split-screen design with a dynamic promotional hero section on the left
 * and the authentication forms (rendered via Outlet) on the right.
 */
export default function AuthLayout() {
  const location = useLocation();
  const isRegister = location.pathname.includes("register");
  
  // Dynamic content based on the current route
  const heroContent = {
    title: isRegister ? "Connect with" : "Welcome Back",
    highlight: isRegister ? "amazing people" : "to SocialHub App",
    description: isRegister
      ? "Join millions of users sharing moments, ideas, and building meaningful connections every day."
      : "Sign in to connect with people all over the world.",
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      
      {/* --- Left Side: Hero Section --- */}
      <div
        className="flex h-full w-full flex-col justify-between bg-[#1447E6]/90 bg-cover bg-center bg-no-repeat p-10 text-white bg-blend-overlay"
        style={{ backgroundImage: `url(${formIMG})` }}
      >
        {/* Header / Logo */}
        <header>
          <h1>
            <Link to="/" className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-xl border border-white/30 bg-white/40 text-lg font-bold">
                S
              </span>
              <span className="text-2xl font-bold">SocialHub</span>
            </Link>
          </h1>
        </header>

        {/* Main Promotional Content */}
        <div className="space-y-6">
          
          {/* Dynamic Title & Description */}
          <div className="space-y-6">
            <h2 className="max-w-96 text-5xl font-bold leading-tight">
              {heroContent.title}{" "}
              <span className="bg-linear-to-r from-cyan-300 to-cyan-100 bg-clip-text pb-4 text-transparent">
                {heroContent.highlight}
              </span>
            </h2>
            <p className="max-w-md text-slate-100">
              {heroContent.description}
            </p>
          </div>

          {/* Feature Cards Grid */}
          <section className="space-y-6">
            <h3 className="sr-only">Platform Features</h3>
            <ul className="grid gap-4 lg:grid-cols-2">
              <li className="flex items-center gap-3 rounded-xl border border-white/30 bg-white/20 px-4 py-2 backdrop-blur-sm transition-transform duration-200 hover:scale-105">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-400/20 text-green-300">
                  <FiMessageSquare />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Real-time Chat</h4>
                  <span className="text-xs text-gray-200">Instant messaging</span>
                </div>
              </li>
              
              <li className="flex items-center gap-3 rounded-xl border border-white/30 bg-white/20 px-4 py-2 backdrop-blur-sm transition-transform duration-200 hover:scale-105">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-400/20 text-blue-100">
                  <FaImage />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Share Media</h4>
                  <span className="text-xs text-gray-200">Photos & videos</span>
                </div>
              </li>
              
              <li className="flex items-center gap-3 rounded-xl border border-white/30 bg-white/20 px-4 py-2 backdrop-blur-sm transition-transform duration-200 hover:scale-105">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-pink-400/20 text-pink-100">
                  <FaBell />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Smart Alerts</h4>
                  <span className="text-xs text-gray-200">Stay updated</span>
                </div>
              </li>
              
              <li className="flex items-center gap-3 rounded-xl border border-white/30 bg-white/20 px-4 py-2 backdrop-blur-sm transition-transform duration-200 hover:scale-105">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-400/20 text-green-300">
                  <FaUsers />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Communities</h4>
                  <span className="text-xs text-gray-200">Find your tribe</span>
                </div>
              </li>
            </ul>
          </section>

          {/* Platform Stats */}
          <section>
            <ul className="flex flex-wrap items-center gap-6">
              <li>
                <div className="flex items-center gap-2">
                  <FaUsers className="text-white/80" />
                  <span className="text-2xl font-bold text-white">2M+</span>
                </div>
                <p className="text-xs text-gray-300">Active Users</p>
              </li>
              <li>
                <div className="flex items-center gap-2">
                  <FaHeart className="text-white/80" />
                  <span className="text-2xl font-bold text-white">10M+</span>
                </div>
                <p className="text-xs text-gray-300">Posts Shared</p>
              </li>
              <li>
                <div className="flex items-center gap-2">
                  <FiMessageSquare className="text-white/80" />
                  <span className="text-2xl font-bold text-white">50M+</span>
                </div>
                <p className="text-xs text-gray-300">Messages Sent</p>
              </li>
            </ul>
          </section>
        </div>

        {/* Testimonial / Review Section */}
        <figure className="space-y-4 rounded-xl border border-white/30 bg-white/20 p-4 backdrop-blur-sm transition-colors duration-200 hover:bg-white/25 mt-8">
          <div className="flex gap-0.5 text-yellow-300">
            <FaStar />
            <FaStar />
            <FaStar />
            <FaStar />
            <FaStar />
          </div>
          <blockquote className="text-lg italic text-white">
            <p>
              "SocialHub has completely changed how I connect with friends and
              discover new communities. The experience is seamless!"
            </p>
          </blockquote>
          <figcaption className="flex items-center gap-3 overflow-hidden">
            <img
              src={alexiMG}
              alt="Alex Johnson"
              className="size-12 rounded-full object-cover"
            />
            <div className="flex flex-col">
              <cite className="font-bold not-italic text-white">Alex Johnson</cite>
              <span className="text-xs text-gray-300">Product Designer</span>
            </div>
          </figcaption>
        </figure>
      </div>

      {/* --- Right Side: Auth Forms (Outlet) --- */}
      {/* Added flex utilities to center the forms perfectly on the right side */}
      <div className="flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
      
    </div>
  );
}